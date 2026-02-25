import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import ManagerDashboard from '../pages/ManagerDashboard';
import AdminPanel from '../pages/AdminPanel';

const DashboardRouter = () => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    return (
        <MainLayout>
            <Routes>
                {user.role === 'Employee' && (
                    <>
                        <Route path="/" element={<EmployeeDashboard />} />
                        <Route path="/apply" element={<EmployeeDashboard />} />
                        <Route path="/history" element={<EmployeeDashboard />} />
                        <Route path="/holidays" element={<EmployeeDashboard />} />
                        <Route path="/reimbursements" element={<EmployeeDashboard />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                )}

                {user.role === 'Manager' && (
                    <>
                        <Route path="/" element={<ManagerDashboard />} />
                        <Route path="/employee" element={<EmployeeDashboard />} />
                        <Route path="/holidays" element={<EmployeeDashboard />} />
                        <Route path="/reimbursements" element={<EmployeeDashboard />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                )}

                {user.role === 'Admin' && (
                    <>
                        <Route path="/" element={<AdminPanel />} />
                        <Route path="/users" element={<AdminPanel />} />
                        <Route path="/manager" element={<ManagerDashboard />} />
                        <Route path="/employee" element={<EmployeeDashboard />} />
                        <Route path="/holidays" element={<EmployeeDashboard />} />
                        <Route path="/reimbursements" element={<EmployeeDashboard />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                )}

                {/* Fallback route if role is broken or mismatched */}
                {user.role !== 'Employee' && user.role !== 'Manager' && user.role !== 'Admin' && (
                    <Route path="*" element={
                        <div className="flex items-center justify-center p-12 text-center text-gray-500">
                            <div>
                                <h1 className="text-2xl font-bold mb-2">Setup Required</h1>
                                <p>Your account does not have a valid role assigned ({user.role || 'undefined'}). Please contact the administrator.</p>
                            </div>
                        </div>
                    } />
                )}
            </Routes>
        </MainLayout>
    );
};

export default DashboardRouter;
