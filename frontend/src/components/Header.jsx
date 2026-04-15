import React from 'react';
import { LogOut } from 'lucide-react';

const Header = ({ userName, onLogout }) => {
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ 
          width: '35px', 
          height: '35px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          fontSize: '0.9rem'
        }}>
          {userName ? userName[0].toUpperCase() : 'U'}
        </div>
        <div style={{ fontWeight: '500' }}>
          Welcome, <span style={{ color: 'var(--primary)' }}>{userName || 'User'}</span>
        </div>
      </div>

      <button onClick={onLogout} className="btn btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <LogOut size={16} />
        Logout
      </button>
    </header>
  );
};

export default Header;
