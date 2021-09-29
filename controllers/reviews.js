// *********************************************************
//         Controller logic for REVIEWS route
// *********************************************************

// Required
const Review = require('../models/review');
const Campground = require('../models/campground');

// *********************************************************
//                Create REVIEWS
// *********************************************************
module.exports.createReview = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review');
    res.redirect(`/campgrounds/${campground._id}`);
}

// *********************************************************
//                Delete REVIEWS
// *********************************************************
module.exports.deleteReview = async (req, res, next) => {
    const {id, reviewId} = req.params;
    // This $pull will go into the review array that is listed under Campground ID in mongo and find that specific review and delete it.
    // This makes sure that we do not delete all reviews that are associated with that campground, just the one review.
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}