// Middleware to check if the user is logged in
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please log in to view this resource');
    res.redirect('/login');
}

// Middleware to check if the user is an admin
function ensureAdmin(req, res, next) {
    if (req.user && req.user.is_admin) {
        return next();
    }
    req.flash('error_msg', 'Unauthorized access');
    res.redirect('/');
}

module.exports = { ensureAuthenticated, ensureAdmin };
