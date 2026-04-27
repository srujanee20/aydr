import { useState } from 'react';
import useApi from '../../hooks/useApi';

const DEFAULT_AVATAR = '/images/avatar-default.png';

const AvatarUpload = ({ currentImage, onUploadSuccess, folder = 'avatars' }) => {
    const [,, uploading, call] = useApi();
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('folder', folder);

        try {
            setError('');
            const data = await call('POST', '/uploads/single', formData);
            onUploadSuccess(data.url);
        } catch (err) {
            setError('Upload failed');
            console.error(err);
        }
    };

    return (
        <div className="profile-page__avatar-section">
            <div className="profile-page__avatar-wrapper">
                <img
                    src={currentImage || DEFAULT_AVATAR}
                    alt="Avatar"
                    className="profile-page__avatar"
                />
                <label className="profile-page__avatar-upload">
                    📷
                    <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                </label>
            </div>
            {uploading && <p className="profile-page__uploading">Uploading...</p>}
            {error && <p className="profile-page__message profile-page__message--error" style={{ marginTop: '0.5rem' }}>{error}</p>}
        </div>
    );
};

export default AvatarUpload;
