import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    // In a real app, you might have an /api/auth/me endpoint
                    // For now, we'll store the user in localStorage too or just trust the token
                    const savedUser = JSON.parse(localStorage.getItem('user'));
                    if (savedUser) {
                        setUser(savedUser);
                    }
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } catch (err) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();

        // Global interceptor for 401/403
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [token]);

    const login = async (email, password) => {
        const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
        const { token: newToken, data } = res.data;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userRole', data.user.role);
        
        setToken(newToken);
        setUser(data.user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        return data.user;
    };

    const signup = async (name, email, password) => {
        const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, { name, email, password });
        const { token: newToken, data } = res.data;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userRole', data.user.role);
        
        setToken(newToken);
        setUser(data.user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
