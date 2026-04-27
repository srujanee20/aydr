import { useCallback, useState } from 'react';
import apiClient from '../configs/axiosConfig';

/**
 * Generic API hook wrapping Axios.
 * Returns [data, error, loading, call, reset].
 *
 * `call` returns the response data on success, throws on failure.
 * `reset` clears data, error, and loading state.
 */
const useApi = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const call = useCallback(async (method, url, body = null, config = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiClient({
                method,
                url,
                data: body,
                ...config
            });

            setData(response.data);
            return response.data;
        } catch (err) {
            const errorData = err.response?.data ?? { message: 'Network error. Please try again.' };
            setError(errorData);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return [data, error, loading, call, reset];
};

export default useApi;