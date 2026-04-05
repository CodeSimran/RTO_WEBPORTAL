const express = require('express');
const router = express.Router();
const License = require('../models/License');

// Get licenses - supports ?user_id= filter
router.get('/', async (req, res) => {
    try {
        const filter = req.query.user_id ? { user_id: req.query.user_id } : {};
        const licenses = await License.find(filter).populate('user_id', 'name email');
        res.json(licenses);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Apply for license
router.post('/', async (req, res) => {
    try {
        const license = new License(req.body);
        await license.save();
        res.status(201).json(license);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update status
router.put('/:id', async (req, res) => {
    try {
        const license = await License.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(license);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete license application
router.delete('/:id', async (req, res) => {
    try {
        await License.findByIdAndDelete(req.params.id);
        res.json({ message: 'License deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
