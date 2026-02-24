import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, // Important for cookies
});

// Response interceptor for catching auth errors (like expired token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If we get a 401 Unauthorized globally from an API
        if (error.response && error.response.status === 401) {
            if (!error.config.url.includes('/auth/login')) {
                window.dispatchEvent(new Event('auth-unauthorized'));
            }
        }
        return Promise.reject(error);
    }
);

export default api;
