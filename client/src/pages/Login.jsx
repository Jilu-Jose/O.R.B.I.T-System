import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Employee');
    const [isLoading, setIsLoading] = useState(false);

    const { login, user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && !loading) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password || !role) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            setIsLoading(true);
            await login(email, password, role);
            toast.success('Login successful!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) return null;

    return (
        <div className="flex min-h-screen font-sans bg-gray-50 dark:bg-slate-900">
            {/* Left side - Illustration */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 justify-center p-12 relative overflow-hidden">
                {/* Modern subtle ambient glow effects */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/30 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>

                <div className="relative z-10 w-full max-w-lg text-left flex flex-col justify-center h-full">
                    <div className="flex items-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center rotate-3 shadow-2xl shadow-indigo-500/30 backdrop-blur-sm border border-white/10">
                            <span className="text-white text-3xl font-bold -rotate-3">O</span>
                        </div>
                        <h1 className="text-5xl font-extrabold text-white ml-6 text-left leading-tight tracking-tight">
                            Orbit.<br />
                            <span className="text-indigo-400 font-medium text-3xl mt-2 block">Enterprise Management</span>
                        </h1>
                    </div>

                    <p className="text-slate-400 text-lg max-w-md leading-relaxed mb-12">
                        Streamline your organization's workflow tracking, analytics, and leave management through our integrated enterprise solution.
                    </p>

                    <div className="mt-auto bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-4">
                                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-500"></div>
                                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-purple-500"></div>
                                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-blue-500 flex items-center justify-center text-xs font-bold text-white">+2k</div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Trusted by professionals</p>
                                <p className="text-xs text-slate-400">Join the growing network</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-6 py-12 lg:px-16 transition-colors duration-200">
                <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-700/50">
                    <div className="text-center lg:text-left mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Welcome Back</h2>
                        <p className="text-gray-500 dark:text-gray-400">Please sign in to your enterprise account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Select Role
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50/50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium hover:border-gray-300 dark:hover:border-slate-500"
                                required
                            >
                                <option value="Admin">System Administrator</option>
                                <option value="Manager">Department Head</option>
                                <option value="Employee">Team Member</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Corporate Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50/50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm placeholder:text-gray-400 hover:border-gray-300 dark:hover:border-slate-500"
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors">
                                    Forgot Password?
                                </a>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50/50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm placeholder:text-gray-400 hover:border-gray-300 dark:hover:border-slate-500 tracking-widest"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3.5 px-4 mt-2 flex justify-center items-center rounded-xl text-white font-bold bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all shadow-[0_8px_20px_rgb(79,70,229,0.3)] dark:shadow-none ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700/50">
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors">
                                Apply for Access
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
