const mongoose = require('mongoose');

const officialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact_info: { type: String, required: true },
    designation: { type: String, required: true },
    password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Official', officialSchema);
