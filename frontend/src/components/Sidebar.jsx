import { Home, Package, Heart, User, PlusCircle, Shield, X, BookOpen, TrendingUp, Store, Milk, Stethoscope, Car, Hotel, Sprout } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, userRole, isOpen, onClose }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home size={20} /> },
    { id: 'listings', label: 'My Listings', icon: <Package size={20} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart size={20} /> },
    { id: 'profile', label: 'Profile Settings', icon: <User size={20} /> },
    { id: 'khata', label: 'Digital Khata', icon: <BookOpen size={20} /> },
    { id: 'vyapar', label: 'Vyapar Saathi', icon: <Store size={20} /> },
    { id: 'study', label: 'Study Streak', icon: <TrendingUp size={20} /> },
    { id: 'dairy', label: 'Dairy Saathi', icon: <Milk size={20} /> },
    { id: 'pashu', label: 'Pashu Saathi', icon: <Stethoscope size={20} /> },
    { id: 'agri', label: 'Agri Saathi', icon: <Sprout size={20} /> },
    { id: 'yatra', label: 'Yatra Saathi', icon: <Car size={20} /> },
    { id: 'hotel', label: 'Hotel Saathi', icon: <Hotel size={20} /> },
  ];

  // Add Admin Panel to the top if user is authorized admin
  const ADMIN_EMAIL = 'tgund5858@gmail.com';
  const currentEmail = (localStorage.getItem('userEmail') || '').toLowerCase().trim();
  
  if (userRole === 'admin' && currentEmail === ADMIN_EMAIL) {
    menuItems.unshift({ id: 'admin', label: 'Admin Panel', icon: <Shield size={20} /> });
  }


  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header hide-desktop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '1rem' }}>
        <div className="sidebar-logo">Digital <span>Gaon</span></div>
        <button 
          onClick={onClose} 
          className="menu-toggle" 
          style={{ display: 'flex', background: 'transparent', border: 'none', padding: '8px' }}
        >
          <X size={24} color="var(--text-muted)" />
        </button>
      </div>

      <div className="sidebar-logo hide-mobile" style={{ padding: '2rem' }}>Digital Gaon</div>
      
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
