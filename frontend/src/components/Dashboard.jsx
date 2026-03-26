import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Home from './Home';
import MyListings from './MyListings';
import AddProduct from './AddProduct';
import Wishlist from './Wishlist';
import Messages from './Messages';
import Profile from './Profile';

const Dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState({
    name: 'Tejas Patil',
    village: 'Warud, Maharashtra',
    phone: '+91 9876543210'
  });

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
      case 'messages':
        return <Messages />;
      case 'profile':
        return <Profile user={user} />;
      default:
        return <Home userVillage={user.village} />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="main-wrapper">
        <Header userName={user.name} onLogout={onLogout} />
        
        <main className="content-area">
          {renderContent()}
        </main>
      </div>

      <div className="bg-blobs"></div>
    </div>
  );
};

export default Dashboard;
