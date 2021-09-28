// Requires
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

// routes
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

// MongoDB connection through Mongoose
mongoose.connect('mongodb://localhost:27017/yelp-camp', {});

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

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    // This is setting cookie settings. See docs for questions. 
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig));
app.use(flash());

// Middleware for every single request we will have access to 'success' message on every route we pass.
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// routes set up.
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

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
app.listen(3000, ()=>{
    console.log("Serving on port 3000");
});