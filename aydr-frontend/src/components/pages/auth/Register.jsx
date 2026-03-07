import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';

const Register = () => {
  const navigate = useNavigate();
  const [data, error, loading, call] = useApi();
  const [isProvider, setIsProvider] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    serviceCategory: '',
    basePrice: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e, role) => {
    e.preventDefault();
    
    // Attach the correct role to the payload
    const payload = { ...formData, role };

    try {
      const response = await call('POST', '/api/auth/register', payload);
      
      // Axios throws errors automatically, so if we reach this line, it was a success.
      if (response) {
        // Redirect to login page upon successful registration
        navigate('/login');
      }
    } catch (err) {
      console.error('Registration failed', err);
    }
  };

  return (
    <main className="auth-page">
      <div className={`auth-container ${isProvider ? 'provider-active' : ''}`}>

        {/* LEFT SIDE: Provider Registration Form */}
        <div className="form-container provider-container">
          <form className="auth-form" onSubmit={(e) => handleSubmit(e, 'PROVIDER')}>
            <h2>Become a Provider</h2>
            
            {error && isProvider && (
              <p className="error-text" style={{ color: 'red', fontSize: '0.9rem' }}>
                {error?.message || error?.detail || 'Registration failed'}
              </p>
            )}

            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required />
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
            
            <input type="text" name="serviceCategory" value={formData.serviceCategory} onChange={handleChange} placeholder="Service Category (e.g., Plumbing)" required />
            <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} placeholder="Base Price (₹)" min="1" required />
            
            <button type="submit" className="auth-form__btn" disabled={loading}>
              {loading && isProvider ? 'Creating Account...' : 'Sign Up as Provider'}
            </button>
            <p className="auth-form__link">Already have an account? <Link to="/login">Log In</Link></p>
          </form>
        </div>

        {/* RIGHT SIDE: Customer Registration Form */}
        <div className="form-container customer-container">
          <form className="auth-form" onSubmit={(e) => handleSubmit(e, 'CUSTOMER')}>
            <h2>Join as a Customer</h2>

            {error && !isProvider && (
              <p className="error-text" style={{ color: 'red', fontSize: '0.9rem' }}>
                {error?.message || error?.detail || 'Registration failed'}
              </p>
            )}

            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required />
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
            
            <button type="submit" className="auth-form__btn" disabled={loading}>
              {loading && !isProvider ? 'Creating Account...' : 'Sign Up as Customer'}
            </button>
            <p className="auth-form__link">Already have an account? <Link to="/login">Log In</Link></p>
          </form>
        </div>

        {/* THE SLIDING OVERLAY */}
        <div className="overlay-container">
          <div className="overlay">

            <div className="overlay-panel overlay-left">
              <h2>Are you a Provider?</h2>
              <p>Join our platform to offer your services and grow your business.</p>
              <button type="button" className="ghost-btn" onClick={() => setIsProvider(true)}>
                Sign Up as Provider
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <h2>Looking for Services?</h2>
              <p>Sign up as a customer to find trusted providers near you.</p>
              <button type="button" className="ghost-btn" onClick={() => setIsProvider(false)}>
                Sign Up as Customer
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;