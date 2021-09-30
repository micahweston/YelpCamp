const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// Show and create route
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground))
    

// New form route
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// route by ID
router.route('/:id')
    .get(catchAsync(campgrounds.readCampground))
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

// Edit route by ID
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderUpdateForm));

module.exports = router;