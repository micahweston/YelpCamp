// *********************************************************
//         Controller logic for USERS route
// *********************************************************

// Requires
const User = require('../models/user');

// *********************************************************
//                 Register New User
// *********************************************************
module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
}

module.exports.createNewUser = async (req, res, next) => {
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
}

// *********************************************************
//                     LOGIN route
// *********************************************************
module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
}

module.exports.submitLogin = (req, res) => {
    req.flash('success', 'Welcome back');
    const redirectUrl = req.session.returnPage || '/campgrounds';
    res.redirect(redirectUrl);
}

// *********************************************************
//                         LOGOUT route
// *********************************************************
module.exports.submitLogout = (req, res) => {
    req.logOut(); // how to logout with passport (built in method)
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
}