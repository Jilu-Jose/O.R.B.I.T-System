const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ActivityLog = require('../models/ActivityLog');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role, department } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            return next(new Error('User already exists'));
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'Employee',
            department
        });

        if (user) {
            generateToken(res, user._id);

            await ActivityLog.create({
                userId: user._id,
                action: 'REGISTER',
                details: 'User registered'
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            });
        } else {
            res.status(400);
            return next(new Error('Invalid user data'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        const user = await User.findOne({ email });

        if (user && user.role !== role) {
            res.status(401);
            return next(new Error(`Invalid role selected. Account is registered as ${user.role}`));
        }

        if (user && (await user.comparePassword(password))) {
            generateToken(res, user._id);

            await ActivityLog.create({
                userId: user._id,
                action: 'LOGIN',
                details: 'User logged in'
            });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            });
        } else {
            res.status(401);
            return next(new Error('Invalid email or password'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'User logged out' });
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                leaveBalance: user.leaveBalance
            });
        } else {
            res.status(404);
            return next(new Error('User not found'));
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
};
