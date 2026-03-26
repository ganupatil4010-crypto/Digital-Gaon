import React, { useState } from 'react';

const Profile = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user?.name || 'Tejas Patil',
    village: user?.village || 'Warud, Maharashtra',
    phone: user?.phone || '+91 9876543210',
  });

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
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            position: 'relative'
          }}>
            {formData.name[0]}
            <div style={{ 
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
              border: '2px solid var(--bg)'
            }}>📸</div>
          </div>
          <h2 style={{ marginBottom: '0.25rem' }}>{formData.name}</h2>
          <p style={{ marginBottom: 0 }}>📍 {formData.village}</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
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
            <label>Phone Number (Read-only)</label>
            <input 
              className="form-input" 
              value={formData.phone} 
              readOnly 
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
            💾 Save Changes
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
          <h3 style={{ color: '#ef4444', fontSize: '1.1rem', marginBottom: '1rem' }}>Account Danger Zone</h3>
          <button className="btn btn-danger" style={{ width: '100%' }}>Deactivate My Account</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
