import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import useApi from '../../../hooks/useApi';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [,, loading, call] = useApi();

    const [isProvider, setIsProvider] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleToggle = (providerFlag) => {
        setIsProvider(providerFlag);
        setErrorMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            const payload = { ...formData, role: isProvider ? 'PROVIDER' : 'CUSTOMER' };
            const data = await call('POST', '/auth/login', payload);

            login(data.token, data.user);

            if (data.user.role === 'PROVIDER') {
                navigate('/provider/dashboard');
            } else {
                navigate('/customer/dashboard');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Network error. Please try again.';

            // Special message for unapproved providers
            if (err.response?.status === 403) {
                setErrorMessage(msg + ' Your account may be pending admin approval.');
            } else {
                setErrorMessage(msg);
            }
        }
    };

    return (
        <main className="auth-page">
            <div className={`auth-container ${isProvider ? 'provider-active' : ''}`}>

                {/* LEFT: Provider Login Form */}
                <div className="form-container provider-container">
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-form__icon">🔧</div>
                        <h2>Provider Login</h2>
                        <p className="auth-form__subtitle">Manage your services and bookings</p>

                        {errorMessage && isProvider && (
                            <div className="auth-form__error">{errorMessage}</div>
                        )}

                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required />
                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />

                        <button type="submit" className="auth-form__btn" disabled={loading}>
                            {loading && isProvider ? 'Logging in...' : 'Log In as Provider'}
                        </button>
                        <p className="auth-form__link">New here? <Link to="/register">Sign Up</Link></p>
                    </form>
                </div>

                {/* RIGHT: Customer Login Form */}
                <div className="form-container customer-container">
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-form__icon">🏠</div>
                        <h2>Customer Login</h2>
                        <p className="auth-form__subtitle">Find local professionals near you</p>

                        {errorMessage && !isProvider && (
                            <div className="auth-form__error">{errorMessage}</div>
                        )}

                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required />
                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />

                        <button type="submit" className="auth-form__btn" disabled={loading}>
                            {loading && !isProvider ? 'Logging in...' : 'Log In as Customer'}
                        </button>
                        <p className="auth-form__link">New here? <Link to="/register">Sign Up</Link></p>
                    </form>
                </div>

                {/* Sliding Overlay */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h2>Provider Portal</h2>
                            <p>Log in to manage your jobs, update availability, and grow your business.</p>
                            <button type="button" className="ghost-btn" onClick={() => handleToggle(true)}>
                                Provider Login →
                            </button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h2>Customer Portal</h2>
                            <p>Log in to request services and track your ongoing jobs.</p>
                            <button type="button" className="ghost-btn" onClick={() => handleToggle(false)}>
                                Customer Login →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Login;