const path = require('path');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require('dotenv').config();
require('./config/passport')(passport); // Passport config
const app = express();

// Express Session
app.use(
    session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }
    })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash Middleware
app.use(flash());

// Global Variables for Flash Messages
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); // Passport sets its own error messages
    next();
});



// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set view engine to EJS
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));




// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/profile', require('./routes/profile'));
app.use('/admin', require('./routes/admin'));






// Error handling
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

