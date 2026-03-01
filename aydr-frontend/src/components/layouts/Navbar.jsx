import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo">
          Ay<span>dr</span>
        </Link>

        <div className="navbar__links">
          <Link to="/login" className="navbar__link">Log In</Link>
          <Link to="/register" className="navbar__btn">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;