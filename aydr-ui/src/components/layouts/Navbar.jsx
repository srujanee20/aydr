import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_AVATAR = '/images/avatar-default.png';

const Navbar = () => {
    const { isAuthenticated, user, logout, isProvider } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const dashboardPath = isProvider ? '/provider/dashboard' : '/customer/dashboard';
    const profilePath = isProvider ? '/provider/settings' : '/customer/profile';

    return (
        <nav className="navbar">
            <div className="navbar__container">
                <Link to="/" className="navbar__logo">
                    Ay<span>dr</span>
                </Link>

                <div className="navbar__links">
                    {isAuthenticated ? (
                        <>
                            <Link to={dashboardPath} className="navbar__link">Dashboard</Link>
                            <Link to={profilePath} className="navbar__link">
                                <img
                                    src={user?.profilePic || DEFAULT_AVATAR}
                                    alt={user?.name}
                                    className="navbar__avatar"
                                />
                                <span className="navbar__username">{user?.name?.split(' ')[0]}</span>
                            </Link>
                            <button onClick={handleLogout} className="navbar__btn navbar__btn--logout">
                                Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar__link">Log In</Link>
                            <Link to="/register" className="navbar__btn">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;