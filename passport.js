const passport = require('passport'),
LocalStrategy = require('passprt-local').Strategy,
Models = require('.models.js'),
passportJWT = require('passport-jwt');

let Users = Models.User,
JWTStrategy = passportJWT.Strategy,
ExtractJWT = passportJWT.ExtractJWT;

passport.use(
    new LocalStrategy(
        {
            usernameField
        }
    )
)