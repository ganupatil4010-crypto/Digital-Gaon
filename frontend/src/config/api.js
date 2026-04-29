// Central API configuration
const getBaseUrl = () => {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:5000';
    }
    // Hardcoded for the new deployment to avoid dashboard config issues
    return 'https://digital-gaon-backend-new.onrender.com';
};

const API_BASE_URL = getBaseUrl();

export default API_BASE_URL;
