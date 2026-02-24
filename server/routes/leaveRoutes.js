const express = require('express');
const router = express.Router();
const { applyLeave, getLeaves, updateLeaveStatus, deleteLeave } = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/')
    .post(protect, applyLeave)
    .get(protect, getLeaves);

router.route('/:id')
    .patch(protect, authorizeRoles('Manager', 'Admin'), updateLeaveStatus)
    .delete(protect, deleteLeave);

module.exports = router;
