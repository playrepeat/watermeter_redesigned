const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');


// Admin Dashboard Page
router.get('/dashboard', ensureAdmin, (req, res) => {
    res.render('admin/dashboard', { title: 'Admin Dashboard' });
});

// Approve Registration (Example)
router.post('/approve/:id', ensureAdmin, async (req, res) => {
    const userId = req.params.id;
    try {
        // Update user status to approved in DB
        await db.query(
            `UPDATE watermeterusers SET is_approved = TRUE WHERE id = $1`,
            [userId]
        );
        req.flash('success_msg', 'User approved successfully');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error approving user');
    }
    res.redirect('/admin/dashboard');
});

module.exports = router;
