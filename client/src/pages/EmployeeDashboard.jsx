import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, CheckCircle, FileText, Plus, BarChart3, Sun, IndianRupee } from 'lucide-react';
import io from 'socket.io-client';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [leaves, setLeaves] = useState([]);
    const [reimbursements, setReimbursements] = useState([]);
    const [loading, setLoading] = useState(true);

    // Apply Form State
    const [leaveType, setLeaveType] = useState('Sick Leave');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [reason, setReason] = useState('');
    const [applying, setApplying] = useState(false);

    // Reimbursement Form State
    const [reimbursementAmount, setReimbursementAmount] = useState('');
    const [reimbursementDate, setReimbursementDate] = useState('');
    const [reimbursementDescription, setReimbursementDescription] = useState('');
    const [applyingReimbursement, setApplyingReimbursement] = useState(false);

    useEffect(() => {
        fetchData();

        // Setup Socket connection for real-time leave status updates
        const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'] // Try websocket first to avoid polling 400s
        });
        socket.on('leave_status_updated', (data) => {
            if (data.userId === user._id) {
                toast(`The status of your leave was updated to ${data.status}!`, { icon: '🔔' });
                fetchData(); // Refresh the list
            }
        });

        return () => socket.disconnect();
    }, [user._id]);

    const fetchData = async () => {
        try {
            const [leavesRes, reimbursementsRes] = await Promise.all([
                api.get('/leaves'),
                api.get('/reimbursements/my')
            ]);
            setLeaves(leavesRes.data);
            setReimbursements(reimbursementsRes.data);
        } catch (error) {
            toast.error('Failed to fetch data');
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
            fetchData();
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

    const handleApplyReimbursement = async (e) => {
        e.preventDefault();
        setApplyingReimbursement(true);
        try {
            await api.post('/reimbursements', {
                amount: reimbursementAmount,
                date: reimbursementDate,
                description: reimbursementDescription
            });
            toast.success('Reimbursement applied successfully');
            fetchData();
            // Reset form
            setReimbursementAmount('');
            setReimbursementDate('');
            setReimbursementDescription('');
            // Optional: navigate to reimbursements history if we had a separate path
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply reimbursement');
        } finally {
            setApplyingReimbursement(false);
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
                            className="flex items-center justify-center px-5 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-200 dark:shadow-none font-semibold text-sm"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Apply New Leave
                        </button>
                    </div>

                    {/* Summary Cards and Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-neutral-800 flex items-center justify-between transition-transform hover:-translate-y-1">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pending Leaves</p>
                                    <h3 className="text-4xl font-extrabold text-yellow-500 dark:text-yellow-400 tracking-tight">{pendingCount}</h3>
                                </div>
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl text-yellow-500 dark:text-yellow-400 shadow-sm border border-yellow-100 dark:border-transparent">
                                    <Clock className="w-8 h-8" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-neutral-800 flex items-center justify-between transition-transform hover:-translate-y-1">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Approved Leaves</p>
                                    <h3 className="text-4xl font-extrabold text-green-500 dark:text-green-400 tracking-tight">{approvedCount}</h3>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl text-green-500 dark:text-green-400 shadow-sm border border-green-100 dark:border-transparent">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 shadow-[0_8px_30px_rgb(79,70,229,0.2)] dark:shadow-none text-white flex items-center justify-between transition-transform hover:-translate-y-1 sm:col-span-2">
                                <div>
                                    <p className="text-sm font-medium text-orange-100 mb-1">Remaining Balance</p>
                                    <h3 className="text-4xl font-extrabold tracking-tight">
                                        {user?.leaveBalance} <span className="text-xl font-semibold text-orange-200 ml-1">Days</span>
                                    </h3>
                                </div>
                                <div className="p-4 bg-white/20 rounded-2xl text-white backdrop-blur-md shadow-sm border border-white/10">
                                    <Calendar className="w-8 h-8" />
                                </div>
                            </div>
                        </div>

                        {/* Personal Analytics Chart */}
                        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-neutral-800 p-6 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center mb-6">
                                <BarChart3 className="w-5 h-5 mr-3 text-orange-500" />
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
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-neutral-800 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-gray-50/50 dark:bg-neutral-900/50">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
                                <FileText className="w-5 h-5 mr-3 text-orange-500" />
                                Recent Leave Applications
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center p-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
                                </div>
                            ) : leaves.length === 0 ? (
                                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
                                    <p className="text-lg font-medium text-gray-900 dark:text-gray-200">No leave requests found</p>
                                    <p className="mt-1">You haven't applied for any leaves yet.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-gray-50 dark:bg-black/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-neutral-800">
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
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Request New Leave</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please provide the details for your leave application. Your manager will receive a notification for approval.</p>
                            </div>
                            <div className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <span className="mr-2">Balance:</span>
                                <span className="text-orange-600 dark:text-orange-400">{user?.leaveBalance} Days Remaining</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.06)] dark:shadow-none border border-gray-100 dark:border-neutral-800 overflow-hidden mb-6">
                            <form onSubmit={handleApplyLeave} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Leave Type</label>
                                    <select
                                        value={leaveType}
                                        onChange={(e) => setLeaveType(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-shadow text-sm"
                                    >
                                        <option>Select Leave Type</option>
                                        <option>Sick Leave</option>
                                        <option>Casual Leave</option>
                                        <option>Annual Leave</option>
                                        <option>Unpaid Leave</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">From Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-shadow text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">To Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-shadow text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Reason / Notes</label>
                                    <textarea
                                        required
                                        rows="4"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-shadow text-sm resize-none"
                                        placeholder="Briefly explain the reason for your leave request..."
                                    ></textarea>
                                </div>

                                <div className="border-2 border-dashed border-gray-200 dark:border-neutral-700 rounded-xl p-8 text-center bg-gray-50/50 dark:bg-neutral-900/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-500 mb-3">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Drag and drop supporting documents or <span className="text-orange-600 dark:text-orange-400 font-bold">browse</span>
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        (Optional - for medical certificates or official documents)
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        Your request will be sent to your manager for approval.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/')}
                                            className="px-6 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={applying}
                                            className="px-6 py-2.5 bg-orange-600 text-white text-sm font-bold rounded-lg hover:bg-orange-700 transition disabled:opacity-70"
                                        >
                                            {applying ? 'Submitting...' : 'Submit Request'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 text-green-500 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Approved</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{approvedCount} Days</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-500 flex items-center justify-center">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{pendingCount} Days</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Available</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{user?.leaveBalance} Days</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            {/* COMPANY HOLIDAYS VIEW */}
            {
                location.pathname === '/holidays' && (
                    <div className="bg-transparent overflow-hidden max-w-6xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Official Company Holidays
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and track corporate observed days off for the upcoming fiscal year.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 dark:bg-neutral-900 p-1 rounded-lg flex items-center text-sm font-semibold">
                                    <span className="px-3 py-1 text-gray-500 dark:text-gray-400">2025</span>
                                    <span className="px-3 py-1 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm rounded-md">2026</span>
                                </div>
                                <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Export PDF
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { name: "New Year's Day", date: "JANUARY 01", day: "Thursday", type: "PUBLIC", image: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&q=80&w=400&h=200", upcoming: false },
                                { name: "Lunar New Year", date: "JANUARY 29", day: "Thursday", type: "PUBLIC", image: "https://d3i6fh83elv35t.cloudfront.net/static/2023/01/GettyImages-1458699303-e1674487584191-1024x576.jpg", upcoming: false },
                                { name: "Good Friday", date: "APRIL 03", day: "Friday", type: "PUBLIC", image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=400&h=200", upcoming: false },
                                { name: "Labor Day", date: "MAY 01", day: "Friday", type: "COMPANY", image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=400&h=200", upcoming: true },
                                { name: "Independence Day", date: "AUGUST 15", day: "Friday", type: "PUBLIC", image: "https://img.freepik.com/premium-photo/15th-august-happy-independence-day-india-hand-holding-indian-flag_343960-3262.jpg", upcoming: false },
                                { name: "Gandhi Jayanti", date: "OCTOBER 02", day: "Friday", type: "PUBLIC", image: "https://images.moneycontrol.com/static-mcnews/2025/10/20251001063117_happy-gandhi-jayanti.jpeg?impolicy=website&width=770&height=431", upcoming: false },
                                { name: "Diwali", date: "NOVEMBER 01", day: "Sunday", type: "PUBLIC", image: "https://images.unsplash.com/photo-1577083753695-e010191bacb5?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZGl3YWxpfGVufDB8fDB8fHww", upcoming: false },
                                { name: "Christmas Day", date: "DECEMBER 25", day: "Friday", type: "PUBLIC", image: "https://media.istockphoto.com/id/1830908089/photo/christmas-tree-in-beautiful-snowy-winter-landscape.jpg?s=612x612&w=0&k=20&c=BG0GUUibtSWMCrGSYPFH2KNMQBgoPts0e-SJEqn3wo0=", upcoming: false },
                            ].map((holiday, idx) => (
                                <div key={idx} className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.06)] dark:shadow-none border border-gray-100 dark:border-neutral-800 flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow">
                                    <div className="h-32 w-full relative overflow-hidden bg-gray-100 dark:bg-neutral-800">
                                        <img src={holiday.image} alt={holiday.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        {holiday.upcoming && (
                                            <div className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                                                UPCOMING
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{holiday.date}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${holiday.type === 'PUBLIC' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                {holiday.type}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-4">{holiday.name}</h4>
                                        <div className="mt-auto flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {holiday.day}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 bg-blue-50/50 dark:bg-neutral-900/50 rounded-2xl p-6 border border-blue-100 dark:border-neutral-800 flex items-start gap-4">
                            <div className="p-2 bg-white dark:bg-neutral-800 rounded-full text-blue-600 dark:text-blue-400 shadow-sm shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Holiday Policy Note</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All holidays listed above are fully paid for full-time employees.</p>
                            </div>
                            <button className="text-sm font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-colors whitespace-nowrap">
                                View HR Handbook &rarr;
                            </button>
                        </div>
                    </div>
                )}

            {/* REIMBURSEMENTS VIEW */}
            {
                location.pathname === '/reimbursements' && (
                    <div className="space-y-6 max-w-5xl mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Reimbursement Center</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Submit travel expenses and track your active claims.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* APPLY REIMBURSEMENT FORM */}
                            <div className="lg:col-span-1 bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-neutral-800 overflow-hidden h-fit">
                                <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                        <Plus className="w-5 h-5 mr-2 text-orange-500" />
                                        New Claim
                                    </h3>
                                </div>
                                <form onSubmit={handleApplyReimbursement} className="p-6 space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Amount (₹)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <IndianRupee className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                required min="1"
                                                value={reimbursementAmount}
                                                onChange={(e) => setReimbursementAmount(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-shadow shadow-sm font-medium"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Expense Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={reimbursementDate}
                                            onChange={(e) => setReimbursementDate(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-shadow shadow-sm format-date"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                                        <textarea
                                            required
                                            rows="3"
                                            value={reimbursementDescription}
                                            onChange={(e) => setReimbursementDescription(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-shadow shadow-sm resize-none"
                                            placeholder="Client lunch, Flight to NY..."
                                        ></textarea>
                                    </div>
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={applyingReimbursement}
                                            className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200 dark:shadow-none disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                                        >
                                            {applyingReimbursement ? 'Submitting...' : 'Submit Claim'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* REIMBURSEMENTS HISTORY */}
                            <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-neutral-800 overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-gray-50/50 dark:bg-neutral-900/50">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
                                        <FileText className="w-5 h-5 mr-3 text-orange-500" />
                                        Your Claims
                                    </h3>
                                </div>

                                <div className="overflow-x-auto">
                                    {loading ? (
                                        <div className="flex justify-center p-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                                        </div>
                                    ) : reimbursements.length === 0 ? (
                                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                                            <IndianRupee className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
                                            <p className="text-lg font-medium text-gray-900 dark:text-gray-200">No claims found</p>
                                            <p className="mt-1">You haven't submitted any reimbursement claims yet.</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="bg-gray-50 dark:bg-black/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-neutral-800">
                                                <tr>
                                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Date</th>
                                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Description</th>
                                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Amount</th>
                                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                                                {reimbursements.map((reimb) => (
                                                    <tr key={reimb._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition duration-150">
                                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                            {new Date(reimb.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-200 font-medium truncate max-w-[200px]" title={reimb.description}>
                                                            {reimb.description}
                                                        </td>
                                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                            ₹{reimb.amount.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md ${statusColors[reimb.status]}`}>
                                                                {reimb.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default EmployeeDashboard;
