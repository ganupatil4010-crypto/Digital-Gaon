import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, CheckCircle2, Clock } from 'lucide-react';
import API_BASE_URL from '../config/api';

const FeatureLock = ({ feature, userEmail, children }) => {
  const [status, setStatus] = useState('loading'); // loading | none | pending | approved
  const [requesting, setRequesting] = useState(false);

  const fieldKey = feature === 'yatra' ? 'yatraAccess' : (feature === 'pashu' ? 'pashuAccess' : (feature === 'vyapar' ? 'vyaparAccess' : 'dairyAccess'));
  const featureName = feature === 'yatra' ? 'Yatra Saathi' : (feature === 'pashu' ? 'Pashu Saathi' : (feature === 'vyapar' ? 'Vyapar Saathi' : 'Dairy Saathi'));
  const featureEmoji = feature === 'yatra' ? '🚕' : (feature === 'pashu' ? '🩺' : (feature === 'vyapar' ? '🛒' : '🐄'));
  const accentColor = feature === 'yatra' ? '#f59e0b' : (feature === 'pashu' ? '#10b981' : (feature === 'vyapar' ? '#8b5cf6' : '#10b981'));
  const accentBg = feature === 'yatra' ? 'rgba(245,158,11,0.15)' : (feature === 'pashu' ? 'rgba(16,185,129,0.15)' : (feature === 'vyapar' ? 'rgba(139,92,246,0.15)' : 'rgba(16,185,129,0.15)'));

  const email = userEmail || localStorage.getItem('userEmail');

  useEffect(() => {
    if (!email) return;
    axios.get(`${API_BASE_URL}/api/access/status?email=${encodeURIComponent(email)}`)
      .then(res => setStatus(res.data[fieldKey] || 'none'))
      .catch(() => setStatus('none'));
  }, [email, fieldKey]);

  const handleRequest = async () => {
    setRequesting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/access/request`, { email, feature });
      setStatus(res.data.status);
    } catch { alert('Request failed. Please try again.'); }
    finally { setRequesting(false); }
  };

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif" }}>
        Loading...
      </div>
    );
  }

  if (status === 'approved') return children;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '2rem', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: '440px', width: '100%' }}>
        {/* Lock Icon */}
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: accentBg, border: `2px solid ${accentColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', fontSize: '2.5rem' }}>
          {status === 'pending' ? <Clock size={40} color={accentColor} /> : <Lock size={40} color={accentColor} />}
        </div>

        {/* Feature Name */}
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{featureEmoji}</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', margin: '0 0 0.75rem' }}>{featureName}</h2>

        {status === 'none' && (
          <>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '2rem' }}>
              Yeh feature abhi aapke liye <strong style={{ color: '#fff' }}>locked</strong> hai.<br />
              Admin se access maangne ke liye neeche button dabayein.
            </p>
            <button
              onClick={handleRequest}
              disabled={requesting}
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, color: '#fff', border: 'none', padding: '1rem 2.5rem', borderRadius: '14px', fontSize: '1rem', fontWeight: '700', cursor: requesting ? 'not-allowed' : 'pointer', fontFamily: "'Outfit', sans-serif", boxShadow: `0 8px 24px ${accentColor}40`, transition: 'all 0.2s', opacity: requesting ? 0.7 : 1 }}
            >
              {requesting ? '⏳ Request bhej rahe hain...' : '🔓 Access Request Karo'}
            </button>
          </>
        )}

        {status === 'pending' && (
          <>
            <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ color: '#fbbf24', fontWeight: '700', fontSize: '1rem', marginBottom: '0.4rem' }}>⏳ Request Pending</div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0, lineHeight: '1.6' }}>
                Aapki request admin ko mil gayi hai.<br />
                Admin approve karte hi yeh feature khul jayega!
              </p>
            </div>
            <button
              disabled
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.9rem 2rem', borderRadius: '14px', fontSize: '0.95rem', fontWeight: '600', cursor: 'not-allowed', fontFamily: "'Outfit', sans-serif" }}
            >
              <Clock size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Admin Approval Ka Wait Kar Rahe Hain...
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FeatureLock;
