const express = require('express');
const app = express();

let topMovies = [
    {
        title: 'Movie 1',
        director: 'John Doe'
    },
    {
        title: 'Movie 2',
        director: 'John Doe'
    },
    {
        title: 'Movie 3',
        director: 'John Doe'
    },
    {
        title: 'Movie 4',
        director: 'John Doe'
    },
    {
        title: 'Movie 5',
        director: 'John Doe'
    },
    {
        title: 'Movie 6',
        director: 'John Doe'
    },
    {
        title: 'Movie 7',
        director: 'John Doe'
    },
    {
        title: 'Movie 8',
        director: 'John Doe'
    },
    {
        title: 'Movie 9',
        director: 'John Doe'
    },
    {
        title: 'Movie 10',
        director: 'John Doe'
    }
];
// GET requests
app.get('/', (req, res) => {
    res.send('Welcome to my Movie App')
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

// public folder documentation
app.use(express.static('public'));

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});