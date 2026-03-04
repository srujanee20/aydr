const { useCallback } = require("react");
const { useState } = require("react");
const { default: apiClient } = require("../configs/axiosConfig");

const useApi = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const execute = useCallback(
        async (method, url, body = null, headers = {}) => {
            setLoading(true);

            setData(null);
            setError(null); 

            try {
                const response = await apiClient({
                    method,
                    url,
                    data: body,
                    headers: { ...apiClient.defaults.headers, ...headers }
                });

                setData(response);
                return response;
            } catch (err) {
                const response = err.response ?? null;
                setError(response)
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return [data, error, loading, execute];
};

export default useApi;