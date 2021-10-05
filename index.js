// Setting env file while not in production. It will store the data into process
if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Requires
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoDBStore = require("connect-mongo");
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override'); //used for method override on .GET and POST.
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSantize = require('express-mongo-sanitize');

// routes
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRouters = require('./routes/users');


const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'; // change to this one for deployment.
// MongoDB connection through Mongoose
// 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl, {});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

// View Engines
app.engine('ejs', ejsMate); // an engine to use to run EJS. 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// This is to make sure that express will actually parse any post requests sent back.
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Use express-mongo-santize to make sure no-sql injections are caught.
app.use(mongoSantize({
    replaceWith: '_'
}));

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on('error', function(e) {
    console.log('Session Store Error', e)
})

const sessionConfig = {
    store, // passes our store variable as our store to store our session info on Mongo
    name: 'session', // changes the default name of our session cookie
    secret,
    resave: false,
    saveUninitialized: true,
    // This is setting cookie settings. See docs for questions. 
    cookie: {
        // secure: true, // This only works when we deploy and makes sure that things can only be configured over a secure connection (HTTPS). Add this back in when going live.
        httpOnly: true, // makes it so someone can not see our sessions cookies
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

// app.use for session and flash()
app.use(session(sessionConfig));
app.use(flash());
// Helmet setup to make sure URLs will run from sites used. If we change anything in the app we need to add this.
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://code.jquery.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dhupzqyiq/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Passport 
app.use(passport.initialize());
app.use(passport.session()); // Needed to make sure we can have persistent login sessions. Session needs to be used before this.
passport.use(new LocalStrategy(User.authenticate())); // Telling passport to use the local stregy for authentication. And the method is on our User model.

// Tells passport how to serialize a user and deserialize a user based off our our User model.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware for every single request we will have access to 'success' message on every route we pass.
app.use((req, res, next) => {
    console.log(req.session);
    res.locals.currentUser = req.user; // This is so every single request has access to the req.user that if there is one. For login/logout feature
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// routes set up.
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRouters);

// Home page
app.get('/', (req, res) => {
    res.render('home');
});

// For any other request that doesn't match correct paths. Must be at bottom
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Error message
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) err.message = 'Oh no, something went wrong!';
    res.status(statusCode).render('error', { err });
});

// App listening
const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Serving on port ${port}`);
});