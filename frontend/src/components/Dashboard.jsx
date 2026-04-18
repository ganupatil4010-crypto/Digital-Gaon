import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import Sidebar from './Sidebar';
import Header from './Header';
import Home from './Home';
import MyListings from './MyListings';
import AddProduct from './AddProduct';
import Wishlist from './Wishlist';

import Profile from './Profile';
import FarmerChatbot from './FarmerChatbot';
import AdminPanel from './AdminPanel';

const Dashboard = ({ onLogout, userEmail }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState({
    name: '',
    village: '',
    phone: '',
    role: 'user',
  });

  // Fetch profile from DB on mount
  useEffect(() => {
    const email = userEmail || localStorage.getItem('userEmail');
    if (email) {
      axios.get(`${API_BASE_URL}/api/user/profile?email=${encodeURIComponent(email)}`)
        .then(res => {
          const data = res.data;
          setUser({
            name: data.name || email.split('@')[0],
            village: data.village || '',
            phone: data.phone || '',
            role: data.role || 'user',
          });
        })
        .catch(err => {
          console.log('Could not fetch profile:', err.message);
          // Use email username as fallback name
          setUser(prev => ({ ...prev, name: email.split('@')[0] }));
        });
    }
  }, [userEmail]);

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home userVillage={user.village} userEmail={userEmail || localStorage.getItem('userEmail')} />;
      case 'listings':
        return <MyListings userEmail={userEmail || localStorage.getItem('userEmail')} />;
      case 'add-product':
        return <AddProduct userEmail={userEmail || localStorage.getItem('userEmail')} />;
      case 'wishlist':
        return <Wishlist userEmail={userEmail || localStorage.getItem('userEmail')} />;
      case 'admin':
        return <AdminPanel />;
      case 'profile':
        return <Profile user={user} userEmail={userEmail || localStorage.getItem('userEmail')} onUpdate={handleProfileUpdate} />;
      default:
        return <Home userVillage={user.village} />;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Overlay for mobile */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} 
        onClick={closeSidebar}
      ></div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          closeSidebar(); // Close on mobile navigation
        }} 
        userRole={user.role} 
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
      
      <div className="main-wrapper">
        <Header 
          userName={user.name} 
          onLogout={onLogout} 
          onMenuToggle={toggleSidebar}
        />
        
        <main className="content-area">
          {renderContent()}
        </main>
      </div>

      <div className="bg-blobs"></div>
      <FarmerChatbot />
    </div>
  );
};

export default Dashboard;
