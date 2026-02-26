const Reimbursement = require('../models/Reimbursement');
const User = require('../models/User');

// @desc    Create a new reimbursement request
// @route   POST /api/reimbursements
// @access  Private
const createReimbursement = async (req, res, next) => {
    try {
        const { amount, date, description, receiptUrl } = req.body;

        const reimbursementData = {
            userId: req.user._id,
            amount,
            date,
            description,
        };

        if (req.file) {
            reimbursementData.receiptUrl = `/uploads/${req.file.filename}`;
        }

        const reimbursement = await Reimbursement.create(reimbursementData);

        // Optional: Emit event to socket here if implemented

        res.status(201).json(reimbursement);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reimbursements for logged in user
// @route   GET /api/reimbursements/my
// @access  Private
const getMyReimbursements = async (req, res, next) => {
    try {
        const reimbursements = await Reimbursement.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(reimbursements);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reimbursements (for Manager/Admin)
// @route   GET /api/reimbursements
// @access  Private (Manager/Admin)
const getAllReimbursements = async (req, res, next) => {
    try {
        const reimbursements = await Reimbursement.find()
            .populate('userId', 'name email department role')
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(reimbursements);
    } catch (error) {
        next(error);
    }
};

// @desc    Update reimbursement status
// @route   PATCH /api/reimbursements/:id
// @access  Private (Manager/Admin)
const updateReimbursementStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const reimbursement = await Reimbursement.findById(req.params.id);

        if (!reimbursement) {
            res.status(404);
            throw new Error('Reimbursement request not found');
        }

        const user = await User.findById(reimbursement.userId);

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
            if (user.role === 'Employee' && status === 'Approved' && reimbursement.status !== 'Manager Approved') {
                res.status(400);
                return next(new Error('Employee reimbursements must be "Manager Approved" before Admin can "Approve" them.'));
            }
        }

        reimbursement.status = status;
        reimbursement.reviewedBy = req.user._id;
        const updatedReimbursement = await reimbursement.save();

        // Optional: Emit event to socket here if implemented
        const io = req.app.get('io');
        if (io) {
            io.emit('reimbursement_status_updated', {
                userId: reimbursement.userId,
                reimbursementId: reimbursement._id,
                status: updatedReimbursement.status
            });
        }

        res.status(200).json(updatedReimbursement);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReimbursement,
    getMyReimbursements,
    getAllReimbursements,
    updateReimbursementStatus
};
