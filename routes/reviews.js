const express = require('express');
const router = express.Router({mergeParams: true}); // This makes sure that we can use the campgrounds ID that isn't in this router page

const Review = require('../models/review');
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews');
const { reviewSchema } = require('../schemas');
const { validateReview, isLoggedIn, isAuthor, isReviewAuthor } = require('../middleware');


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;