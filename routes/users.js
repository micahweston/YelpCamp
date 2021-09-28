const express = require('express');
const router = express.Router();
const passport = require('passport');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

// GET register form
router.get('/register', (req, res) => {
    res.render('users/register');
});

// POST register new user and save their info in DB
router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next();
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }
}));

// GET login form
router.get('/login', (req, res) => {
    res.render('users/login');
});

// POST login with passport.authenticate to check local creditials. Will flash a failure message, and redirect if failure.
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'Welcome back');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res) => {
    req.logOut(); // how to logout with passport (built in method)
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
})

module.exports = router;