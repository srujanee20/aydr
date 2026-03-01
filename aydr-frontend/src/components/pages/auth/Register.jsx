import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [isProvider, setIsProvider] = useState(false);

  return (
    <main className="auth-page">
      <div className={`auth-container ${isProvider ? 'provider-active' : ''}`}>
        
        {/* LEFT SIDE: Provider Registration Form */}
        <div className="form-container provider-container">
          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <h2>Become a Provider</h2>
            <input type="text" placeholder="Full Name" required />
            <input type="email" placeholder="Email Address" required />
            <input type="password" placeholder="Password" required />
            <select required defaultValue="">
              <option value="" disabled>Select Service Category</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Cleaning">Cleaning</option>
            </select>
            <input type="number" placeholder="Base Price ($)" min="1" required />
            <button type="submit" className="auth-form__btn">Sign Up as Provider</button>
            <p className="auth-form__link">Already have an account? <Link to="/login">Log In</Link></p>
          </form>
        </div>

        {/* RIGHT SIDE: Customer Registration Form */}
        <div className="form-container customer-container">
          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <h2>Join as a Customer</h2>
            <input type="text" placeholder="Full Name" required />
            <input type="email" placeholder="Email Address" required />
            <input type="password" placeholder="Password" required />
            <button type="submit" className="auth-form__btn">Sign Up as Customer</button>
            <p className="auth-form__link">Already have an account? <Link to="/login">Log In</Link></p>
          </form>
        </div>

        {/* THE SLIDING OVERLAY */}
        <div className="overlay-container">
          <div className="overlay">
            
            <div className="overlay-panel overlay-left">
              <h2>Are you a Provider?</h2>
              <p>Join our platform to offer your services and grow your business.</p>
              <button className="ghost-btn" onClick={() => setIsProvider(true)}>
                Sign Up as Provider
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <h2>Looking for Services?</h2>
              <p>Sign up as a customer to find trusted providers near you.</p>
              <button className="ghost-btn" onClick={() => setIsProvider(false)}>
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