import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    LogOut, Sun, Moon, Menu, X, Home,
    CalendarDays, Users, Clock, IndianRupee
} from 'lucide-react';

const MainLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <Home className="w-5 h-5" />, roles: ['Employee', 'Manager', 'Admin'] },
        { name: 'Apply Leave', path: '/apply', icon: <CalendarDays className="w-5 h-5" />, roles: ['Employee'] },
        { name: 'Leave History', path: '/history', icon: <Clock className="w-5 h-5" />, roles: ['Employee'] },
        { name: 'Holiday Calendar', path: '/holidays', icon: <Sun className="w-5 h-5" />, roles: ['Employee', 'Manager', 'Admin'] },
        { name: 'Reimbursements', path: '/reimbursements', icon: <IndianRupee className="w-5 h-5" />, roles: ['Employee', 'Manager', 'Admin'] },
        { name: 'Team Leaves', path: '/employee', icon: <Users className="w-5 h-5" />, roles: ['Manager'] },
        { name: 'User Management', path: '/users', icon: <Users className="w-5 h-5" />, roles: ['Admin'] },
        { name: 'Leaves Board', path: '/manager', icon: <CalendarDays className="w-5 h-5" />, roles: ['Admin'] },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-black overflow-hidden font-sans">

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-neutral-900 text-slate-700 dark:text-white border-r border-gray-100 dark:border-neutral-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-16 px-6 bg-gray-50/50 dark:bg-black border-b border-gray-100 dark:border-neutral-800">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 text-white font-bold">O</div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">O.R.B.I.T</span>
                    </div>
                    <button className="lg:hidden text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white" onClick={() => setSidebarOpen(false)}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-2 mt-4">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-2">
                        {user?.role} Panel
                    </div>

                    {navItems.filter(item => item.roles.includes(user?.role)).map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={index}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-orange-600 text-white shadow-[0_4px_20px_rgb(79,70,229,0.25)]'
                                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-white'
                                    }`}
                            >
                                <span className="mr-3">{item.icon}</span>
                                {item.name}
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Top Navbar */}
                <header className="flex flex-shrink-0 items-center justify-between h-16 px-6 bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800/50 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-colors duration-200">
                    <div className="flex items-center">
                        <button
                            className="p-2 mr-4 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800 dark:text-white hidden sm:block">
                            Welcome, {user?.name?.split(' ')[0]}
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700 transition"
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <div className="flex items-center pl-2 border-l border-gray-200 dark:border-neutral-800">
                            <div className="hidden md:flex flex-col items-end mr-3">
                                <span className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{user?.name}</span>
                                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">{user?.role}</span>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-700 dark:text-orange-300 font-bold border border-orange-200 dark:border-orange-700 shadow-sm">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="p-2 ml-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-black p-4 sm:p-6 lg:p-8 transition-colors duration-200">
                    <div className="mx-auto max-w-7xl animate-fade-in pb-12">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
