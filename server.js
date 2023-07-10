const express = require('express');
const app = express();
const path = require('path'),
mongoose = require('mongoose'),
connect = mongoose.connect,
morgan = require('morgan'),
cors = require('cors'),
expressSession = require('express-session'),
cookieParser = require('cookie-parser'),
fs = require('fs'),
PORT = process.env.PORT || 10005,
passport = require('passport');
require('dotenv/config');
connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to the db');
    })
    .catch((err) => {
        console.log('Some error occured while connecting to the db', err)
    })

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({
    limit: '50mb'
}));
app.use(express.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: true
}));
app.use(expressSession({
    secret: 'My secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: "strict",
        httpOnly: false
    }
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(process.cwd(), 'build')));

const User = require('./models/user'),
LocalStrategy = require('passport-local');

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new LocalStrategy(User.authenticate()));

app.get('/', (req, res) => {
    res.sendFile("index.html");
})

//Routes
const authRoutes = require('./routes/auth'),
profileRoutes = require("./routes/profile"),
indexRoutes = require("./routes/index"),
movieRoutes = require("./routes/movie");

// Using the routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/movie', movieRoutes);

app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`);
})