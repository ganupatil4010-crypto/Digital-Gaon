// Central API configuration
const getBaseUrl = () => {
    // Check if we are running locally
    if (typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' || 
         window.location.hostname.includes('192.168'))) {
        return 'http://localhost:5000';
    }

    // Dynamic Production URL (Vite environment variable or Hardcoded Fallback)
    // IMPORTANT: Change this URL if your Render backend URL changes
    return import.meta.env.VITE_API_URL || 'https://digital-gaon-backend-new.onrender.com';
};

const API_BASE_URL = getBaseUrl();

export default API_BASE_URL;
