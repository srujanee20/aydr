import { useCallback, useState } from "react";
import apiClient from "../configs/axiosConfig";

const useApi = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const call = useCallback(async (method, url, body = null, headers = {}) => {
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

                setData(response.data);
                return response;
            } catch (err) {
                const response = err.response ?? null;
                setError(response.data)
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return [data, error, loading, call];
};

export default useApi;