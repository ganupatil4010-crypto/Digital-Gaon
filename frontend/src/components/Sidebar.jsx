import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'listings', label: 'My Listings', icon: '📦' },
    { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'profile', label: 'Profile Settings', icon: '👤' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">Digital Gaon</div>
      
      <div className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}

        <div
          className={`nav-item highlight ${activeTab === 'add-product' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-product')}
        >
          <span>➕</span>
          <span>Add Product</span>
        </div>
      </div>

      <div style={{ padding: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        © 2026 Digital Gaon
      </div>
    </div>
  );
};

export default Sidebar;
