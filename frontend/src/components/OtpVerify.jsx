import { useState } from 'react';
import axios from 'axios';

const OtpVerify = ({ email, onVerifySuccess }) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/verify-otp', { email, otp });
            const { token } = res.data;
            
            // Store JWT token
            localStorage.setItem('token', token);
            onVerifySuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card">
            <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Secure Verification</h2>
            <p style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '2rem' }}>
                A 6-digit code has been sent to <br/>
                <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{email}</span>
            </p>
            
            {error && <div className="error">{error}</div>}
            
            <form onSubmit={handleVerify}>
                <div style={{ position: 'relative', marginBottom: '2rem' }}>
                    <input
                        type="text"
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength="6"
                        required
                        className="form-input"
                        style={{ 
                            textAlign: 'center', 
                            fontSize: '2rem', 
                            letterSpacing: '0.8rem', 
                            fontWeight: '700',
                            padding: '1rem 0',
                            margin: 0
                        }}
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? <div className="spinner"></div> : 'Verify & Sign In'}
                </button>
            </form>
            
            <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Didn't receive the code?{' '}
                    <button 
                        type="button"
                        style={{ 
                            background: 'none', 
                            padding: 0, 
                            border: 'none', 
                            color: 'var(--primary)', 
                            fontWeight: '600', 
                            cursor: 'pointer',
                            width: 'auto',
                            display: 'inline',
                            boxShadow: 'none'
                        }}
                    >
                        Resend Code
                    </button>
                </p>
            </div>
        </div>
    );
};

export default OtpVerify;
