import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [isProvider, setIsProvider] = useState(false);

  return (
    <main className="auth-page">
      <div className={`auth-container ${isProvider ? 'provider-active' : ''}`}>
        
        {/* LEFT SIDE: Provider Login Form */}
        <div className="form-container provider-container">
          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <h2>Provider Login</h2>
            <input type="email" placeholder="Email Address" required />
            <input type="password" placeholder="Password" required />
            <button type="submit" className="auth-form__btn">Log In</button>
            <p className="auth-form__link">New here? <Link to="/register">Sign Up</Link></p>
          </form>
        </div>

        {/* RIGHT SIDE: Customer Login Form */}
        <div className="form-container customer-container">
          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <h2>Customer Login</h2>
            <input type="email" placeholder="Email Address" required />
            <input type="password" placeholder="Password" required />
            <button type="submit" className="auth-form__btn">Log In</button>
            <p className="auth-form__link">New here? <Link to="/register">Sign Up</Link></p>
          </form>
        </div>

        {/* THE SLIDING OVERLAY */}
        <div className="overlay-container">
          <div className="overlay">
            
            <div className="overlay-panel overlay-left">
              <h2>Provider Portal</h2>
              <p>Log in to manage your jobs, update your availability, and get to work.</p>
              <button className="ghost-btn" onClick={() => setIsProvider(true)}>
                Provider Login
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <h2>Customer Portal</h2>
              <p>Log in to request services and track your ongoing jobs.</p>
              <button className="ghost-btn" onClick={() => setIsProvider(false)}>
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