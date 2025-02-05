module.exports = function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next(); // User is authenticated, proceed
    }
    req.flash('error_msg', 'Please log in to access this resource');
    res.redirect('/auth/login'); // Redirect to login if not authenticated
};
