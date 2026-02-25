const mongoose = require('mongoose');

const reimbursementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount']
    },
    date: {
        type: Date,
        required: [true, 'Please add the date of the expense']
    },
    description: {
        type: String,
        required: [true, 'Please add a description of the expense']
    },
    receiptUrl: {
        type: String, // Optional URL for uploaded receipt (if implemented later)
        default: null
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Reimbursement', reimbursementSchema);
