import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, AlertCircle, LayoutGrid } from 'lucide-react';
import '../Auth.css';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }
        setLoading(true);
        setError('');
        try {
            await signup(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error('[Auth] Signup Error:', err);
            setError(err.response?.data?.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page bg-blobs">
            <div className="auth-card-premium">
                <div className="auth-header">
                    <div className="auth-logo-icon">
                        <LayoutGrid size={32} color="white" />
                    </div>
                    <h1>Join Us</h1>
                    <p>Create your Digital Gaon account today</p>
                </div>
                
                {error && (
                    <div className="error-message">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <label>Full Name</label>
                        <div className="auth-input-wrapper">
                            <input 
                                type="text" 
                                className="auth-input-premium"
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                placeholder="Enter your full name"
                                required 
                            />
                            <User className="auth-input-icon" size={20} />
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <label>Email Address</label>
                        <div className="auth-input-wrapper">
                            <input 
                                type="email" 
                                className="auth-input-premium"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="name@example.com"
                                required 
                            />
                            <Mail className="auth-input-icon" size={20} />
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <label>Password</label>
                        <div className="auth-input-wrapper">
                            <input 
                                type="password" 
                                className="auth-input-premium"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Min. 6 characters"
                                required 
                            />
                            <Lock className="auth-input-icon" size={20} />
                        </div>
                    </div>
                    
                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? (
                            <div className="spinner" style={{ borderTopColor: '#ffffff', width: '24px', height: '24px' }}></div>
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <UserPlus size={20} />
                                Create Account
                            </span>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
