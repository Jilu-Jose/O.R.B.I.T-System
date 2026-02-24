import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, CheckCircle, FileText, Plus, BarChart3, Sun } from 'lucide-react';
import io from 'socket.io-client';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    // Apply Leave Form State
    const [leaveType, setLeaveType] = useState('Sick Leave');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [reason, setReason] = useState('');
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        fetchLeaves();

        // Setup Socket connection for real-time leave status updates
        const socket = io('http://localhost:5000');
        socket.on('leave_status_updated', (data) => {
            if (data.userId === user._id) {
                toast(`The status of your leave was updated to ${data.status}!`, { icon: '🔔' });
                fetchLeaves(); // Refresh the list
            }
        });

        return () => socket.disconnect();
    }, [user._id]);

    const fetchLeaves = async () => {
        try {
            const { data } = await api.get('/leaves');
            setLeaves(data);
        } catch (error) {
            toast.error('Failed to fetch leaves');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        setApplying(true);
        try {
            const { data } = await api.post('/leaves', {
                leaveType,
                fromDate,
                toDate,
                reason
            });
            toast.success('Leave applied successfully');
            if (data.isRisky) {
                toast('Your leave request has been flagged for review due to unusual patterns.', { icon: '⚠️' });
            }
            fetchLeaves();
            // Reset form and navigate to history
            setLeaveType('Sick Leave');
            setFromDate('');
            setToDate('');
            setReason('');
            navigate('/history');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply leave');
        } finally {
            setApplying(false);
        }
    };

    const pendingCount = leaves.filter(l => l.status === 'Pending').length;
    const approvedCount = leaves.filter(l => l.status === 'Approved').length;

    const statusColors = {
        Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
        Approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
        Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
    };

    const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;

    const doughnutData = {
        labels: ['Approved', 'Pending', 'Rejected'],
        datasets: [
            {
                data: [approvedCount, pendingCount, rejectedCount],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(234, 179, 8, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(234, 179, 8, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right' },
        },
        cutout: '75%',
    };

    return (
        <div className="space-y-6">

            {/* DASHBOARD OVERVIEW VIEW */}
            {location.pathname === '/' && (
                <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Dashboard Overview</h2>
                        <button
                            onClick={() => navigate('/apply')}
                            className="flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none font-semibold text-sm"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Apply New Leave
                        </button>
                    </div>

                    {/* Summary Cards and Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-700 flex items-center justify-between transition-transform hover:-translate-y-1">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pending Leaves</p>
                                    <h3 className="text-4xl font-extrabold text-yellow-500 dark:text-yellow-400 tracking-tight">{pendingCount}</h3>
                                </div>
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl text-yellow-500 dark:text-yellow-400 shadow-sm border border-yellow-100 dark:border-transparent">
                                    <Clock className="w-8 h-8" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-700 flex items-center justify-between transition-transform hover:-translate-y-1">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Approved Leaves</p>
                                    <h3 className="text-4xl font-extrabold text-green-500 dark:text-green-400 tracking-tight">{approvedCount}</h3>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl text-green-500 dark:text-green-400 shadow-sm border border-green-100 dark:border-transparent">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-3xl p-6 shadow-[0_8px_30px_rgb(79,70,229,0.2)] dark:shadow-none text-white flex items-center justify-between transition-transform hover:-translate-y-1 sm:col-span-2">
                                <div>
                                    <p className="text-sm font-medium text-indigo-100 mb-1">Remaining Balance</p>
                                    <h3 className="text-4xl font-extrabold tracking-tight">
                                        {user?.leaveBalance} <span className="text-xl font-semibold text-indigo-200 ml-1">Days</span>
                                    </h3>
                                </div>
                                <div className="p-4 bg-white/20 rounded-2xl text-white backdrop-blur-md shadow-sm border border-white/10">
                                    <Calendar className="w-8 h-8" />
                                </div>
                            </div>
                        </div>

                        {/* Personal Analytics Chart */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-700 p-6 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center mb-6">
                                <BarChart3 className="w-5 h-5 mr-3 text-indigo-500" />
                                Leave Distribution
                            </h3>
                            <div className="flex-1 w-full relative flex items-center justify-center min-h-[200px]">
                                {leaves.length > 0 ? (
                                    <Doughnut options={doughnutOptions} data={doughnutData} />
                                ) : (
                                    <p className="text-gray-400 dark:text-gray-500 text-sm">No leave data to display</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* LEAVE HISTORY VIEW */}
            {
                location.pathname === '/history' && (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
                                <FileText className="w-5 h-5 mr-3 text-indigo-500" />
                                Recent Leave Applications
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center p-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : leaves.length === 0 ? (
                                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
                                    <p className="text-lg font-medium text-gray-900 dark:text-gray-200">No leave requests found</p>
                                    <p className="mt-1">You haven't applied for any leaves yet.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Leave Type</th>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">From Date</th>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">To Date</th>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Reason</th>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                                        {leaves.map((leave) => (
                                            <tr key={leave._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition duration-150">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    {leave.leaveType}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                    {new Date(leave.fromDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                    {new Date(leave.toDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 truncate max-w-[200px]" title={leave.reason}>
                                                    {leave.reason}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md ${statusColors[leave.status]}`}>
                                                        {leave.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )
            }

            {/* APPLY FORM VIEW */}
            {
                location.pathname === '/apply' && (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-700 overflow-hidden max-w-2xl mx-auto">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Apply for Leave</h3>
                        </div>

                        <form onSubmit={handleApplyLeave} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Leave Type</label>
                                <select
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-shadow shadow-sm font-medium"
                                >
                                    <option>Sick Leave</option>
                                    <option>Casual Leave</option>
                                    <option>Annual Leave</option>
                                    <option>Unpaid Leave</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">From</label>
                                    <input
                                        type="date"
                                        required
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-shadow shadow-sm format-date"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">To</label>
                                    <input
                                        type="date"
                                        required
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-shadow shadow-sm format-date"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Reason</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-shadow shadow-sm resize-none"
                                    placeholder="Need time off for personal errands..."
                                ></textarea>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={applying}
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {applying ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

            {/* COMPANY HOLIDAYS VIEW */}
            {
                location.pathname === '/holidays' && (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-700 overflow-hidden max-w-4xl mx-auto">
                        <div className="px-6 py-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800/80 dark:to-slate-800/40">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                    <Sun className="w-6 h-6 mr-3 text-orange-500" />
                                    Official Company Holidays
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-9">Plan your leaves around these upcoming days off.</p>
                            </div>
                            <div className="bg-white dark:bg-slate-700 px-4 py-2 rounded-xl shadow-sm text-sm font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-600">
                                {new Date().getFullYear()} Calendar
                            </div>
                        </div>

                        <div className="p-2 sm:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { name: "New Year's Day", date: "January 1", day: "Monday", type: "Public" },
                                    { name: "Martin Luther King Jr. Day", date: "January 15", day: "Monday", type: "Public" },
                                    { name: "Memorial Day", date: "May 27", day: "Monday", type: "Public" },
                                    { name: "Independence Day", date: "July 4", day: "Thursday", type: "Public" },
                                    { name: "Labor Day", date: "September 2", day: "Monday", type: "Public" },
                                    { name: "Thanksgiving Day", date: "November 28", day: "Thursday", type: "Public" },
                                    { name: "Day after Thanksgiving", date: "November 29", day: "Friday", type: "Public" },
                                    { name: "Christmas Eve", date: "December 24", day: "Tuesday", type: "Corporate" },
                                    { name: "Christmas Day", date: "December 25", day: "Wednesday", type: "Public" },
                                ].map((holiday, idx) => (
                                    <div key={idx} className="flex items-center p-4 rounded-2xl border border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors group">
                                        <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 flex flex-col items-center justify-center shadow-sm group-hover:border-indigo-300 dark:group-hover:border-indigo-500 transition-colors shrink-0">
                                            <span className="text-xs font-bold text-red-500 uppercase">{holiday.date.split(' ')[0].substring(0, 3)}</span>
                                            <span className="text-lg font-black text-gray-900 dark:text-white leading-none mt-0.5">{holiday.date.split(' ')[1]}</span>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h4 className="font-bold text-gray-900 dark:text-white">{holiday.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{holiday.day}</p>
                                        </div>
                                        <div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${holiday.type === 'Public' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                                }`}>
                                                {holiday.type}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default EmployeeDashboard;
