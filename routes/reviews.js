const express = require('express');
const router = express.Router({mergeParams: true}); // This makes sure that we can use the campgrounds ID that isn't in this router page

const Review = require('../models/review');

const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const { reviewSchema } = require('../schemas')

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

// *********************************************************
//              CRUD Structure for REVIEWS
// *********************************************************

// Add review
router.post('/', validateReview, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Delete review
router.delete('/:reviewId', catchAsync(async (req, res, next) => {
    const {id, reviewId} = req.params;
    // This $pull will go into the review array that is listed under Campground ID in mongo and find that specific review and delete it.
    // This makes sure that we do not delete all reviews that are associated with that campground, just the one review.
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;