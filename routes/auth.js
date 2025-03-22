const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();


// Login Page
router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/profile'); // Redirect authenticated users
    }
    res.render('login', { title: 'Login' });
});



// Show registration page
router.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

// Handle registration
router.post('/register', async (req, res) => {
    const { email, password, firstName, lastName, apartment } = req.body;
    try {
        const user = await User.findByEmail(email);
        if (user) {
            req.flash('error_msg', 'Email already registered');
            return res.redirect('/auth/register');
        }

        await User.create({ email, password, firstName, lastName, apartment });
        req.flash('success_msg', 'You are now registered and can log in');
        console.log(req.flash('success_msg'));
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'An error occurred');
        res.redirect('/auth/register');
    }
});



// Login Route
router.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/profile',
        failureRedirect: '/auth/login', // ✅ Ensure this matches the GET route
        failureFlash: true,
    })
);


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

// Forgot Password Route
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { title: 'Forgot Password' });
});




module.exports = router;
