const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

// Helper: generate transaction reference
const generateTxnRef = () => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `TXN-RTO-${ts}-${rand}`;
};

// GET all payments — supports ?user=userId filter
router.get('/', async (req, res) => {
    try {
        const filter = req.query.user ? { user: req.query.user } : {};
        const payments = await Payment.find(filter)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET single payment by ID
router.get('/:id', async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('user', 'name email');
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        res.json(payment);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST — create a new payment (status: Pending by default)
router.post('/', async (req, res) => {
    try {
        const { user, amount, payment_status, description, payment_method } = req.body;
        const payment = new Payment({
            user,
            amount: parseFloat(amount),
            payment_status: payment_status || 'Pending',
            payment_date: new Date(),
            description: description || 'RTO Service Fee',
            payment_method: payment_method || 'Online',
            transaction_ref: payment_status === 'Paid' ? generateTxnRef() : null
        });
        await payment.save();
        res.status(201).json(payment);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /:id — pay a pending payment (Pending → Paid)
router.put('/:id', async (req, res) => {
    try {
        const updates = { ...req.body };
        // If marking as Paid, auto-set date and generate transaction ref
        if (updates.payment_status === 'Paid') {
            updates.payment_date = new Date();
            updates.transaction_ref = generateTxnRef();
        }
        const payment = await Payment.findByIdAndUpdate(
            req.params.id, updates, { new: true }
        ).populate('user', 'name email');
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        res.json(payment);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /:id
router.delete('/:id', async (req, res) => {
    try {
        await Payment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Payment deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
