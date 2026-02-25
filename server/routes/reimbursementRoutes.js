const express = require('express');
const router = express.Router();
const {
    createReimbursement,
    getMyReimbursements,
    getAllReimbursements,
    updateReimbursementStatus
} = require('../controllers/reimbursementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createReimbursement)
    .get(protect, authorize('Manager', 'Admin'), getAllReimbursements);

router.route('/my')
    .get(protect, getMyReimbursements);

router.route('/:id')
    .patch(protect, authorize('Manager', 'Admin'), updateReimbursementStatus);

module.exports = router;
