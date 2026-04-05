const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    report_date: { type: Date, default: Date.now },
    status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
    description: { type: String, required: true },
    photo_file: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
