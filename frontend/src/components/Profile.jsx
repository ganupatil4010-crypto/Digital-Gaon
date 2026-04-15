import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, MapPin, Loader2, Save, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';

const Profile = ({ user, userEmail, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    village: user?.village || '',
    phone: user?.phone || '',
    avatar: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Sync form when user prop changes (e.g. after DB fetch in Dashboard)
  useEffect(() => {
    const email = userEmail || localStorage.getItem('userEmail');
    let loadedAvatar = '';
    if (email) {
      loadedAvatar = localStorage.getItem(`avatar_${email}`) || '';
    }

    if (user) {
      setFormData({
        name: user.name || '',
        village: user.village || '',
        phone: user.phone || '',
        avatar: loadedAvatar,
      });
    } else {
      setFormData(prev => ({ ...prev, avatar: loadedAvatar }));
    }
  }, [user, userEmail]);

  const handleSave = async (e) => {
    e.preventDefault();
    const email = userEmail || localStorage.getItem('userEmail');
    if (!email) {
      setSaveMsg('User email not found. Please re-login.');
      return;
    }

    setSaving(true);
    setSaveMsg('');
    try {
      const res = await axios.put('/api/user/profile', {
        email,
        name: formData.name,
        village: formData.village,
        phone: formData.phone,
        avatar: formData.avatar,
      });
      setSaveMsg('Profile saved successfully!');
      // Notify parent so Header name updates too
      if (onUpdate) {
        onUpdate({
          name: res.data.name || formData.name,
          village: res.data.village || formData.village,
          phone: res.data.phone || formData.phone,
        });
      }
    } catch (err) {
      console.error('Profile save error:', err);
      setSaveMsg('Failed to save. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  return (
    <div className="profile-page">
      <h1 className="page-title">Profile Settings</h1>

      <div className="auth-card" style={{ maxWidth: '600px', margin: '0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            margin: '0 auto 1.5rem',
            background: formData.avatar ? `url(${formData.avatar}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            position: 'relative',
            color: 'white',
            border: '4px solid var(--glass-border)'
          }}>
            {!formData.avatar && (formData.name ? formData.name[0]?.toUpperCase() : '?')}
            <label style={{ 
              position: 'absolute', 
              bottom: '0', 
              right: '0', 
              background: 'white', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              cursor: 'pointer',
              border: '2px solid var(--bg)',
              color: 'black',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
            }}>
              <Camera size={16} />
              <input 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64String = reader.result;
                      setFormData(prev => ({ ...prev, avatar: base64String }));
                      // Save to local storage for persistence for this specific user
                      const email = userEmail || localStorage.getItem('userEmail');
                      if (email) {
                        localStorage.setItem(`avatar_${email}`, base64String);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
              />
            </label>
          </div>
          <h2 style={{ marginBottom: '0.25rem' }}>{formData.name || 'User'}</h2>
          <p style={{ marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
            <MapPin size={14} /> {formData.village || 'Location not set'}
          </p>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              className="form-input" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Village / Location</label>
            <input 
              className="form-input" 
              value={formData.village} 
              onChange={(e) => setFormData({...formData, village: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              className="form-input" 
              value={formData.phone} 
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="Enter your phone number"
            />
          </div>

          {saveMsg && (
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '1rem', 
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: saveMsg.includes('successfully') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: saveMsg.includes('successfully') ? 'var(--success)' : 'var(--error)'
            }}>
              {saveMsg.includes('successfully') ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {saveMsg}
            </div>
          )}

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem', gap: '0.5rem' }} disabled={saving}>
            {saving ? (
              <><Loader2 size={20} className="animate-spin" /> Saving...</>
            ) : (
              <><Save size={20} /> Save Changes</>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
          <h3 style={{ color: '#ef4444', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} />
            Account Danger Zone
          </h3>
          <button className="btn btn-danger" style={{ width: '100%' }}>Deactivate My Account</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
