import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../configs/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Rehydrate user from token on mount
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                setLoading(false);
                return;
            }

            try {
                const payload = JSON.parse(atob(storedToken.split('.')[1]));

                // Token expired — clean up
                if (payload.exp * 1000 < Date.now()) {
                    logout();
                    return;
                }

                // Fetch fresh user profile
                const { data } = await apiClient.get('/users/me', {
                    headers: { Authorization: `Bearer ${storedToken}` }
                });

                setUser(data.user);
                setToken(storedToken);
            } catch {
                logout();
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = useCallback((tokenStr, userData) => {
        localStorage.setItem('token', tokenStr);
        setToken(tokenStr);
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }, []);

    // Refresh user data from server (useful after profile updates)
    const refreshUser = useCallback(async () => {
        try {
            const { data } = await apiClient.get('/users/me');
            setUser(data.user);
        } catch {
            // Silently fail — user stays as-is
        }
    }, []);

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!token && !!user,
        isCustomer: user?.role === 'CUSTOMER',
        isProvider: user?.role === 'PROVIDER',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
