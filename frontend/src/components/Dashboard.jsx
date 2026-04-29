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
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user: authUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: authUser?.name || '',
    village: '',
    phone: '',
    role: authUser?.role || 'user',
  });

  const userEmail = authUser?.email;

  // Fetch profile from DB on mount
  useEffect(() => {
    if (userEmail) {
      axios.get(`${API_BASE_URL}/api/user/profile?email=${encodeURIComponent(userEmail)}`)
        .then(res => {
          const data = res.data;
          setUserProfile({
            name: data.name || authUser.name,
            village: data.village || '',
            phone: data.phone || '',
            role: authUser.role,
          });
        })
        .catch(err => {
          console.log('Could not fetch profile:', err.message);
          setUserProfile(prev => ({ 
            ...prev, 
            name: authUser?.name || userEmail.split('@')[0],
            role: authUser?.role || 'user'
          }));
        });
    }
  }, [userEmail, authUser]);

  const handleProfileUpdate = (updatedUser) => {
    setUserProfile(updatedUser);
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
          userVillage={userProfile.village} 
          userEmail={userEmail} 
          setActiveTab={setActiveTab} 
        />;
      case 'listings':
        return <MyListings userEmail={userEmail} />;
      case 'add-product':
        return <AddProduct userEmail={userEmail} />;
      case 'wishlist':
        return <Wishlist userEmail={userEmail} />;
      case 'admin':
        return <AdminPanel />;
      case 'profile':
        return <Profile user={userProfile} userEmail={userEmail} onUpdate={handleProfileUpdate} />;
      case 'khata':
        return <ExpenseTracker userEmail={userEmail} />;
      case 'vyapar':
        return (
          <FeatureLock feature="vyapar" userEmail={userEmail}>
            <VyaparSaathi userEmail={userEmail} />
          </FeatureLock>
        );
      case 'study':
        return <StudyStreak userEmail={userEmail} />;
      case 'dairy':
        return (
          <FeatureLock feature="dairy" userEmail={userEmail}>
            <DairySaathi userEmail={userEmail} />
          </FeatureLock>
        );
        case 'pashu':
          return (
            <FeatureLock feature="pashu" userEmail={userEmail}>
              <PashuSaathi userEmail={userEmail} />
            </FeatureLock>
          );
        case 'yatra':
          return (
            <FeatureLock feature="yatra" userEmail={userEmail}>
              <YatraSaathi userEmail={userEmail} />
            </FeatureLock>
          );
        case 'hotel':
          return (
            <FeatureLock feature="hotel" userEmail={userEmail}>
              <HotelSaathi userEmail={userEmail} />
            </FeatureLock>
          );
        case 'agri':
          return (
            <FeatureLock feature="agri" userEmail={userEmail}>
              <KrishiKendra userEmail={userEmail} />
            </FeatureLock>
          );
      default:
        return <Home userVillage={userProfile.village} />;
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
        userRole={userProfile.role} 
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
      
      <div className="main-wrapper">
        <Header 
          userName={userProfile.name} 
          onLogout={logout} 
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
