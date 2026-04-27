import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import useApi from '../../../hooks/useApi';
import AvatarUpload from '../../common/AvatarUpload';

const DEFAULT_AVATAR = '/images/avatar-default.png';

const CustomerProfile = () => {
    const { user, refreshUser } = useAuth();
    const [,, loading, call] = useApi();
    const [,, uploading, uploadCall] = useApi();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const payload = { ...formData };
            if (!payload.phone) delete payload.phone;

            await call('PUT', '/users/me', payload);
            await refreshUser();
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
        }
    };



    return (
        <main className="profile-page">
            <div className="profile-page__container">
                <h1>My Profile</h1>
                <p className="profile-page__subtitle">Manage your personal information</p>

                {/* Avatar Section */}
                <AvatarUpload 
                    currentImage={user?.profilePic} 
                    onUploadSuccess={async (url) => {
                        await call('PUT', '/users/me', { profilePic: url });
                        await refreshUser();
                        setMessage({ type: 'success', text: 'Profile picture updated!' });
                    }} 
                />

                {/* Profile Form */}
                <form className="profile-page__form" onSubmit={handleSubmit}>
                    {message.text && (
                        <div className={`profile-page__message profile-page__message--${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <label>
                        <span>Full Name</span>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            maxLength={50}
                        />
                    </label>

                    <label>
                        <span>Email</span>
                        <input type="email" value={user?.email || ''} disabled />
                    </label>

                    <label>
                        <span>Phone</span>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Phone number"
                            minLength={10}
                            maxLength={15}
                        />
                    </label>

                    <button type="submit" className="profile-page__save" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </main>
    );
};

export default CustomerProfile;
