const express = require('express');
const router = express.Router();
const passport = require('passport');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');
const {isLoggedIn} = require('../middleware');

// Register Routes
router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.createNewUser))

// Login Routes
router.route('/login')
    .get(users.renderLoginForm)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.submitLogin)

// Logout Route
router.get('/logout', users.submitLogout)

module.exports = router;