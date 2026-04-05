const express = require('express');
const router = express.Router();
const Official = require('../models/Official');
const bcrypt = require('bcryptjs');

// Register Official (for testing)
router.post('/register', async (req, res) => {
    try {
        const { name, contact_info, designation, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const official = new Official({ name, contact_info, designation, password: hashedPassword });
        await official.save();
        res.status(201).json({ message: 'Official registered' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get all officials
router.get('/', async (req, res) => {
    try {
        const officials = await Official.find();
        res.json(officials);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
