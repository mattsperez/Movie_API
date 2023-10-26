const mongoose = require('mongoose');
const Models = require('./models.js');
const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const methodOverride = require('method-override');
const app = express();
const { check, validationResult } = require('express-validator');

// Bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Cors
const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:52498'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            let message = 'The CORS policy for this application does not allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}))

// Authentication
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.use(methodOverride());

// Express
app.use(express.urlencoded({ extended: true }));

const Movies = Models.Movie;
const Users = Models.User;
// const Genres = Models.Genre;
// const Directors = Models.Director;


mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });


let myLogger = (req, res, next) => {
    console.log(req.url);
    next();
};

let requestTime = (req, res, next) => {
    req.requestTime = Date.now();
    next();
};

//Logger
app.use(myLogger);
app.use(requestTime);

// app.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
//     let responseText = 'Welcome to my Movie App';
//     responseText += '' + 'Requested at: ' + req.requestTime;
//     res.send(responseText);
// });

// READ Requests
app.get('/', (req, res) => {
    res.send('Welcome to my Movie App')
});

// READ ALL Users
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

// READ User by Username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// READ All Movies
app.get('/movies', async (req, res) => {
    await Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

// READ Movies by Title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), async (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// READ movie by genre
app.get('/movies/genres/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.genreName })
        .then((movie) => {
            res.status(200).json(movie.Genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


// READ movies by director name
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.directorName })
        .then((movie) => {
            res.json(movie.Director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


// CREATE new user
app.post('/users',
    [
        check('Username', 'username is required').isLength({ min: 5 }),
        check('Username', 'Username contains non aphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is rquired').not().isEmpty(),
        check('Email', 'Email does not appear to be validated').isEmail()
    ],
    async (req, res) => {
        let hashedPassword = Users.hashPassword(req.body.Password);
        await Users.findOne({ Username: req.body.Username })
            .then((user) => {
                if (user) {
                    return res.status(400).send(req.body.Username + 'already exists');
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
                        })
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    });

// UPDATE user name
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // Condition to check starts here
    if (req.user.Username !== req.params.Username) {
        return res.status(400).send("Permission denied");
    }
    // Conditions ends
    await Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $set:
            {
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            }
        },
        { new: true })
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        })

});

// CREATE user add favorite movie
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username },
        { $push: { FavoriteMovie: req.params.MovieID } },
        { new: true })
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// DELETE users favorite movie
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username },
        { $pull: { FavoriteMovie: req.params.MovieID } },
        { new: true })
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// DELETE user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// documentation from public folder
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

// public folder documentation
app.use('/documentation.html', express.static('public'));

// morgan common
app.use(morgan('combined'));

// error message middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('oops something broke!');
});

// listen for requests
const port = process.env.PORT || 52498;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port' + port);
});

// the abyss https://www.themoviedb.org/t/p/original/nCOdcQ4HrVBug0MsqvfVuMCijmx.jpg \
// the big sick https://www.themoviedb.org/t/p/original/7z9Aiuu3ynSE6dMiXg4kF1Q3C0v.jpg \
// the lion king https://www.themoviedb.org/t/p/original/pSfwXxP94xktZKn3UaeVe6VdFZl.jpg \
// barbie https://www.themoviedb.org/t/p/original/4ODTvg9r3LQt31zxX6y8YELDo6p.jpg \
// iron man https://www.themoviedb.org/t/p/original/78lPtwv72eTNqFW9COBYI0dWDJa.jpg \
// lady bird https://www.themoviedb.org/t/p/original/nxO9loVHMz7QAwNJDBZCfQhZyY9.jpg \
// true lies https://www.themoviedb.org/t/p/original/pweFTnzzTfGK68woSVkiTgjLzWm.jpg \
// avatar https://www.themoviedb.org/t/p/original/6EiRUJpuoeQPghrs3YNktfnqOVh.jpg \
// elf https://www.themoviedb.org/t/p/original/oOleziEempUPu96jkGs0Pj6tKxj.jpg \
// tammy eye https://www.themoviedb.org/t/p/original/vw5WXyHqAfnhmGpSjpyZh34xau3.jpg
