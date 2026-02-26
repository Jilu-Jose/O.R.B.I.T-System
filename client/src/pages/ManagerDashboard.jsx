import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Check, X as CancelIcon, Filter, Search, BarChart3 } from 'lucide-react';
import io from 'socket.io-client';
import { IndianRupee } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

const ManagerDashboard = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [reimbursements, setReimbursements] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();

        const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });
        socket.on('new_leave_request', (data) => {
            toast(`New leave request from ${data.employeeName}`, { icon: '🔔' });
            fetchData();
        });

        return () => socket.disconnect();
    }, []);

    const fetchData = async () => {
        try {
            const [leavesRes, reimbursementsRes, analyticsRes] = await Promise.all([
                api.get('/leaves'),
                api.get('/reimbursements'),
                api.get('/analytics')
            ]);
            setLeaves(leavesRes.data);
            setReimbursements(reimbursementsRes.data);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            toast.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.patch(`/leaves/${id}`, { status });
            toast.success(`Leave request ${status.toLowerCase()}`);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleUpdateReimbursementStatus = async (id, status) => {
        try {
            await api.patch(`/reimbursements/${id}`, { status });
            toast.success(`Reimbursement request ${status.toLowerCase()}`);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const filteredLeaves = leaves.filter(leave => {
        const matchStatus = statusFilter === 'All' || leave.status === statusFilter;
        const matchSearch = leave.userId?.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchStatus && matchSearch;
    });

    const filteredReimbursements = reimbursements.filter(reimb => {
        const matchStatus = statusFilter === 'All' || reimb.status === statusFilter;
        const matchSearch = reimb.userId?.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchStatus && matchSearch;
    });

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1 }
            }
        }
    };

    const chartData = analytics ? {
        labels: analytics.trendData.labels,
        datasets: [
            {
                fill: true,
                label: 'Leave Requests',
                data: analytics.trendData.data,
                borderColor: 'rgb(249, 115, 22)',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                tension: 0.4,
            },
        ],
    } : null;

    // Process leave status distribution for Doughnut Chart
    const statusCounts = leaves.reduce((acc, leave) => {
        acc[leave.status] = (acc[leave.status] || 0) + 1;
        return acc;
    }, { Pending: 0, 'Manager Approved': 0, Approved: 0, Rejected: 0 });

    const doughnutData = {
        labels: ['Pending', 'Manager Approved', 'Approved', 'Rejected'],
        datasets: [
            {
                data: [statusCounts.Pending, statusCounts['Manager Approved'], statusCounts.Approved, statusCounts.Rejected],
                backgroundColor: [
                    'rgba(234, 179, 8, 0.8)',   // Yellow
                    'rgba(59, 130, 246, 0.8)',  // Blue
                    'rgba(34, 197, 94, 0.8)',   // Green
                    'rgba(239, 68, 68, 0.8)',   // Red
                ],
                borderColor: [
                    'rgba(234, 179, 8, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(239, 68, 68, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
        },
        cutout: '70%',
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Manager Overview</h2>
            </div>

            {/* Analytics Cards */}
            {analytics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-neutral-800 transition-transform hover:-translate-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Requests</p>
                        <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{analytics.totalLeaves}</h3>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-neutral-800 transition-transform hover:-translate-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Pending Approval</p>
                        <h3 className="text-3xl font-bold text-yellow-500">{analytics.pendingLeaves}</h3>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-neutral-800 transition-transform hover:-translate-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Approval Rate</p>
                        <h3 className="text-3xl font-bold text-green-500">{analytics.approvalRate}%</h3>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-neutral-800 transition-transform hover:-translate-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Top Leave Type</p>
                        <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400 truncate">{analytics.commonLeaveType}</h3>
                    </div>
                </div>
            )}

            {/* Chart Section */}
            {analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-neutral-800 p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center mb-6">
                            <BarChart3 className="w-5 h-5 mr-3 text-orange-500" />
                            Monthly Leave Trends
                        </h3>
                        <div className="h-64 w-full relative">
                            <Line options={chartOptions} data={chartData} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-neutral-800 p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center mb-6">
                            <BarChart3 className="w-5 h-5 mr-3 text-orange-500" />
                            Status Distribution
                        </h3>
                        <div className="h-64 w-full relative flex items-center justify-center">
                            <Doughnut options={doughnutOptions} data={doughnutData} />
                        </div>
                    </div>
                </div>
            )}

            {/* Leave Approval Table */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-neutral-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Leave Approvals</h3>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search employee..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow"
                                />
                            </div>

                            <div className="relative">
                                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="pl-9 pr-4 py-2 w-full sm:w-auto rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none appearance-none"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Manager Approved">Manager Approved</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        </div>
                    ) : filteredLeaves.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            No leave requests found matching filters.
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 dark:bg-black/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-neutral-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Employee</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Leave Type</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Duration</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Reason</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Document</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                                {filteredLeaves.map((leave) => (
                                    <tr key={leave._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition duration-150">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 dark:text-white">{leave.userId?.name}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{leave.userId?.department}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-600 dark:text-gray-300">
                                            {leave.leaveType}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col">
                                                <span>{new Date(leave.fromDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(leave.toDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 truncate max-w-[150px]" title={leave.reason}>
                                            {leave.reason}
                                        </td>
                                        <td className="px-6 py-4">
                                            {leave.documentUrl ? (
                                                <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${leave.documentUrl}`} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline text-sm font-medium">View doc</a>
                                            ) : (
                                                <span className="text-gray-400 text-sm">None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md ${leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                                                leave.status === 'Manager Approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' :
                                                    leave.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
                                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                                                }`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {/* Role based rendering of actions */}
                                            {(
                                                // Manager can only approve employees who are Pending
                                                (user?.role === 'Manager' && leave.userId?.role === 'Employee' && leave.status === 'Pending') ||
                                                // Admin can approve employees who are Manager Approved, OR managers who are Pending
                                                (user?.role === 'Admin' && ((leave.userId?.role === 'Employee' && leave.status === 'Manager Approved') || (leave.userId?.role === 'Manager' && leave.status === 'Pending')))
                                            ) ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(leave._id, user?.role === 'Manager' ? 'Manager Approved' : 'Approved')}
                                                        className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition dark:bg-green-900/30 dark:hover:bg-green-800/50 dark:text-green-400"
                                                        title="Approve"
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(leave._id, 'Rejected')}
                                                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition dark:bg-red-900/30 dark:hover:bg-red-800/50 dark:text-red-400"
                                                        title="Reject"
                                                    >
                                                        <CancelIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                // If none of the conditions match but it is pending, show waiting text
                                                (leave.status === 'Pending' && user?.role === 'Admin') ? <span className="text-xs text-yellow-600 dark:text-yellow-500 font-medium whitespace-nowrap">Waiting for Manager</span> :
                                                    (leave.status === 'Manager Approved' && user?.role === 'Manager') ? <span className="text-xs text-blue-600 dark:text-blue-500 font-medium whitespace-nowrap">Waiting for Admin</span> :
                                                        <span className="text-sm text-gray-400 dark:text-gray-500 italic font-medium">Processed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Reimbursements Approval Table */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-neutral-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50">
                    <div className="flex items-center gap-3">
                        <IndianRupee className="w-6 h-6 text-orange-500" />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Reimbursement Approvals</h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        </div>
                    ) : filteredReimbursements.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            No reimbursement requests found matching filters.
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 dark:bg-black/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-neutral-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Employee</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Date</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Description</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Amount</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Receipt</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                                {filteredReimbursements.map((reimb) => (
                                    <tr key={reimb._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition duration-150">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 dark:text-white">{reimb.userId?.name}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{reimb.userId?.department}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {new Date(reimb.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 truncate max-w-[200px]" title={reimb.description}>
                                            {reimb.description}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                            ₹{reimb.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {reimb.receiptUrl ? (
                                                <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${reimb.receiptUrl}`} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline text-sm font-medium">View receipt</a>
                                            ) : (
                                                <span className="text-gray-400 text-sm">None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md ${reimb.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                                                reimb.status === 'Manager Approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' :
                                                    reimb.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
                                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                                                }`}>
                                                {reimb.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {/* Role based rendering of actions */}
                                            {(
                                                // Manager can only approve employees who are Pending
                                                (user?.role === 'Manager' && reimb.userId?.role === 'Employee' && reimb.status === 'Pending') ||
                                                // Admin can approve employees who are Manager Approved, OR managers who are Pending
                                                (user?.role === 'Admin' && ((reimb.userId?.role === 'Employee' && reimb.status === 'Manager Approved') || (reimb.userId?.role === 'Manager' && reimb.status === 'Pending')))
                                            ) ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleUpdateReimbursementStatus(reimb._id, user?.role === 'Manager' ? 'Manager Approved' : 'Approved')}
                                                        className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition dark:bg-green-900/30 dark:hover:bg-green-800/50 dark:text-green-400"
                                                        title="Approve"
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateReimbursementStatus(reimb._id, 'Rejected')}
                                                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition dark:bg-red-900/30 dark:hover:bg-red-800/50 dark:text-red-400"
                                                        title="Reject"
                                                    >
                                                        <CancelIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                // If none of the conditions match but it is pending, show waiting text
                                                (reimb.status === 'Pending' && user?.role === 'Admin') ? <span className="text-xs text-yellow-600 dark:text-yellow-500 font-medium whitespace-nowrap">Waiting for Manager</span> :
                                                    (reimb.status === 'Manager Approved' && user?.role === 'Manager') ? <span className="text-xs text-blue-600 dark:text-blue-500 font-medium whitespace-nowrap">Waiting for Admin</span> :
                                                        <span className="text-sm text-gray-400 dark:text-gray-500 italic font-medium">Processed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
