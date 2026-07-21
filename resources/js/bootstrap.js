import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Auto-attach CSRF token from cookie so axios.post works on web.php routes
const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

if (token) {
    window.axios.defaults.headers.common['X-XSRF-TOKEN'] = decodeURIComponent(token);
}

// Also handle token refresh on every response (in case token rotates)
window.axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 419) {
            // CSRF token mismatch — reload page to get fresh token
            window.location.reload();
        }
        return Promise.reject(error);
    }
);
