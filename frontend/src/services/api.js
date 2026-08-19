import axios from 'axios';

const api = axios.create({
    // Hardcoded for local dev. In production, this should point to Render URL
    baseURL: 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
