const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(morgan('dev'));

app.get('/movies', (req, res) => {
    const topMovies = [
{ title: 'Movie 1', year: 2024, genre: 'Action' },
{ title: 'Movie 2', year: 2023, genre: 'Drama' },
{ title: 'Movie 3', year: 2022, genre: 'Comedy' },
{ title: 'Movie 4', year: 2021, genre: 'Documentary' },
{ title: 'Movie 5', year: 2020, genre: 'Horror' },
{ title: 'Movie 6', year: 2019, genre: 'Thriller' },
{ title: 'Movie 7', year: 2018, genre: 'Crime' },
{ title: 'Movie 8', year: 2017, genre: 'Science Fiction' },
{ title: 'Movie 9', year: 2016, genre: 'Western' },
{ title: 'Movie 10', year: 2015, genre: 'Romance' },
    ];
res.json(topMovies);
});

app.get('/', (req, res) => {
    res.send('Which movies move you?');
});

app.use(express.static('public'));

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});