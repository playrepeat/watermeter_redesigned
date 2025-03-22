function ensureAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.is_admin) {
        return next();
    }
    req.flash('error_msg', 'Unauthorized access');
    res.redirect('/login');
}

module.exports = { ensureAdmin };
