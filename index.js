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
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
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


mongoose.connect('process.env.CONNECTION_URI', { useNewUrlParser: true, useUnifiedTopology: true });

let myLogger = (req, res, next) => {
    console.log(req.url);
    next();
};

let requestTime = (req, res, next) => {
    req.requestTime = Date.now();
    next();
};
// Users
// let users = [
//     {
//         id: 1,
//         name: 'Anne',
//         favortieMovies: []
//     },
//     {
//         id: 2,
//         name: 'Matt',
//         favortieMovies: ['Elf']
//     },
// ];

// Movies
// let movies = [
//     {
//         Title: 'Nacho Libre',
//         Year: 2006,
//         Rating: 5.9,
//         Description: 'Berated all his life by those around him, a monk follows his dream and dons a mask to moonlight as a Luchador (Mexican Wrestler)',
//         Comments: ['He is not lean. He is not mean. He is nacho average hero.'],
//         Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
//         Director: { Name: 'Jared Hess', Bio: 'Jared Hess is an American writer, producer, and director.', Birth: 1979 },
//         ImageURL: 'https://example.com/nacholibre.jpg',
//         Featured: true
//     },
//     {
//         Title: 'Elf',
//         Year: 2003,
//         Rating: 7.1,
//         Description: 'Raised as an oversized elf, Buddy travels from the North Pole to New York City to meet his biological father, Walter Hobbs, who does not know he exists and is in desperate need of some Christmas spirit.',
//         Comments: ['A Comedy of Elf-fish Proportions.'],
//         Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
//         Director: { Name: 'Jon Favreau', Bio: 'Jon Favreau is an american actor, writer and producer.', Birth: 1966 },
//         ImageURL: 'https://example.com/elf.jpg',
//         Featured: false
//     },
//     {
//         Title: 'Barbie',
//         Year: 2023,
//         Rating: 7.4,
//         Description: 'Barbie suffers a crisis that leads her to question her world and her existence.',
//         Comments: ['She is everything. He is just Ken.'],
//         Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
//         Director: { Name: 'Greta Gerwig', Bio: 'Chris Columbus is an American writer, actress, and director.', Birth: 1983 },
//         ImageURL: 'https://example.com/homealone.jpg',
//         Featured: true
//     },
//     {
//         Title: 'The Super Mario Bros. Movie',
//         Year: 2023,
//         Rating: 7.1,
//         Description: 'A plumber named Mario travels through an underground labyrinth with is brother, Luigi, trying to save a capture princess.',
//         Comments: ['Let\'s-a go!'],
//         Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
//         Director: { Name: 'Aaron Horvath', Bio: 'Aaron Horvath is an american director, writer and producer.', Birth: 1980 },
//         ImageURL: 'https://example.com/supermariobros.jpg',
//         Featured: false
//     },
//     {
//         Title: 'Guardians of the Galaxy',
//         Year: 2014,
//         Rating: 8.0,
//         Description: 'A group of intergalactic criminals must pull together to stop a fanatical warrior with plans to purge the universe.',
//         Comments: ['You\'re welcome.'],
//         Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
//         Director: { Name: 'James Gunn', Bio: 'James Gunn is an American writer, producer, and director.', Birth: 1966 },
//         ImageURL: 'https://example.com/guardiansofthegalaxy.jpg',
//         Featured: true
//     },
//     {
//         Title: 'What We Do in the Shadows: Interviews with Some Vampires',
//         Year: 2005,
//         Rating: 7.4,
//         Description: 'Three male vampires who share an apartment are interviewed by a TV crew.',
//         Comments: ['Eternity Sucks'],
//         Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
//         Director: { Name: 'Taika Waititi', Bio: 'Taika Waititi is a New Zealander actor, writer and producer.', Birth: 1980 },
//         ImageURL: 'https://example.com/whatwedointheshadows.jpg',
//         Featured: false
//     },
//     {
//         Title: 'Surf\'s Up',
//         Year: 2007,
//         Rating: 6.7,
//         Description: 'A behind-the-scenes look at the annual Penguin World Surfing Championship, and its newest participant, up-and-comer Cody Maverick.',
//         Comments: ['Hang Six Summer 2007'],
//         Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
//         Director: { Name: 'Chris Buck', Bio: 'James Gunn is an American writer, animation department, and director.', Birth: 1958 },
//         ImageURL: 'https://example.com/surfsup.jpg',
//         Featured: true
//     },
//     {
//         Title: 'The Devil Wears Prada',
//         Year: 2006,
//         Rating: 6.9,
//         Description: 'A smart but sensible new graduate lands a job as an assistant to Miranda Priestly, the demanding editor-in-chief of a high fashion magazine.',
//         Comments: ['Hell on Heels.'],
//         Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
//         Director: { Name: 'David Frankel', Bio: 'David Frankel is an american director, production manager and producer.', Birth: 1959 },
//         ImageURL: 'https://example.com/thedevilwearsprada.jpg',
//         Featured: false
//     },
//     {
//         Title: 'Hot Fuzz',
//         Year: 2007,
//         Rating: 7.8,
//         Description: 'A skilled London police officer, after irritating superiors with his embarrassing effectiveness, is transferred to a village where the easygoing officers object to his fervor for regulations, as a string of grisly murders strikes the town.',
//         Comments: ['They\'re bad boys. They\'re die hards. They\'re lethal weapons. They are...Hot Fuzz.'],
//         Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
//         Director: { Name: 'Edgar Wright', Bio: 'Edgar Wright is an English writer, actor, and director.', Birth: 1974 },
//         ImageURL: 'https://example.com/hotfuzz.jpg',
//         Featured: true
//     },
//     {
//         Title: 'Spaceballs',
//         Year: 1987,
//         Rating: 7.1,
//         Description: 'A star-pilot for hire and his trusty sidekick must come to the rescue of a princess and save Planet Druidia from the clutches of the evil Spaceballs.',
//         Comments: ['May The Farce Be With You.'],
//         Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
//         Director: { Name: 'Mel Brooks', Bio: 'Mel Brooks is an american actor, writer and producer.', Birth: 1926 },
//         ImageURL: 'https://example.com/spaceballs.jpg',
//         Featured: false
//     }
// ];

//Logger
app.use(myLogger);
app.use(requestTime);

app.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    let responseText = 'Welcome to my Movie App - ';
    responseText += '' + 'Requested at: ' + req.requestTime;
    res.send(responseText);
});

// READ Requests
app.get('/', (req, res) => {
    res.send('Welcome to my Movie App')
});

// READ ALL Users
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

// READ User by Username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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

// READ Movies by Title
app.get("/movies/:Title", passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/movies/genres/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), (req, res) => {
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
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port' + port);
});