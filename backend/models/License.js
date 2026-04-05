const mongoose = require('mongoose');

const licenseSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiry_date: { type: Date },
    license_no: { type: String, unique: true, sparse: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    slot: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('License', licenseSchema);
