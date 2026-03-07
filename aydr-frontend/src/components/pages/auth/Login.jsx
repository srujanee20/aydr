import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useApi from '../../../hooks/useApi';

const Login = () => {
  const navigate = useNavigate();
  // We extract 'error' out of useApi because we are taking manual control of it
  const [data, error, loading, call] = useApi(); 
  
  const [isProvider, setIsProvider] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // Local error control
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleChange = event => {
    setLoginData({ ...loginData, [event.target.name]: event.target.value });
  };

  // NEW: A dedicated function to swap forms and wipe stale errors
  const handleToggle = providerFlag => {
    setIsProvider(providerFlag);
    setErrorMessage(''); 
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setErrorMessage(''); // Clear out any old error on a fresh submit attempt

    try {
      const response = await call('POST', '/auth/login', loginData);
      
      const token = response?.data?.data?.accessToken;
      const expiresIn = response?.data?.data?.expiresIn;

      if (token) {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('expiresIn', expireIn);

        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const userRole = decodedPayload.scp;

        if (userRole === 'PROVIDER') {
          navigate('/provider-dashboard');
        } else {
          navigate('/');
        }
      }

    } catch (err) {
      // Safely dig into the Axios error object, with a fallback for dead servers
      const errorText = err.response?.data?.message || err.response?.data?.detail || 'Network error. Please try again.';
      setErrorMessage(errorText);
    }
  };

  return (
    <main className="auth-page">
      <div className={`auth-container ${isProvider ? 'provider-active' : ''}`}>

        {/* LEFT SIDE: Provider Login Form */}
        <div className="form-container provider-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Provider Login</h2>
            
            {errorMessage && isProvider && (
              <p className="error-text" style={{ color: 'red', fontSize: '0.9rem' }}>
                {errorMessage}
              </p>
            )}

            <input type="email" name="email" value={loginData.email} onChange={handleChange} placeholder="Email Address" required />
            <input type="password" name="password" value={loginData.password} onChange={handleChange} placeholder="Password" required />

            <button type="submit" className="auth-form__btn" disabled={loading}>
              {loading && isProvider ? 'Logging in...' : 'Log In'}
            </button>
            <p className="auth-form__link">New here? <Link to="/register">Sign Up</Link></p>
          </form>
        </div>

        {/* RIGHT SIDE: Customer Login Form */}
        <div className="form-container customer-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Customer Login</h2>
            
            {errorMessage && !isProvider && (
              <p className="error-text" style={{ color: 'red', fontSize: '0.9rem' }}>
                {errorMessage}
              </p>
            )}

            <input type="email" name="email" value={loginData.email} onChange={handleChange} placeholder="Email Address" required />
            <input type="password" name="password" value={loginData.password} onChange={handleChange} placeholder="Password" required />

            <button type="submit" className="auth-form__btn" disabled={loading}>
              {loading && !isProvider ? 'Logging in...' : 'Log In'}
            </button>
            <p className="auth-form__link">New here? <Link to="/register">Sign Up</Link></p>
          </form>
        </div>

        {/* THE SLIDING OVERLAY */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h2>Provider Portal</h2>
              <p>Log in to manage your jobs, update your availability, and get to work.</p>
              <button type="button" className="ghost-btn" onClick={() => handleToggle(true)}>
                Provider Login
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h2>Customer Portal</h2>
              <p>Log in to request services and track your ongoing jobs.</p>
              <button type="button" className="ghost-btn" onClick={() => handleToggle(false)}>
                Customer Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;