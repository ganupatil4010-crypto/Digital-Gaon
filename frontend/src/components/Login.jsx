import { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const Login = ({ onGoogleLogin }) => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const email = result.user.email;
            console.log(`[Auth] Triggering OTP for: ${email}`);

            
            // Wait for backend to acknowledge OTP request before switching UI
            // This prevents the request from being cancelled during component unmount
            try {
                await axios.post(`${API_BASE_URL}/api/auth/send-otp`, { email });
                console.log('[Auth] Backend acknowledged OTP request ✅');
            } catch (sendErr) {
                console.error('[Auth] Failed to trigger OTP on backend:', sendErr.message);
                // We still proceed to the OTP screen so user can try 'Resend' if needed,
                // but at least we know why it failed.
            }
            
            onGoogleLogin(email);
            
        } catch (err) {
            console.error('[Auth] Login Error:', err);
            setError('Failed to login with Google. Please check your internet connection.');
        } finally {
            setLoading(false);
        }

    };

    return (
        <div className="auth-card">
            <h1>Digital Gaon</h1>
            <p>Experience the future of rural commerce. Log in to start your journey.</p>
            
            {error && <div className="error">{error}</div>}
            
            <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
                {loading ? (
                    <div className="spinner" style={{ borderTopColor: '#8b5cf6' }}></div>
                ) : (
                    <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                        </svg>
                        <span>Continue with Google</span>
                    </>
                )}
            </button>
            <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                By joining, you agree to our <b>Terms of Service</b>.
            </div>
        </div>
    );
};

export default Login;
