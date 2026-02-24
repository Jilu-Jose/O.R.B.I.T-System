import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    console.log("PROTECTED ROUTE RENDER. user:", user, "loading:", loading);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Basic redirect for unauthorized access
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
