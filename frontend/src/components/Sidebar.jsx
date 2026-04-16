import React from 'react';
import { Home, Package, Heart, User, PlusCircle, Shield } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, userRole }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home size={20} /> },
    { id: 'listings', label: 'My Listings', icon: <Package size={20} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart size={20} /> },
    { id: 'profile', label: 'Profile Settings', icon: <User size={20} /> },
  ];

  if (userRole === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: <Shield size={20} /> });
  }

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
            <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}

        <div
          className={`nav-item highlight ${activeTab === 'add-product' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-product')}
        >
          <PlusCircle size={20} />
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
