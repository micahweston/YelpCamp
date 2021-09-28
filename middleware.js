module.exports.isLoggedIn = (req, res, next) => {
    // if user is not authenticated we flash error message and redirect to /login This projects this page under authentication.
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}