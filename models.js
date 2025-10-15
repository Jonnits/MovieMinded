const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * @typedef Genre
 * @property {string} Name
 * @property {string} [Description]
 */

/**
 * @typedef Director
 * @property {string} Name
 * @property {string} [Bio]
 */

/**
 * @typedef Movie
 * @property {string} Title
 * @property {string} Description
 * @property {Genre} Genre
 * @property {Director} Director
 * @property {string[]} [Actors]
 * @property {string} [ImagePath]
 * @property {boolean} [Featured]
 */

let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});

/**
 * @typedef User
 * @property {string} Username
 * @property {string} Password
 * @property {string} Email
 * @property {Date} [Birthday]
 * @property {ObjectId[]} [FavoriteMovies] - References Movie documents
 */

/**
 * @typedef {string} ObjectId
 */

let userSchema = mongoose.Schema ({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
  };
  
  userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
  };

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;