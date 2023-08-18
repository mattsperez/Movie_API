const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const app = express();

let myLogger = (req, res, next) => {
    console.log(req.url);
    next();
};

let requestTime = (req, res, next) => {
    req.requestTime = Date.now();
    next();
};

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

//
app.use(myLogger);
app.use(requestTime);

app.get('/', (req, res) => {
    let responseText = 'Welcome to my Movie App';
    responseText += '<small>Requested at: ' + req.requestTime + '<small>';
    res.send(responseText);
});

// log.txt file
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

// bodyparser
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());
app.use(methodOverride());

// morgan common
app.use(morgan('combined', { stream: accessLogStream }));

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
app.use('/documentation.html', express.static('public'));

// error message
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('oops something broke!');
});

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on Port 8080.');
});