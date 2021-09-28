const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {campgroundSchema} = require('../schemas');
const {isLoggedIn} = require('../middleware');

const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');

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

// index page from campgrounds
router.get('/', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

// *********************************************************
//              CRUD Structure for Campgrounds
// *********************************************************

// Creat Form
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
});

// Create 
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // // Error if campground doesn't exist. Allows us to custimize our error message.
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Read
router.get('/:id',  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground) {
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

// Update Form
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground) {
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground })
}));

// Update
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, {new: true});
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Delete
router.delete('/:id', isLoggedIn, catchAsync(async (req, res, next) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted review!');
    res.redirect('/campgrounds');
}));

module.exports = router;