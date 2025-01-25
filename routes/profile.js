const express = require('express');
const User = require('../models/User');
const router = express.Router();
const flash = require('connect-flash');

// Middleware to ensure authentication
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login'); // Redirect to login if not authenticated
}

// Profile page route
router.get('/', ensureAuthenticated, (req, res) => {
    res.render('profile', { user: req.user, title: 'Your Profile' });
});


// Logout Route
router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            console.error(err);
            return res.redirect('/profile');
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/login');
    });
});

module.exports = router;
