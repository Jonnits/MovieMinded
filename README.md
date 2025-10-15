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

Most endpoints require a JWT in `Authorization: Bearer <token>`.

- `POST /login`: Obtain a JWT. Response: `{ user, token }`.
- `POST /users`: Register a new user.
- `GET /users`: Retrieve all users.
- `GET /users/:Username`: Retrieve user profile information.
- `PUT /users/:Username`: Update user profile information (Username, NewPassword, Email, Birthday).
- `DELETE /users/:username`: Remove a user account.
- `GET /movies`: Retrieve a list of all movies.
- `GET /movies/:title`: Retrieve data about a specific movie by title.
- `GET /movies/genre/:genreName`: Retrieve movies by genre name.
- `GET /movies/directors/:directorName`: Retrieve movies by director name.
- `POST /users/:Username/movies/:MovieTitle`: Add a movie to a user's favorites (by title).
- `DELETE /users/:Username/movies/:MovieTitle`: Remove a movie from a user's favorites (by title).

## Authentication

- Login via `POST /login` with valid credentials to receive `{ user, token }`.
- Pass the token in `Authorization: Bearer <token>` for protected routes.

## Base URLs

- Local: `http://localhost:8080`
- Production: `https://movieminded-d764560749d0.herokuapp.com`

## Models

User:

```
{
  "Username": "string",
  "Password": "string",
  "Email": "string",
  "Birthday": "YYYY-MM-DD",
  "FavoriteMovies": ["ObjectId", ...]
}
```

Movie:

```
{
  "Title": "string",
  "Description": "string",
  "Genre": { "Name": "string", "Description": "string" },
  "Director": { "Name": "string", "Bio": "string" },
  "Actors": ["string"],
  "ImagePath": "string",
  "Featured": true
}
```

## Examples

Get all movies:

```
curl -H "Authorization: Bearer <token>" \
  https://movieminded-d764560749d0.herokuapp.com/movies
```

Add favorite by title:

```
curl -X POST -H "Authorization: Bearer <token>" \
  https://movieminded-d764560749d0.herokuapp.com/users/<Username>/movies/<MovieTitle>
```

## Validation and Errors

- `POST /users`: Username min 5 (alphanumeric), Password min 5, valid Email. Returns 422 for validation errors, 400 if username exists.
- Many routes return 404 if the resource is not found; 403 when the path username differs from the token user; 500 for server errors.

## Where Can I Access This Application?

- You can find the live application here: [MovieMinded Application](https://movieminded-d764560749d0.herokuapp.com/)
- The source code and documentation are available on GitHub: [MovieMinded Repository](https://github.com/Jonnits/MovieMinded)
