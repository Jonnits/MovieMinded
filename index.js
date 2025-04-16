const express = require('express');
const mongoose = require('mongoose');
const Models = require('./models.js');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { check, validationResult } = require('express-validator');
const passport = require('passport');
require('./passport');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());

const cors = require('cors');

const allowedOrigins = ['http://localhost:1234', 'http://localhost:53498'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy does not allow access from this origin'));
    }
  }
}));

let auth = require('./auth')(app);

// READ/ GET all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movies = await Movies.find();
    res.status(200).json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});

// READ/ GET specific movie
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movie = await Movies.findOne({ Title: req.params.title });
    if (!movie) return res.status(404).send('No movie found.');
    res.status(200).json(movie);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// CREATE/ POST movie to favorites
app.post('/users/:Username/movies/:MovieTitle', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const decodedTitle = decodeURIComponent(req.params.MovieTitle);
    const username = req.params.Username;

    console.log(`Incoming add-favorite request`);
    console.log(`Username: ${username}`);
    console.log(`Encoded title: ${req.params.MovieTitle}`);
    console.log(`Decoded title: ${decodedTitle}`);

    const movie = await Movies.findOne({ Title: { $regex: new RegExp(`^${decodedTitle}$`, 'i') } });
    console.log("Movie found:", movie ? movie.Title : "No movie found");

    if (!movie) {
      return res.status(404).send("Movie not found");
    }

    const updatedUser = await Users.findOneAndUpdate(
      { Username: username },
      { $addToSet: { FavoriteMovies: movie._id } },
      { new: true }
    );

    return res.json(updatedUser);
  } catch (error) {
    console.error("Error adding favorite movie:", error);
    return res.status(500).send("Internal Server Error");
  }
});

// READ/ GET movies by genre
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movies = await Movies.find({ 'Genre.Name': req.params.genreName });
    if (movies.length === 0) return res.status(404).send('No movies found for this genre.');
    res.status(200).json(movies);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// READ/ GET director by name
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movies = await Movies.find({ 'Director.Name': req.params.directorName });
    if (movies.length === 0) return res.status(404).send('No movies found by this director.');
    res.status(200).json(movies);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// CRUD operations for users
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const users = await Users.find();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

app.get('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await Users.findOne({ Username: req.params.Username });
    if (!user) return res.status(404).send('User not found.');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

app.post('/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }).isAlphanumeric(),
    check('Password', 'Password must be at least 5 characters long').isLength({ min: 5 }),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      let hashedPassword = Users.hashPassword(req.body.Password);
      let userExists = await Users.findOne({ Username: req.body.Username });
      if (userExists) {
        return res.status(400).send(req.body.Username + ' already exists');
      }
      let newUser = await Users.create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      });
      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error: ' + error);
    }
  });

// UPDATE user info (new password)
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }

  try {
    let updateData = {};
    if (req.body.Username) updateData.Username = req.body.Username;
    if (req.body.NewPassword) updateData.Password = Users.hashPassword(req.body.NewPassword);
    if (req.body.Email) updateData.Email = req.body.Email;
    if (req.body.Birthday) updateData.Birthday = req.body.Birthday;

    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $set: updateData },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// DELETE/ DELETE existing user by username
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const deletedUser = await Users.findOneAndDelete({ Username: req.params.username });
    if (!deletedUser) return res.status(404).send('No such user.');
    res.status(200).send(`User ${req.params.username} has been deleted.`);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// DELETE/ DELETE movie from favorites
app.delete('/users/:Username/movies/:MovieTitle', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.Username !== req.params.Username) {
    return res.status(403).send('Permission denied');
  }

  try {
    const decodedTitle = decodeURIComponent(req.params.MovieTitle);
    const movie = await Movies.findOne({ Title: { $regex: new RegExp(`^${decodedTitle}$`, 'i') } });
    if (!movie) return res.status(404).send('Movie not found');

    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { FavoriteMovies: movie._id } },
      { new: true }
    ).populate('FavoriteMovies');

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// Home page
app.get('/', (req, res) => {
  res.send('Which movies move you?');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
