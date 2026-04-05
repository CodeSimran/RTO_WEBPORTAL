const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');

// Get vehicles - supports ?user_id= filter
router.get('/', async (req, res) => {
    try {
        const filter = req.query.user_id ? { user_id: req.query.user_id } : {};
        const vehicles = await Vehicle.find(filter).populate('user_id', 'name email');
        res.json(vehicles);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Register new vehicle
router.post('/', async (req, res) => {
    try {
        const vehicle = new Vehicle(req.body);
        await vehicle.save();
        res.status(201).json(vehicle);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update status
router.put('/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(vehicle);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete vehicle
router.delete('/:id', async (req, res) => {
    try {
        await Vehicle.findByIdAndDelete(req.params.id);
        res.json({ message: 'Vehicle deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
