import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
      axios.get(`/api/user/profile?email=${encodeURIComponent(email)}`)
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

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home userVillage={user.village} />;
      case 'listings':
        return <MyListings />;
      case 'add-product':
        return <AddProduct />;
      case 'wishlist':
        return <Wishlist />;
      case 'admin':
        return <AdminPanel />;
      case 'profile':
        return <Profile user={user} userEmail={userEmail} onUpdate={handleProfileUpdate} />;
      default:
        return <Home userVillage={user.village} />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={user.role} />
      
      <div className="main-wrapper">
        <Header userName={user.name} onLogout={onLogout} />
        
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
