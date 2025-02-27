# MovieMinded

## About This Application

MovieMinded is a REST API that provides users with access to key information about their favorite movies, genres, and directors. Users can sign up, update their personal profiles, and create personalized lists of favorite movies.

## How to Use This Application

1. **Sign Up**: Create a new account to access all features.
2. **Profile Management**: Update your personal information as needed.
3. **Browse Movies**: Explore a vast collection of movies, genres, and director details.
4. **Favorite Lists**: Add movies to your personalized favorites list for quick access.

## Project Dependencies

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing user and movie data.
- **Mongoose**: ODM for MongoDB and Node.js.
- **Passport.js**: Authentication middleware for Node.js.

## API Endpoints

- `POST /users`: Register a new user.
- `GET /users/:username`: Retrieve user profile information.
- `PUT /users/:username`: Update user profile information.
- `DELETE /users/:username`: Remove a user account.
- `GET /movies`: Retrieve a list of all movies.
- `GET /movies/:title`: Retrieve data about a specific movie.
- `GET /genres/:name`: Retrieve data about a specific genre.
- `GET /directors/:name`: Retrieve data about a specific director.
- `POST /users/:username/movies/:movieId`: Add a movie to a user's favorites.
- `DELETE /users/:username/movies/:movieId`: Remove a movie from a user's favorites.

## Where Can I Access This Application?

You can find the live application here: [MovieMinded Application](https://movieminded-d764560749d0.herokuapp.com/)
The source code and documentation are available on GitHub: [MovieMinded Repository](https://github.com/Jonnits/MovieMinded)
