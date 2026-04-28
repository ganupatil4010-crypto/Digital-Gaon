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
import ExpenseTracker from './ExpenseTracker';
import VyaparSaathi from './VyaparSaathi';
import StudyStreak from './StudyStreak';
import DairySaathi from './DairySaathi';
import PashuSaathi from './PashuSaathi';
import YatraSaathi from './YatraSaathi';
import HotelSaathi from './HotelSaathi';
import KrishiKendra from './KrishiKendra';
import FeatureLock from './FeatureLock';

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
          localStorage.setItem('userRole', data.role || 'user');
          console.log('User Role Fetched:', data.role);
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
        return <Home 
          userVillage={user.village} 
          userEmail={userEmail || localStorage.getItem('userEmail')} 
          setActiveTab={setActiveTab} 
        />;
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
      case 'khata':
        return <ExpenseTracker userEmail={userEmail || localStorage.getItem('userEmail')} />;
      case 'vyapar':
        return (
          <FeatureLock feature="vyapar" userEmail={userEmail || localStorage.getItem('userEmail')}>
            <VyaparSaathi userEmail={userEmail || localStorage.getItem('userEmail')} />
          </FeatureLock>
        );
      case 'study':
        return <StudyStreak userEmail={userEmail || localStorage.getItem('userEmail')} />;
      case 'dairy':
        return (
          <FeatureLock feature="dairy" userEmail={userEmail || localStorage.getItem('userEmail')}>
            <DairySaathi userEmail={userEmail || localStorage.getItem('userEmail')} />
          </FeatureLock>
        );
        case 'pashu':
          return (
            <FeatureLock feature="pashu" userEmail={userEmail || localStorage.getItem('userEmail')}>
              <PashuSaathi userEmail={userEmail || localStorage.getItem('userEmail')} />
            </FeatureLock>
          );
        case 'yatra':
          return (
            <FeatureLock feature="yatra" userEmail={userEmail || localStorage.getItem('userEmail')}>
              <YatraSaathi userEmail={userEmail || localStorage.getItem('userEmail')} />
            </FeatureLock>
          );
        case 'hotel':
          return (
            <FeatureLock feature="hotel" userEmail={userEmail || localStorage.getItem('userEmail')}>
              <HotelSaathi userEmail={userEmail || localStorage.getItem('userEmail')} />
            </FeatureLock>
          );
        case 'agri':
          return (
            <FeatureLock feature="agri" userEmail={userEmail || localStorage.getItem('userEmail')}>
              <KrishiKendra userEmail={userEmail || localStorage.getItem('userEmail')} />
            </FeatureLock>
          );
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
