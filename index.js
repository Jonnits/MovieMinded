const express = require('express');
const mongoose = require('mongoose');
const Models = require('./models.js');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect("mongodb://127.0.0.1:27017/test")
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

// READ/ GET all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
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

// READ/ GET all users
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ/ GET a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// CREATE/ ADD new user
app.post('/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password must be at least 5 characters long').isLength({min: 5}),
    check('Password', 'Password contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], async (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// UPDATE user info
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), [
  check('Username', 'Username is required').optional().isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').optional().isAlphanumeric(),
  check('NewPassword', 'Password must be at least 5 characters long').optional().isLength({min: 5}),
  check('NewPassword', 'Password contains non alphanumeric characters - not allowed.').optional().isAlphanumeric(),
  check('Email', 'Email does not appear to be valid').optional().isEmail()
], async (req, res) => {
  if(req.user.Username !== req.params.Username){
    return res.status(400).send('Permission denied');
  }

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const user = await Users.findOne({ Username: req.params.Username });
    if (!user) {
      return res.status(404).send('User not found');
    }

    if (!req.body.CurrentPassword || !user.validatePassword(req.body.CurrentPassword)) {
      return res.status(401).send('Current password is incorrect');
    }

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

// CREATE/ POST a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }) 
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// DELETE/ DELETE movie from favorites list
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
      const updatedUser = await Users.findOneAndUpdate(
          { Username: req.params.Username },
          { $pull: { FavoriteMovies: req.params.MovieID } },
          { new: true }
      );
      if (!updatedUser) return res.status(404).send('No such user or movie not in favorites.');
      res.status(200).json(updatedUser);
  } catch (err) {
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

// home page
app.get('/', (req, res) => {
    res.send('Which movies move you?');
})

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});