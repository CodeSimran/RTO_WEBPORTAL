const express = require('express');
const router = express.Router();
const MockTest = require('../models/MockTest');

// Get all mock tests - supports ?user= filter
router.get('/', async (req, res) => {
    try {
        const filter = req.query.user ? { user: req.query.user } : {};
        const tests = await MockTest.find(filter).populate('user', 'name email');
        res.json(tests);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Register for mock test
router.post('/', async (req, res) => {
    try {
        const test = new MockTest(req.body);
        await test.save();
        res.status(201).json(test);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update score/status
router.put('/:id', async (req, res) => {
    try {
        const test = await MockTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(test);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete mock test record
router.delete('/:id', async (req, res) => {
    try {
        await MockTest.findByIdAndDelete(req.params.id);
        res.json({ message: 'Mock test deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
