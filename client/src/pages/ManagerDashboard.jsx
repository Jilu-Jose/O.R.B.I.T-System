import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Check, X as CancelIcon, Filter, Search, BarChart3 } from 'lucide-react';
import io from 'socket.io-client';
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
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();

        const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const socket = io(SOCKET_URL);
        socket.on('new_leave_request', (data) => {
            toast(`New leave request from ${data.employeeName}`, { icon: '🔔' });
            fetchData();
        });

        return () => socket.disconnect();
    }, []);

    const fetchData = async () => {
        try {
            const [leavesRes, analyticsRes] = await Promise.all([
                api.get('/leaves'),
                api.get('/analytics')
            ]);
            setLeaves(leavesRes.data);
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

    const filteredLeaves = leaves.filter(leave => {
        const matchStatus = statusFilter === 'All' || leave.status === statusFilter;
        const matchSearch = leave.userId?.name.toLowerCase().includes(searchQuery.toLowerCase());
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
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
            },
        ],
    } : null;

    // Process leave status distribution for Doughnut Chart
    const statusCounts = leaves.reduce((acc, leave) => {
        acc[leave.status] = (acc[leave.status] || 0) + 1;
        return acc;
    }, { Pending: 0, Approved: 0, Rejected: 0 });

    const doughnutData = {
        labels: ['Pending', 'Approved', 'Rejected'],
        datasets: [
            {
                data: [statusCounts.Pending, statusCounts.Approved, statusCounts.Rejected],
                backgroundColor: [
                    'rgba(234, 179, 8, 0.8)',   // Yellow
                    'rgba(34, 197, 94, 0.8)',   // Green
                    'rgba(239, 68, 68, 0.8)',   // Red
                ],
                borderColor: [
                    'rgba(234, 179, 8, 1)',
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
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-700 transition-transform hover:-translate-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Requests</p>
                        <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{analytics.totalLeaves}</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-700 transition-transform hover:-translate-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Pending Approval</p>
                        <h3 className="text-3xl font-bold text-yellow-500">{analytics.pendingLeaves}</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-700 transition-transform hover:-translate-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Approval Rate</p>
                        <h3 className="text-3xl font-bold text-green-500">{analytics.approvalRate}%</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-700 transition-transform hover:-translate-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Top Leave Type</p>
                        <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 truncate">{analytics.commonLeaveType}</h3>
                    </div>
                </div>
            )}

            {/* Chart Section */}
            {analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center mb-6">
                            <BarChart3 className="w-5 h-5 mr-3 text-indigo-500" />
                            Monthly Leave Trends
                        </h3>
                        <div className="h-64 w-full relative">
                            <Line options={chartOptions} data={chartData} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center mb-6">
                            <BarChart3 className="w-5 h-5 mr-3 text-indigo-500" />
                            Status Distribution
                        </h3>
                        <div className="h-64 w-full relative flex items-center justify-center">
                            <Doughnut options={doughnutOptions} data={doughnutData} />
                        </div>
                    </div>
                </div>
            )}

            {/* Leave Approval Table */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
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
                                    className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-shadow"
                                />
                            </div>

                            <div className="relative">
                                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="pl-9 pr-4 py-2 w-full sm:w-auto rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Pending">Pending</option>
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
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : filteredLeaves.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            No leave requests found matching filters.
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Employee</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Leave Type</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Duration</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Reason</th>
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
                                            <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md ${leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                                                leave.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
                                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                                                }`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {leave.status === 'Pending' ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(leave._id, 'Approved')}
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
