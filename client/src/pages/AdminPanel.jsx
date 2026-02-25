import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { UserPlus, Trash2, Shield, X, BarChart3, IndianRupee, Check } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const AdminPanel = () => {
    const location = useLocation();
    const isDashboard = location.pathname === '/';
    const isUserManagement = location.pathname === '/users';

    const [users, setUsers] = useState([]);
    const [reimbursements, setReimbursements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Add User Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Employee',
        department: '',
        leaveBalance: 20
    });
    const [addingUser, setAddingUser] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const [usersRes, reimbursementsRes] = await Promise.all([
                api.get('/users'),
                api.get('/reimbursements')
            ]);
            setUsers(usersRes.data);
            setReimbursements(reimbursementsRes.data);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const { data } = await api.patch(`/users/${userId}`, { role: newRole });
            setUsers(users.map(u => u._id === userId ? data : u));
            toast.success('Role updated successfully');
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${userId}`);
                setUsers(users.filter(u => u._id !== userId));
                toast.success('User deleted successfully');
            } catch (error) {
                toast.error('Failed to delete user');
            }
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setAddingUser(true);
        try {
            await api.post('/users', formData);
            toast.success('User added successfully');
            fetchUsers();
            setShowAddModal(false);
            setFormData({
                name: '', email: '', password: '', role: 'Employee', department: '', leaveBalance: 20
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add user');
        } finally {
            setAddingUser(false);
        }
    };

    const handleUpdateReimbursementStatus = async (id, status) => {
        try {
            await api.patch(`/reimbursements/${id}`, { status });
            toast.success(`Reimbursement request ${status.toLowerCase()}`);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Admin Terminal</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center px-5 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-200 dark:shadow-none font-semibold text-sm"
                >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Add System User
                </button>
            </div>

            {/* Department Chart Row - Only on Dashboard */}
            {isDashboard && !loading && users.length > 0 && (
                <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-neutral-800 p-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center mb-6">
                        <BarChart3 className="w-5 h-5 mr-3 text-orange-500" />
                        Users by Department
                    </h3>
                    <div className="h-64 w-full relative">
                        <Bar
                            data={{
                                labels: Object.keys(
                                    users.reduce((acc, user) => {
                                        acc[user.department] = (acc[user.department] || 0) + 1;
                                        return acc;
                                    }, {})
                                ),
                                datasets: [
                                    {
                                        label: 'Employees',
                                        data: Object.values(
                                            users.reduce((acc, user) => {
                                                acc[user.department] = (acc[user.department] || 0) + 1;
                                                return acc;
                                            }, {})
                                        ),
                                        backgroundColor: 'rgba(249, 115, 22, 0.8)',
                                        borderRadius: 6,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                            }}
                        />
                    </div>
                </div>
            )}

            {/* User Management Table - Only on User Management Tab */}
            {isUserManagement && (
                <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-neutral-800 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
                            <Shield className="w-5 h-5 mr-3 text-orange-500" />
                            User Management
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-50 dark:bg-black/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-neutral-800">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Name</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Email</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Department</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Role</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                                    {users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition duration-150">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                {user.name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                {user.department}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md border-0 bg-opacity-20 focus:ring-2 focus:ring-orange-500 cursor-pointer ${user.role === 'Admin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        user.role === 'Manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}
                                                >
                                                    <option value="Employee" className="font-normal text-gray-900 bg-white dark:bg-neutral-900 dark:text-gray-100">Employee</option>
                                                    <option value="Manager" className="font-normal text-gray-900 bg-white dark:bg-neutral-900 dark:text-gray-100">Manager</option>
                                                    <option value="Admin" className="font-normal text-gray-900 bg-white dark:bg-neutral-900 dark:text-gray-100">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 ml-2"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all border border-gray-100 dark:border-neutral-800">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50/50 dark:bg-neutral-900/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add User</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 dark:hover:text-gray-300 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                                <input
                                    type="text" required
                                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                                <input
                                    type="email" required
                                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                                <input
                                    type="password" required minLength="6"
                                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
                                    <select
                                        value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow"
                                    >
                                        <option>Employee</option>
                                        <option>Manager</option>
                                        <option>Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Leave Balance</label>
                                    <input
                                        type="number" required min="0" max="60"
                                        value={formData.leaveBalance} onChange={(e) => setFormData({ ...formData, leaveBalance: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
                                <input
                                    type="text" required
                                    value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow"
                                    placeholder="e.g. Engineering"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addingUser}
                                    className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200 dark:shadow-none disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {addingUser ? 'Saving...' : 'Save User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reimbursements Approval Table - Only on Dashboard */}
            {isDashboard && (
                <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-neutral-800 overflow-hidden mt-6">
                    <div className="p-6 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50">
                        <div className="flex items-center gap-3">
                            <IndianRupee className="w-6 h-6 text-orange-500" />
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">All Company Reimbursements</h3>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                            </div>
                        ) : reimbursements.length === 0 ? (
                            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                                No reimbursement requests found.
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-50 dark:bg-black/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-neutral-800">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Employee</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Date</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Description</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Amount</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                                    {reimbursements.map((reimb) => (
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
                                                <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md ${reimb.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                                                    reimb.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
                                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                                                    }`}>
                                                    {reimb.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {reimb.status === 'Pending' ? (
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button
                                                            onClick={() => handleUpdateReimbursementStatus(reimb._id, 'Approved')}
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
                                                            <X className="w-5 h-5" />
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
            )}
        </div>
    );
};

export default AdminPanel;
