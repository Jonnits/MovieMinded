const express = require('express');
const mongoose = require('mongoose');
const Models = require('./models.js');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect("mongodb://127.0.0.1:27017/test")
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());

// let users = [

//];

// let movies = [
   // { title: 'The Shawshank Redemption', director: 'Frank Darabont', imageUrl: 'https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_.jpg', year: 1994, genre: 'Drama', description: 'A banker convicted of uxoricide forms a friendship over a quarter century with a hardened convict, while maintaining his innocence and trying to remain hopeful through simple compassion.' },
   // { title: 'The Godfather', director: 'Francis Ford Coppola', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', year: 1972, genre: 'Crime', description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.' },
   // { title: 'The Dark Knight', director: 'Christopher Nolan', imageUrl: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg', year: 2008, genre: 'Action', description: 'When a menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman, James Gordon and Harvey Dent must work together to put an end to the madness.' },
   // { title: 'The Godfather Part II', director: 'Francis Ford Coppola', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNzc1OWY5MjktZDllMi00ZDEzLWEwMGItYjk1YmRhYjBjNTVlXkEyXkFqcGc@._V1_.jpg', year: 1974, genre: 'Crime', description: 'The early life and career of Vito Corleone in 1920s New York City is portrayed, while his son, Michael, expands and tightens his grip on the family crime syndicate.' },
   // { title: '12 Angry Men', director: 'Sidney Lumet', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/12_Angry_Men_%281957_film_poster%29.jpg/1200px-12_Angry_Men_%281957_film_poster%29.jpg', year: 1957, genre: 'Drama', description: 'The jury in a New York City murder trial is frustrated by a single member whose skeptical caution forces them to more carefully consider the evidence before jumping to a hasty verdict.' },
   // { title: 'The Lord of the Rings: The Return of the King', director: 'Peter Jackson', imageUrl: 'https://m.media-amazon.com/images/M/MV5BMTZkMjBjNWMtZGI5OC00MGU0LTk4ZTItODg2NWM3NTVmNWQ4XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', year: 2003, genre: 'Fantasy', description: 'Gandalf and Aragorn lead the World of Men against Saurons army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.' },
   // { title: 'Schindlers List', director: 'Steven Spielberg', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNjM1ZDQxYWUtMzQyZS00MTE1LWJmZGYtNGUyNTdlYjM3ZmVmXkEyXkFqcGc@._V1_.jpg', year: 1993, genre: 'Tragedy', description: 'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.' },
   // { title: 'Pulp Fiction', director: 'Quentin Tarantino', imageUrl: 'https://m.media-amazon.com/images/M/MV5BYTViYTE3ZGQtNDBlMC00ZTAyLTkyODMtZGRiZDg0MjA2YThkXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', year: 1994, genre: 'Crime', description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.' },
   // { title: 'The Lord of the Rings: The Fellowship of the Ring', director: 'Peter Jackson', imageUrl: '', year: 2001, genre: 'Fantasy', description: 'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.' },
   // { title: 'The Good, the Bad, and the Ugly', director: 'Sergio Leone', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/4/45/Good_the_bad_and_the_ugly_poster.jpg', year: 1966, genre: 'Spaghetti Western', description: 'A bounty-hunting scam joins two men in an uneasy alliance against a third in a race to find a fortune in gold buried in a remote cemetery.' },
//];

// READ/ GET all movies list

// READ/ GET all movies
app.get('/movies', async (req, res) => {
    try {
        const movies = await Movies.find();
        res.status(200).json(movies);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// READ/ GET specific movie
app.get('/movies/:title', async (req, res) => {
    try {
        const movie = await Movies.findOne({ Title: req.params.title });
        if (!movie) return res.status(404).send('No movie found.');
        res.status(200).json(movie);
    } catch (err) {
        res.status(500).send('Error: ' + err);
    }
});

// READ/ GET movies by genre
app.get('/movies/genre/:genreName', async (req, res) => {
    try {
        const movies = await Movies.find({ 'Genre.Name': req.params.genreName });
        if (movies.length === 0) return res.status(404).send('No movies found for this genre.');
        res.status(200).json(movies);
    } catch (err) {
        res.status(500).send('Error: ' + err);
    }
});

// READ/ GET director by name
app.get('/movies/directors/:directorName', async (req, res) => {
    try {
        const movies = await Movies.find({ 'Director.Name': req.params.directorName });
        if (movies.length === 0) return res.status(404).send('No movies found by this director.');
        res.status(200).json(movies);
    } catch (err) {
        res.status(500).send('Error: ' + err);
    }
});

// READ/ GET all users
app.get('/users', async (req, res) => {
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
app.get('/users/:Username', async (req, res) => {
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
/* Expects JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', async (req, res) => {
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: req.body.Password,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// UPDATE/ PUT user info
app.put('/users/:id', async (req, res) => {
    try {
        const updatedUser = await Users.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) return res.status(404).send('No such user.');
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).send('Error: ' + err);
    }
});

// CREATE/ POST a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
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
app.delete('/users/:Username/movies/:MovieID', async (req, res) => {
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
app.delete('/users/:username', async (req, res) => {
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

app.listen(4000, () => console.log('Server is running on port 4000'));