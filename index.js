// Requires
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const Campground = require('./models/campground');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas');
const methodOverride = require('method-override');

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

// Validate Campground data submitted.
const validateCampground = (req, res, next) => {
    // Authentication using Joi, this checks on creation.
    const { error } = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next()
    }
}

// Validate Review data submitted.
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}



// Home page
app.get('/', (req, res) => {
    res.render('home');
});

// index page from campgrounds
app.get('/campgrounds', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

// *********************************************************
//              CRUD Structure for Campgrounds
// *********************************************************

// Creat Form
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
});

// Create 
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // // Error if campground doesn't exist. Allows us to custimize our error message.
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Read
app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}));

// Update Form
app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground })
}));

// Update
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, {new: true});
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Delete
app.delete('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

// *********************************************************
//              CRUD Structure for REVIEWS
// *********************************************************

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res, next) => {
    const {id, reviewId} = req.params;
    // This $pull will go into the review array that is listed under Campground ID in mongo and find that specific review and delete it.
    // This makes sure that we do not delete all reviews that are associated with that campground, just the one review.
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));

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