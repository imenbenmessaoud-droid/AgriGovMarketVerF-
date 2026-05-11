import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: `http://${window.location.hostname}:8000/api/`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for API calls
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Token ${token}`; // Adjusted for DRF Token Auth
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (!error.response) {
            toast.error('Network error. You might be offline or rural signal is weak.', {
                id: 'network-error',
            });
        }
        if (error.response && error.response.status === 401) {
            // Uncomment if you wish to auto-logout on unauthorized
            // localStorage.removeItem('token');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
