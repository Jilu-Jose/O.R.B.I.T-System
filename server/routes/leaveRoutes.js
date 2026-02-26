const express = require('express');
const router = express.Router();
const { applyLeave, getLeaves, getMyLeaves, updateLeaveStatus, deleteLeave } = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload');

router.route('/my').get(protect, getMyLeaves);

router.route('/')
    .post(protect, upload.single('document'), applyLeave)
    .get(protect, getLeaves);

router.route('/:id')
    .patch(protect, authorizeRoles('Manager', 'Admin'), updateLeaveStatus)
    .delete(protect, deleteLeave);

module.exports = router;
