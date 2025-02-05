const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const WaterRecord = require('../models/WaterRecord');

// View water records
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const records = await WaterRecord.getByUserId(req.user.id);
        res.render('records', { records, title: 'Water Records' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching records');
    }
});

// Add a new record
router.post('/add', ensureAuthenticated, async (req, res) => {
    const { waterUsage, notes } = req.body;
    try {
        await WaterRecord.addRecord(req.user.id, waterUsage, notes);
        req.flash('success_msg', 'Record added successfully');
        res.redirect('/watermeter');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to add record');
        res.redirect('/watermeter');
    }
});

// Update an existing record
router.post('/update/:id', ensureAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { waterUsage, notes } = req.body;
    try {
        await WaterRecord.updateRecord(id, waterUsage, notes);
        req.flash('success_msg', 'Record updated successfully');
        res.redirect('/watermeter');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to update record');
        res.redirect('/watermeter');
    }
});

// Delete a record
router.post('/delete/:id', ensureAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        await WaterRecord.deleteRecord(id);
        req.flash('success_msg', 'Record deleted successfully');
        res.redirect('/watermeter');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to delete record');
        res.redirect('/watermeter');
    }
});

module.exports = router;
