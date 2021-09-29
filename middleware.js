const Campground = require('./models/campground');
const Review = require('./models/review')
const ExpressError = require('./utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('./schemas');

module.exports.isLoggedIn = (req, res, next) => {
    // if user is not authenticated we flash error message and redirect to /login This projects this page under authentication.
    if(!req.isAuthenticated()) {
        req.session.returnPage = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}

// Validate Review data submitted.
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// Validate Campground data submitted.
module.exports.validateCampground = (req, res, next) => {
    // Authentication using Joi, this checks on creation.
    const { error } = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next()
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    // This is to check to make sure you're the author. If you are not it will redirect you and not allow you to change.
    if(!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have the permissions required.');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    // This is to check to make sure you're the author. If you are not it will redirect you and not allow you to change.
    if(!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have the permissions required.');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}