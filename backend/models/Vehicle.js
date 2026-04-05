const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    registration_date: { type: Date, required: true },
    rc_number: { type: String, required: true, unique: true },
    insurance_no: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
