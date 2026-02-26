const express = require('express');
const router = express.Router();
const {
    createReimbursement,
    getMyReimbursements,
    getAllReimbursements,
    updateReimbursementStatus
} = require('../controllers/reimbursementController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.route('/')
    .post(protect, upload.single('receipt'), createReimbursement)
    .get(protect, authorize('Manager', 'Admin'), getAllReimbursements);

router.route('/my')
    .get(protect, getMyReimbursements);

router.route('/:id')
    .patch(protect, authorize('Manager', 'Admin'), updateReimbursementStatus);

module.exports = router;
