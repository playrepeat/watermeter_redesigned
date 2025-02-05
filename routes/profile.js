const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const User = require('../models/User');
const bcrypt = require('bcryptjs');



// Profile page route
router.get('/', ensureAuthenticated, (req, res) => {
    res.render('profile', { user: req.user, title: 'Your Profile' });
});


router.get('/change-password', ensureAuthenticated, (req, res) => {
    res.render('change-password', { title: 'Change Password' });
});

router.get('/record-reading', ensureAuthenticated, (req, res) => {
    res.render('record-reading', { title: 'Record Water Reading' });
});

router.get('/previous-readings', ensureAuthenticated, async (req, res) => {
    const records = await WaterRecord.getRecordsByUserId(req.user.id);
    res.render('previous-readings', { title: 'Previous Readings', records });
});

router.post('/change-password', ensureAuthenticated, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        const userPassword = await User.findPasswordDetailsByUserId(req.user.id);

        if (!userPassword || userPassword.is_locked) {
            req.flash('error_msg', 'Your account is locked or password record not found.');
            return res.redirect('/profile');
        }

        const isMatch = await bcrypt.compare(oldPassword, userPassword.hashed_password);
        if (!isMatch) {
            req.flash('error_msg', 'Incorrect old password.');
            return res.redirect('/profile');
        }

        // Hash new password and update the database
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updatePassword(req.user.id, hashedPassword);

        req.flash('success_msg', 'Password changed successfully!');
        return res.redirect('/profile');

    } catch (error) {
        console.error('Error changing password:', error);
        req.flash('error_msg', 'An error occurred while changing the password.');
        return res.redirect('/profile');
    }
});



module.exports = router;
