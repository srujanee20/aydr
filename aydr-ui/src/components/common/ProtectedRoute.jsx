import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Wraps a route that requires authentication.
 * Optionally restricts by role ('CUSTOMER' | 'PROVIDER').
 */
const ProtectedRoute = ({ children, role }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return <LoadingSpinner />;

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (role && user?.role !== role) {
        // Wrong role — redirect to their correct dashboard
        const redirect = user?.role === 'PROVIDER' ? '/provider/dashboard' : '/customer/dashboard';
        return <Navigate to={redirect} replace />;
    }

    return children;
};

export default ProtectedRoute;
