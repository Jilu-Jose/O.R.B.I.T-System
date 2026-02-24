const express = require('express');
const router = express.Router();
const { getUsers, addUser, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/')
    .get(protect, authorizeRoles('Admin'), getUsers)
    .post(protect, authorizeRoles('Admin'), addUser);

router.route('/:id')
    .patch(protect, authorizeRoles('Admin'), updateUserRole)
    .delete(protect, authorizeRoles('Admin'), deleteUser);

module.exports = router;
