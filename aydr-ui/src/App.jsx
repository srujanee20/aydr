import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import Navbar from './components/layouts/Navbar';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Home from './components/pages/Home';
import Login from './components/pages/auth/Login';
import Register from './components/pages/auth/Register';
import CustomerDashboard from './components/pages/customer/CustomerDashboard';
import ProviderDetail from './components/pages/customer/ProviderDetail';
import CustomerProfile from './components/pages/customer/CustomerProfile';
import ProviderDashboard from './components/pages/provider/ProviderDashboard';
import ProviderBookings from './components/pages/provider/ProviderBookings';
import ProviderSettings from './components/pages/provider/ProviderSettings';

const App = () => {
    const { loading } = useAuth();

    if (loading) return <LoadingSpinner size="lg" text="Loading Aydr..." />;

    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Customer */}
                <Route path="/customer/dashboard" element={
                    <ProtectedRoute role="CUSTOMER"><CustomerDashboard /></ProtectedRoute>
                } />
                <Route path="/customer/provider/:id" element={
                    <ProtectedRoute role="CUSTOMER"><ProviderDetail /></ProtectedRoute>
                } />
                <Route path="/customer/profile" element={
                    <ProtectedRoute role="CUSTOMER"><CustomerProfile /></ProtectedRoute>
                } />

                {/* Provider */}
                <Route path="/provider/dashboard" element={
                    <ProtectedRoute role="PROVIDER"><ProviderDashboard /></ProtectedRoute>
                } />
                <Route path="/provider/bookings" element={
                    <ProtectedRoute role="PROVIDER"><ProviderBookings /></ProtectedRoute>
                } />
                <Route path="/provider/settings" element={
                    <ProtectedRoute role="PROVIDER"><ProviderSettings /></ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
