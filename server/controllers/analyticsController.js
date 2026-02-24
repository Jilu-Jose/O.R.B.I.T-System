const Leave = require('../models/Leave');

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private (Manager/Admin)
const getAnalytics = async (req, res, next) => {
    try {
        // Total Leave Requests
        const totalLeaves = await Leave.countDocuments();

        // Approval Rate
        const approvedLeaves = await Leave.countDocuments({ status: 'Approved' });
        const approvalRate = totalLeaves === 0 ? 0 : ((approvedLeaves / totalLeaves) * 100).toFixed(2);

        // Pending Requests
        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

        // Most Common Leave Type (Aggregation)
        const leaveTypes = await Leave.aggregate([
            { $group: { _id: '$leaveType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        const commonLeaveType = leaveTypes.length > 0 ? leaveTypes[0]._id : 'N/A';

        // Monthly Leave Trends for Chart.js
        const monthlyTrends = await Leave.aggregate([
            {
                $group: {
                    _id: { $month: "$fromDate" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format for Chart.js
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trendData = {
            labels: monthlyTrends.map(t => months[t._id - 1]),
            data: monthlyTrends.map(t => t.count)
        };

        res.json({
            totalLeaves,
            approvedLeaves,
            pendingLeaves,
            approvalRate,
            commonLeaveType,
            trendData
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAnalytics
};
