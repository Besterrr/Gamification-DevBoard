import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000' });

export function setupInterceptors(accessToken, refreshToken, updateTokens, logout) {
    api.interceptors.request.clear();
    api.interceptors.response.clear();

    api.interceptors.request.use((config) => {
        config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
    });

    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            if (error.response?.status === 401) {
                try {
                    const refreshResponse = await axios.post('http://localhost:5000/api/auth/refresh', {
                        refreshToken
                    });
                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
                    updateTokens(newAccessToken, newRefreshToken);
                    error.config.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(error.config);
                }catch{
                    logout();
                }
            }
            return Promise.reject(error);
        }
    );
}

export default api;