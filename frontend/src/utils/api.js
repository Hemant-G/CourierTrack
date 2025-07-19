import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach token to requests
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Ensure this line is EXACTLY as below:
            config.headers.Authorization = `Bearer ${token.trim()}`; // <--- CRITICAL
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;