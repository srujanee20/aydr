import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // For FormData, remove Content-Type so the browser XHR sets
    // multipart/form-data + boundary automatically (including file binary data).
    // Setting manually causes axios to serialize FormData itself → empty file bytes.
    if (config.data instanceof FormData) {
        config.headers['Content-Type'] = undefined;
    }
    return config;
});

// Global 401 handler — auto-logout on expired/invalid tokens
// Skips auth routes so login errors propagate normally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;