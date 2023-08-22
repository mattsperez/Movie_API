const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const uuid = require('uuid');
const app = express();

let myLogger = (req, res, next) => {
    console.log(req.url);
    next();
};

let requestTime = (req, res, next) => {
    req.requestTime = Date.now();
    next();
};
// Users
let users = [
    {
        id: 1,
        name: 'Anne',
        favortieMovies: []
    },
    {
        id: 2,
        name: 'Matt',
        favortieMovies: ['Elf']
    },
];

// Movies
let movies = [
    {
        Title: 'Nacho Libre',
        Year: 2006,
        Rating: 5.9,
        Description: 'Berated all his life by those around him, a monk follows his dream and dons a mask to moonlight as a Luchador (Mexican Wrestler)',
        Comments: ['He is not lean. He is not mean. He is nacho average hero.'],
        Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
        Director: { Name: 'Jared Hess', Bio: 'Jared Hess is an American writer, producer, and director.', Birth: 1979 },
        ImageURL: 'https://example.com/nacholibre.jpg',
        Featured: true
    },
    {
        Title: 'Elf',
        Year: 2003,
        Rating: 7.1,
        Description: 'Raised as an oversized elf, Buddy travels from the North Pole to New York City to meet his biological father, Walter Hobbs, who does not know he exists and is in desperate need of some Christmas spirit.',
        Comments: ['A Comedy of Elf-fish Proportions.'],
        Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
        Director: { Name: 'Jon Favreau', Bio: 'Jon Favreau is an american actor, writer and producer.', Birth: 1966 },
        ImageURL: 'https://example.com/elf.jpg',
        Featured: false
    },
    {
        Title: 'Barbie',
        Year: 2023,
        Rating: 7.4,
        Description: 'Barbie suffers a crisis that leads her to question her world and her existence.',
        Comments: ['She is everything. He is just Ken.'],
        Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
        Director: { Name: 'Greta Gerwig', Bio: 'Chris Columbus is an American writer, actress, and director.', Birth: 1983 },
        ImageURL: 'https://example.com/homealone.jpg',
        Featured: true
    },
    {
        Title: 'The Super Mario Bros. Movie',
        Year: 2023,
        Rating: 7.1,
        Description: 'A plumber named Mario travels through an underground labyrinth with is brother, Luigi, trying to save a capture princess.',
        Comments: ['Let\'s-a go!'],
        Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
        Director: { Name: 'Aaron Horvath', Bio: 'Aaron Horvath is an american director, writer and producer.', Birth: 1980 },
        ImageURL: 'https://example.com/supermariobros.jpg',
        Featured: false
    },
    {
        Title: 'Guardians of the Galaxy',
        Year: 2014,
        Rating: 8.0,
        Description: 'A group of intergalactic criminals must pull together to stop a fanatical warrior with plans to purge the universe.',
        Comments: ['You\'re welcome.'],
        Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
        Director: { Name: 'James Gunn', Bio: 'James Gunn is an American writer, producer, and director.', Birth: 1966 },
        ImageURL: 'https://example.com/guardiansofthegalaxy.jpg',
        Featured: true
    },
    {
        Title: 'What We Do in the Shadows: Interviews with Some Vampires',
        Year: 2005,
        Rating: 7.4,
        Description: 'Three male vampires who share an apartment are interviewed by a TV crew.',
        Comments: ['Eternity Sucks'],
        Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
        Director: { Name: 'Taika Waititi', Bio: 'Taika Waititi is a New Zealander actor, writer and producer.', Birth: 1980 },
        ImageURL: 'https://example.com/whatwedointheshadows.jpg',
        Featured: false
    },
    {
        Title: 'Surf\'s Up',
        Year: 2007,
        Rating: 6.7,
        Description: 'A behind-the-scenes look at the annual Penguin World Surfing Championship, and its newest participant, up-and-comer Cody Maverick.',
        Comments: ['Hang Six Summer 2007'],
        Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
        Director: { Name: 'Chris Buck', Bio: 'James Gunn is an American writer, animation department, and director.', Birth: 1958 },
        ImageURL: 'https://example.com/surfsup.jpg',
        Featured: true
    },
    {
        Title: 'The Devil Wears Prada',
        Year: 2006,
        Rating: 6.9,
        Description: 'A smart but sensible new graduate lands a job as an assistant to Miranda Priestly, the demanding editor-in-chief of a high fashion magazine.',
        Comments: ['Hell on Heels.'],
        Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
        Director: { Name: 'David Frankel', Bio: 'David Frankel is an american director, production manager and producer.', Birth: 1959 },
        ImageURL: 'https://example.com/thedevilwearsprada.jpg',
        Featured: false
    },
    {
        Title: 'Hot Fuzz',
        Year: 2007,
        Rating: 7.8,
        Description: 'A skilled London police officer, after irritating superiors with his embarrassing effectiveness, is transferred to a village where the easygoing officers object to his fervor for regulations, as a string of grisly murders strikes the town.',
        Comments: ['They\'re bad boys. They\'re die hards. They\'re lethal weapons. They are...Hot Fuzz.'],
        Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
        Director: { Name: 'Edgar Wright', Bio: 'Edgar Wright is an English writer, actor, and director.', Birth: 1974 },
        ImageURL: 'https://example.com/hotfuzz.jpg',
        Featured: true
    },
    {
        Title: 'Spaceballs',
        Year: 1987,
        Rating: 7.1,
        Description: 'A star-pilot for hire and his trusty sidekick must come to the rescue of a princess and save Planet Druidia from the clutches of the evil Spaceballs.',
        Comments: ['May The Farce Be With You.'],
        Genre: { Name: 'Comedy', Description: 'places characters in amusing situations for the sake of humor' },
        Director: { Name: 'Mel Brooks', Bio: 'Mel Brooks is an american actor, writer and producer.', Birth: 1926 },
        ImageURL: 'https://example.com/spaceballs.jpg',
        Featured: false
    }
];

//Logger
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

// READ users
app.get('/users', (req, res) => {
    res.status(200).json(users);
});


// READ all movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

// READ movies by title
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find(movie => movie.Title === title);

    if (movie) {
        return res.status(200).json(movie);
    } else {
        res.status(400).send('no such movie');
    }
});

// READ movie by genre
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;

    if (genre) {
        return res.status(200).json(genre);
    } else {
        res.status(400).send('no such genre');
    }
});
// READ movies by director name
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.Director.Name === directorName).Director;

    if (director) {
        return res.status(200).json(director);
    } else {
        res.status(400).send('no such director');
    }
});

// CREATE new user
app.post('/users', (req, res)=> {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('users need name')
    }
});

// UPDATE user name
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id ); 

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send("user not found")
    }
});

// CREATE user add favorite movie
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        user.favortieMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
    } else {
        res.status(400).send("user not found")
    }
});

// DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        user.favortieMovies = user.favortieMovies.filter( title => title != movieTitle)
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
    } else {
        res.status(400).send("user not found")
    }
});

// DELETE
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        users = users.filter( user => user.id != id)
        res.status(200).send(`user ${id} has been deleted`);
    } else {
        res.status(400).send("user not found")
    }
});

// documentation from public folder
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

// public folder documentation
app.use('/documentation.html', express.static('public'));

// error message middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('oops something broke!');
});

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on Port 8080.');
});