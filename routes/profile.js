const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const WaterRecord = require('../models/WaterRecord');




// Profile page route
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const previousReadings = await WaterRecord.getByUserId(req.user.id); // Fetch records from DB
        res.render('profile', {
            user: req.user,
            previousReadings,
            title: 'Your Profile'
        });
    } catch (err) {
        console.error('Error fetching previous readings:', err);
        req.flash('error_msg', 'Failed to load previous readings.');
        res.redirect('/');
    }
});



router.get('/change-password', ensureAuthenticated, (req, res) => {
    res.render('change-password', { title: 'Change Password' });
});

router.get('/record-reading', ensureAuthenticated, (req, res) => {
    res.render('record-reading', { title: 'Record Water Reading' });
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

// View water records
router.get('/previous-readings', ensureAuthenticated, async (req, res) => {
    console.log(`Fetching readings for user ID: ${req.user.id}`); // ✅ Log user ID

    try {
        const records = await WaterRecord.getByUserId(req.user.id);
        console.log("Query successful. Records:", records); // ✅ Log query result

        res.json(records);
    } catch (err) {
        console.error('Error fetching previous readings:', err); // ✅ Log query error
        res.status(500).json({ error: 'Failed to fetch previous readings' });
    }
});


// Add a new record
router.post('/record-reading', ensureAuthenticated, async (req, res) => {
    console.log('Received form data:', req.body); // Debugging line
    const { waterUsage, notes } = req.body;
    if (!waterUsage) {
        req.flash('error_msg', 'Water usage is required');
        return res.redirect('/profile');
    }

    try {
        await WaterRecord.addRecord(req.user.id, waterUsage, notes);
        req.flash('success_msg', 'Record added successfully');
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to add record');
        res.redirect('/profile');
    }
});
// Update an existing record
router.post('/update/:id', ensureAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { waterUsage, notes } = req.body;
    try {
        await WaterRecord.updateRecord(id, waterUsage, notes);
        req.flash('success_msg', 'Record updated successfully');
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to update record');
        res.redirect('/profile');
    }
});

// Delete a record
router.post('/delete/:id', ensureAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        await WaterRecord.deleteRecord(id);
        req.flash('success_msg', 'Record deleted successfully');
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to delete record');
        res.redirect('/profile');
    }
});



module.exports = router;
