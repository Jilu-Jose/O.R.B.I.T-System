const Leave = require('../models/Leave');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Helper function to check for conflicts
const hasConflict = async (userId, fromDateObj, toDateObj) => {
    const conflictingLeaves = await Leave.find({
        userId,
        status: { $in: ['Pending', 'Approved'] },
        $or: [
            { fromDate: { $lte: toDateObj }, toDate: { $gte: fromDateObj } }
        ]
    });
    return conflictingLeaves.length > 0;
};

// Helper for AI Risk Indicator
const checkRiskIndicator = (user, fromDateObj, toDateObj, diffDays) => {
    const fromDay = fromDateObj.getDay();
    const toDay = toDateObj.getDay();
    const isWeekendAdjacent = (fromDay === 1 || fromDay === 5 || toDay === 1 || toDay === 5);

    if (isWeekendAdjacent && diffDays <= 2) {
        return true;
    }
    return false;
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
const applyLeave = async (req, res, next) => {
    try {
        const { leaveType, fromDate, toDate, reason } = req.body;

        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);

        if (fromDateObj > toDateObj) {
            res.status(400);
            return next(new Error('End date must be after start date'));
        }

        // Smart Leave Conflict Detection
        const conflict = await hasConflict(req.user._id, fromDateObj, toDateObj);
        if (conflict) {
            res.status(400);
            return next(new Error('You already have a leave request during this period'));
        }

        // Leave Balance Check
        const diffTime = Math.abs(toDateObj - fromDateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (req.user.leaveBalance < diffDays) {
            res.status(400);
            return next(new Error(`Insufficient leave balance. You have ${req.user.leaveBalance} days left.`));
        }

        // AI Risk Indicator logic
        const isRisky = checkRiskIndicator(req.user, fromDateObj, toDateObj, diffDays);

        const leaveData = {
            userId: req.user._id,
            leaveType,
            fromDate: fromDateObj,
            toDate: toDateObj,
            reason,
            status: req.user.role === 'Manager' ? 'Pending' : 'Pending', // Standard start state
        };

        if (req.file) {
            leaveData.documentUrl = `/uploads/${req.file.filename}`;
        }

        const leave = await Leave.create(leaveData);

        if (leave) {
            await ActivityLog.create({
                userId: req.user._id,
                action: 'LEAVE_APPLIED',
                details: `Applied for ${leaveType} from ${fromDate} to ${toDate} (${isRisky ? 'RISKY PATTERN' : 'NORMAL'})`
            });

            // Emit socket event to managers
            if (req.app.get('io')) {
                req.app.get('io').emit('new_leave_request', {
                    employeeName: req.user.name,
                    leaveType,
                    isRisky
                });
            }

            res.status(201).json({
                ...leave._doc,
                isRisky
            });
        } else {
            res.status(400);
            return next(new Error('Invalid leave data'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get leaves
// @route   GET /api/leaves
// @access  Private
const getLeaves = async (req, res, next) => {
    try {
        let query = {};

        // Employee only sees their own leaves. Admin/Manager sees all
        if (req.user.role === 'Employee') {
            query.userId = req.user._id;
        }

        // Add filtering support
        if (req.query.status) {
            query.status = req.query.status;
        }

        const leaves = await Leave.find(query)
            .populate('userId', 'name email department role')
            .sort({ createdAt: -1 });

        res.json(leaves);
    } catch (error) {
        next(error);
    }
};

// @desc    Get my leaves
// @route   GET /api/leaves/my
// @access  Private
const getMyLeaves = async (req, res, next) => {
    try {
        const leaves = await Leave.find({ userId: req.user._id })
            .populate('userId', 'name email department role')
            .sort({ createdAt: -1 });
        res.status(200).json(leaves);
    } catch (error) {
        next(error);
    }
};

// @desc    Update leave status
// @route   PATCH /api/leaves/:id
// @access  Private (Manager/Admin)
const updateLeaveStatus = async (req, res, next) => {
    try {
        const { status, managerComment } = req.body;
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            res.status(404);
            return next(new Error('Leave request not found'));
        }

        if (leave.status === status) {
            res.status(400);
            return next(new Error(`Leave is already ${status}`));
        }

        const user = await User.findById(leave.userId);
        if (!user) {
            res.status(404);
            return next(new Error('User associated with this leave not found'));
        }

        // Prevent Managers from approving managers or themselves fully
        if (req.user.role === 'Manager') {
            if (user.role === 'Manager' || user.role === 'Admin') {
                res.status(403);
                return next(new Error('Managers can only review Employee requests.'));
            }
            if (status === 'Approved') {
                res.status(403);
                return next(new Error('Managers can only set status to "Manager Approved" or "Rejected"'));
            }
            if (status !== 'Manager Approved' && status !== 'Rejected') {
                res.status(400);
                return next(new Error('Invalid status for Manager role'));
            }
        }

        // Logic for Admins
        if (req.user.role === 'Admin') {
            // Admin can approve Manager's requests directly
            if (user.role === 'Employee' && status === 'Approved' && leave.status !== 'Manager Approved') {
                res.status(400);
                return next(new Error('Employee leaves must be "Manager Approved" before Admin can "Approve" them.'));
            }
        }

        // Leave Balance Auto Calculation - Only deduct upon final 'Approved' status
        const fromDateObj = new Date(leave.fromDate);
        const toDateObj = new Date(leave.toDate);
        const diffTime = Math.abs(toDateObj - fromDateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (status === 'Approved' && leave.status !== 'Approved') {
            if (user.leaveBalance < diffDays) {
                res.status(400);
                return next(new Error('Employee has insufficient leave balance'));
            }
            user.leaveBalance -= diffDays;
        } else if (leave.status === 'Approved' && status !== 'Approved') {
            // Restore on rejection/reversal if previously fully approved
            user.leaveBalance += diffDays;
        }

        leave.status = status;
        if (managerComment) {
            leave.managerComment = managerComment;
        }

        await leave.save();
        await user.save();

        await ActivityLog.create({
            userId: req.user._id,
            action: 'LEAVE_UPDATED',
            details: `${req.user.role} updated leave for ${user.email} to ${status}`
        });

        // Notify employee via socket
        if (req.app.get('io')) {
            req.app.get('io').emit('leave_status_updated', {
                userId: user._id,
                status,
            });
        }

        res.json(leave);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete leave
// @route   DELETE /api/leaves/:id
// @access  Private
const deleteLeave = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            res.status(404);
            return next(new Error('Leave request not found'));
        }

        // Only allow deletion if pending, or if Admin
        if (leave.status !== 'Pending' && req.user.role !== 'Admin') {
            res.status(400);
            return next(new Error('Cannot delete processed leave request'));
        }

        await leave.deleteOne();

        await ActivityLog.create({
            userId: req.user._id,
            action: 'LEAVE_DELETED',
            details: `User deleted leave request`
        });

        res.json({ message: 'Leave request removed' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    applyLeave,
    getLeaves,
    getMyLeaves,
    updateLeaveStatus,
    deleteLeave,
};
