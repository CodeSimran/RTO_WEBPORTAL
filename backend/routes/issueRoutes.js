const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer configuration for photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = `issue_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) cb(null, true);
        else cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
    }
});

// Get all issues - supports ?user= filter
router.get('/', async (req, res) => {
    try {
        const filter = req.query.user ? { user: req.query.user } : {};
        const issues = await Issue.find(filter).populate('user', 'name email').sort({ createdAt: -1 });
        res.json(issues);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Report issue (with optional photo upload)
router.post('/', upload.single('photo_file'), async (req, res) => {
    try {
        const issueData = {
            user: req.body.user,
            description: req.body.description,
            report_date: new Date(),
            status: 'Open'
        };
        if (req.file) {
            issueData.photo_file = `/uploads/${req.file.filename}`;
        }
        const issue = new Issue(issueData);
        await issue.save();
        res.status(201).json(issue);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update status (Open -> Resolved)
router.put('/:id', async (req, res) => {
    try {
        const issue = await Issue.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(issue);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete issue
router.delete('/:id', async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        // Remove photo file if it exists
        if (issue?.photo_file) {
            const filePath = path.join(__dirname, '..', issue.photo_file);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        await Issue.findByIdAndDelete(req.params.id);
        res.json({ message: 'Issue deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
