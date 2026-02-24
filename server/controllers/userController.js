const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Add a new user (admin only)
// @route   POST /api/users
// @access  Private/Admin
const addUser = async (req, res, next) => {
    try {
        const { name, email, password, role, department } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            return next(new Error('User already exists'));
        }

        const { leaveBalance } = req.body;

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'Employee',
            department,
            leaveBalance: leaveBalance !== undefined ? leaveBalance : 20
        });

        if (user) {
            await ActivityLog.create({
                userId: req.user._id,
                action: 'USER_CREATED',
                details: `Admin created user: ${user.email}`
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                leaveBalance: user.leaveBalance
            });
        } else {
            res.status(400);
            return next(new Error('Invalid user data'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user role
// @route   PATCH /api/users/:id
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.role = req.body.role || user.role;
            user.department = req.body.department || user.department;
            user.leaveBalance = req.body.leaveBalance !== undefined ? req.body.leaveBalance : user.leaveBalance;

            const updatedUser = await user.save();

            await ActivityLog.create({
                userId: req.user._id,
                action: 'ROLE_UPDATED',
                details: `Admin updated role for ${user.email} to ${updatedUser.role}`
            });

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                department: updatedUser.department,
                leaveBalance: updatedUser.leaveBalance
            });
        } else {
            res.status(404);
            return next(new Error('User not found'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();

            await ActivityLog.create({
                userId: req.user._id,
                action: 'USER_DELETED',
                details: `Admin deleted user: ${user.email}`
            });

            res.json({ message: 'User removed' });
        } else {
            res.status(404);
            return next(new Error('User not found'));
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsers,
    addUser,
    updateUserRole,
    deleteUser,
};
