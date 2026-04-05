const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    payment_date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },                      // FLOAT
    payment_status: { 
        type: String, 
        enum: ['Pending', 'Paid'], 
        default: 'Pending'                                         // VARCHAR: Paid / Pending
    },
    description: { type: String, default: 'RTO Service Fee' },    // payment purpose
    payment_method: { type: String, default: 'Online' },          // card / upi / etc
    transaction_ref: { type: String }                             // auto-generated ref
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
