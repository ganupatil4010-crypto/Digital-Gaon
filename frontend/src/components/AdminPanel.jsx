import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Users, ShoppingBag, Trash2, Shield, BarChart3, Search, Megaphone, Plus, ExternalLink, Power, Camera, Store, Milk, CheckCircle2, XCircle, Stethoscope, Car, Hotel } from 'lucide-react';
import API_BASE_URL from '../config/api';

const AdminPanel = () => {
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState({ users: 0, products: 0, wishlistItems: 0 });
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pendingRequests, setPendingRequests] = useState({ vyapar: [], dairy: [], pashu: [], yatra: [], hotel: [] });
    const [approvedUsers, setApprovedUsers] = useState({ vyapar: [], dairy: [], pashu: [], yatra: [], hotel: [] });
    const [newAd, setNewAd] = useState({ title: '', imageUrl: '', redirectUrl: '', placement: 'grid' });
    const [isAddingAd, setIsAddingAd] = useState(false);

    const API_URL = '/api/admin';

    const getHeaders = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    useEffect(() => {
        fetchStats();
        fetchPendingRequests();
        fetchApprovedUsers();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}${API_URL}/stats`, getHeaders());
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching admin stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/access/pending`);
            setPendingRequests({
                vyapar: res.data.vyapar || [],
                dairy: res.data.dairy || [],
                pashu: res.data.pashu || [],
                yatra: res.data.yatra || [],
                hotel: res.data.hotel || []
            });
        } catch (err) { console.error('Error fetching access requests:', err); }
    };

    const handleAccessAction = async (userId, feature, action) => {
        try {
            await axios.put(`${API_BASE_URL}/api/access/manage`, { userId, feature, action });
            fetchPendingRequests();
            fetchApprovedUsers();
        } catch { alert('Action failed.'); }
    };

    const fetchApprovedUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/access/approved`);
            setApprovedUsers({
                vyapar: res.data.vyapar || [],
                dairy: res.data.dairy || [],
                pashu: res.data.pashu || [],
                yatra: res.data.yatra || [],
                hotel: res.data.hotel || []
            });
        } catch (err) { console.error('Error fetching approved users:', err); }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}${API_URL}/users`, getHeaders());
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}${API_URL}/products`, getHeaders());
            setProducts(res.data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAds = async () => {
        setLoading(true);
        try {
            console.log('Fetching ads from:', `${API_BASE_URL}/api/admin/ads`);
            const res = await axios.get(`${API_BASE_URL}/api/admin/ads`, getHeaders());
            setAds(res.data);
        } catch (err) {
            console.error('Error fetching ads:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'products') fetchProducts();
        if (activeTab === 'ads') fetchAds();
        if (activeTab === 'vyapar-requests' || activeTab === 'dairy-requests' || activeTab === 'pashu-requests' || activeTab === 'yatra-requests' || activeTab === 'hotel-requests') {
            fetchPendingRequests();
            fetchApprovedUsers();
        }
    }, [activeTab]);

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`${API_BASE_URL}${API_URL}/users/${id}`, getHeaders());
            fetchUsers();
            fetchStats();
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await axios.delete(`${API_BASE_URL}${API_URL}/products/${id}`, getHeaders());
            fetchProducts();
            fetchStats();
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    const handleCreateAd = async (e) => {
        e.preventDefault();
        try {
            console.log('Saving ad to:', `${API_BASE_URL}/api/admin/ads`);
            await axios.post(`${API_BASE_URL}/api/admin/ads`, newAd, getHeaders());
            alert('Advertisement saved successfully!');
            setNewAd({ title: '', imageUrl: '', redirectUrl: '', placement: 'grid' });
            setIsAddingAd(false);
            fetchAds();
        } catch (err) {
            console.error('Ad creation error:', err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
            alert('Failed to save ad: ' + errMsg);
        }
    };

    const handleDeleteAd = async (id) => {
        console.log('--- FRONTEND: Attempting to delete ad via POST with ID:', id);
        
        try {
            // Using POST to /ads/delete/:id for maximum reliability across environments
            const res = await axios.post(`${API_BASE_URL}/api/admin/ads/delete/${id}`, {}, getHeaders());
            console.log('--- FRONTEND: Delete Response:', res.status, res.data);
            alert('Advertisement deleted successfully');
            fetchAds();
        } catch (err) {
            console.error('--- FRONTEND: Ad deletion error:', err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
            alert('Failed to delete ad: ' + errMsg);
        }
    };

    const handleToggleAd = async (id) => {
        try {
            await axios.patch(`${API_BASE_URL}/api/admin/ads/${id}/toggle`, {}, getHeaders());
            fetchAds();
        } catch (err) {
            alert('Failed to toggle ad status');
        }
    };

    const handleAdFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Image size should be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewAd({ ...newAd, imageUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredUsers = users.filter(u => 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredProducts = products.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.sellerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredAds = ads.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && activeTab === 'stats') {
        return (
            <div className="admin-container animate-fadeIn">
                <div className="glass-card" style={{ textAlign: 'center', padding: '5rem' }}>
                    <div className="loader"></div>
                    <p style={{ color: 'white', marginTop: '1rem' }}>Loading Admin Panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container animate-fadeIn">
            <div className="glass-card">
                {/* Header */}
                <div className="admin-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <Shield style={{ width: '40px', height: '40px', color: 'white' }} />
                        <div>
                            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'white', margin: 0 }}>
                                Admin Panel
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                Digital Gaon Management System
                            </p>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            System Status
                        </div>
                        <div style={{ color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                            Operational
                        </div>
                    </div>
                </div>

                {/* Tab Pill System */}
                <div style={{ display: 'flex', marginBottom: '2.5rem', maxWidth: '100%' }}>
                    <div className="tabs-wrapper">
                        <button 
                            onClick={() => setActiveTab('stats')}
                            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
                        >
                            <BarChart3 size={18} /> 
                            <span>Overview</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('users')}
                            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        >
                            <Users size={18} /> 
                            <span>Users</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('products')}
                            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                        >
                            <ShoppingBag size={18} /> 
                            <span>Products</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('ads')}
                            className={`tab-btn ${activeTab === 'ads' ? 'active' : ''}`}
                        >
                            <Megaphone size={18} /> 
                            <span>Ads</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('vyapar-requests')}
                            className={`tab-btn ${activeTab === 'vyapar-requests' ? 'active' : ''}`}
                            style={{ position: 'relative' }}
                        >
                            <Store size={18} /> 
                            <span>Vyapar Req.</span>
                            {pendingRequests.vyapar?.length > 0 && (
                                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {pendingRequests.vyapar.length}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab('dairy-requests')}
                            className={`tab-btn ${activeTab === 'dairy-requests' ? 'active' : ''}`}
                            style={{ position: 'relative' }}
                        >
                            <Milk size={18} /> 
                            <span>Dairy Req.</span>
                            {pendingRequests.dairy?.length > 0 && (
                                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {pendingRequests.dairy.length}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab('pashu-requests')}
                            className={`tab-btn ${activeTab === 'pashu-requests' ? 'active' : ''}`}
                            style={{ position: 'relative' }}
                        >
                            <Stethoscope size={18} /> 
                            <span>Pashu Req.</span>
                            {pendingRequests.pashu?.length > 0 && (
                                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {pendingRequests.pashu.length}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab('yatra-requests')}
                            className={`tab-btn ${activeTab === 'yatra-requests' ? 'active' : ''}`}
                            style={{ position: 'relative' }}
                        >
                            <Car size={18} /> 
                            <span>Yatra Req.</span>
                            {pendingRequests.yatra?.length > 0 && (
                                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {pendingRequests.yatra.length}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab('hotel-requests')}
                            className={`tab-btn ${activeTab === 'hotel-requests' ? 'active' : ''}`}
                            style={{ position: 'relative' }}
                        >
                            <Hotel size={18} /> 
                            <span>Hotel Req.</span>
                            {pendingRequests.hotel?.length > 0 && (
                                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {pendingRequests.hotel.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Dashboard Stats */}
                {activeTab === 'stats' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
                        <div className="stat-card">
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Total Users</span>
                            <span style={{ fontSize: '3.5rem', fontWeight: '700', color: 'white', letterSpacing: '-0.02em', marginBottom: '1rem' }}>{stats.users}</span>
                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '700' }}>
                                Community Growth
                            </div>
                        </div>

                        <div className="stat-card">
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Active Products</span>
                            <span style={{ fontSize: '3.5rem', fontWeight: '700', color: 'white', letterSpacing: '-0.02em', marginBottom: '1rem' }}>{stats.products}</span>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '700' }}>
                                Verified Listings
                            </div>
                        </div>

                        <div className="stat-card">
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Total Saves</span>
                            <span style={{ fontSize: '3.5rem', fontWeight: '700', color: 'white', letterSpacing: '-0.02em', marginBottom: '1rem' }}>{stats.wishlistItems}</span>
                            <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '700' }}>
                                High Engagement
                            </div>
                        </div>
                    </div>
                )}

                {/* Management Views */}
                {(activeTab === 'users' || activeTab === 'products') && (
                    <div className="animate-fadeIn">
                        {/* Search and Filter */}
                        <div className="admin-search-container">
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '16px' }} />
                                <input 
                                    className="admin-search-input"
                                    type="text"
                                    placeholder={`Search ${activeTab === 'users' ? 'by name or email' : 'by title or seller'}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div style={{ overflowX: 'auto', borderRadius: '16px' }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        {activeTab === 'users' ? (
                                            <>
                                                <th>User Information</th>
                                                <th>Location</th>
                                                <th>Access Level</th>
                                                <th style={{ textAlign: 'right' }}>Management</th>
                                            </>
                                        ) : (
                                            <>
                                                <th>Listing Details</th>
                                                <th>Seller Node</th>
                                                <th>Value (INR)</th>
                                                <th style={{ textAlign: 'right' }}>Management</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeTab === 'users' && filteredUsers.map(user => (
                                        <tr key={user._id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <img 
                                                        src={user.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.email} 
                                                        className="admin-avatar" 
                                                        alt=""
                                                    />
                                                    <div>
                                                        <div style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>{user.name || 'Citizen'}</div>
                                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.village || '-'}</td>
                                            <td>
                                                <span style={{ 
                                                    padding: '0.25rem 0.75rem', 
                                                    borderRadius: '8px', 
                                                    fontSize: '0.65rem', 
                                                    fontWeight: '800', 
                                                    textTransform: 'uppercase', 
                                                    background: user.role === 'admin' ? 'white' : 'rgba(255,255,255,0.05)', 
                                                    color: user.role === 'admin' ? 'black' : 'var(--text-muted)' 
                                                }}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button onClick={() => handleDeleteUser(user._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', opacity: 0.6, cursor: 'pointer' }}>
                                                    <Trash2 size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {activeTab === 'products' && filteredProducts.map(product => (
                                        <tr key={product._id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <img src={product.img} className="admin-avatar" alt="" />
                                                    <div style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>{product.title}</div>
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>{product.sellerEmail}</td>
                                            <td style={{ color: '#10b981', fontWeight: '700' }}>₹{product.price}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button onClick={() => handleDeleteProduct(product._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', opacity: 0.6, cursor: 'pointer' }}>
                                                    <Trash2 size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Ads Management View */}
                {activeTab === 'ads' && (
                    <div className="animate-fadeIn">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div className="admin-search-container" style={{ flex: 1, marginBottom: 0 }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '16px' }} />
                                    <input 
                                        className="admin-search-input"
                                        type="text"
                                        placeholder="Search ads by title..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsAddingAd(!isAddingAd)}
                                className="btn btn-primary" 
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
                            >
                                <Plus size={18} />
                                {isAddingAd ? 'Close Form' : 'New Ad'}
                            </button>
                        </div>

                        {/* Add Ad Form */}
                        {isAddingAd && (
                            <form onSubmit={handleCreateAd} style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Ad Image (Local Upload)</label>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            style={{ display: 'none' }} 
                                            ref={fileInputRef}
                                            onChange={handleAdFileChange}
                                        />
                                        <div 
                                            onClick={() => fileInputRef.current.click()}
                                            style={{ 
                                                border: '2px dashed rgba(255,255,255,0.1)', 
                                                borderRadius: '12px', 
                                                padding: '1.5rem', 
                                                textAlign: 'center',
                                                background: 'rgba(0,0,0,0.2)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {newAd.imageUrl ? (
                                                <img src={newAd.imageUrl} alt="Preview" style={{ maxHeight: '100px', borderRadius: '8px' }} />
                                            ) : (
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                    <Camera size={24} style={{ marginBottom: '0.5rem' }} /><br/>
                                                    Click to select image from device
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ gridColumn: 'span 1' }}>
                                        <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Ad Title</label>
                                        <input 
                                            type="text" 
                                            className="admin-search-input" 
                                            style={{ paddingLeft: '1rem' }}
                                            value={newAd.title} 
                                            onChange={(e) => setNewAd({...newAd, title: e.target.value})} 
                                            required 
                                        />
                                    </div>
                                    <div style={{ gridColumn: 'span 1' }}>
                                        <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Redirect URL (Optional)</label>
                                        <input 
                                            type="text" 
                                            className="admin-search-input" 
                                            style={{ paddingLeft: '1rem' }}
                                            placeholder="https://example.com"
                                            value={newAd.redirectUrl} 
                                            onChange={(e) => setNewAd({...newAd, redirectUrl: e.target.value})} 
                                        />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Placement Type</label>
                                        <select 
                                            className="admin-search-input" 
                                            style={{ paddingLeft: '1rem', appearance: 'none' }}
                                            value={newAd.placement} 
                                            onChange={(e) => setNewAd({...newAd, placement: e.target.value})} 
                                            required 
                                        >
                                            <option value="grid">Grid Ad (Between products)</option>
                                            <option value="main">Main Ad (Top Banner)</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary">Save Ad</button>
                                    <button type="button" className="btn" style={{ background: 'rgba(255,255,255,0.05)' }} onClick={() => setIsAddingAd(false)}>Cancel</button>
                                </div>
                            </form>
                        )}

                        {/* Ads List */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {filteredAds.map(ad => (
                                <div key={ad._id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                    <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                                    <div style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>{ad.title}</h3>
                                                <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                                    <span style={{ 
                                                        padding: '0.15rem 0.4rem', 
                                                        borderRadius: '4px', 
                                                        fontSize: '0.55rem', 
                                                        fontWeight: '800', 
                                                        background: ad.placement === 'main' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                                        color: ad.placement === 'main' ? '#c084fc' : 'var(--text-muted)',
                                                        border: `1px solid ${ad.placement === 'main' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`
                                                    }}>
                                                        {ad.placement ? ad.placement.toUpperCase() : 'GRID'}
                                                    </span>
                                                </div>
                                                <a href={ad.redirectUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', marginTop: '4px' }}>
                                                    <ExternalLink size={12} /> View Link
                                                </a>
                                            </div>
                                            <span style={{ 
                                                padding: '0.2rem 0.6rem', 
                                                borderRadius: '6px', 
                                                fontSize: '0.6rem', 
                                                fontWeight: '800', 
                                                background: ad.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', 
                                                color: ad.isActive ? '#10b981' : 'var(--text-muted)' 
                                            }}>
                                                {ad.isActive ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                                            <button 
                                                onClick={() => handleToggleAd(ad._id)} 
                                                style={{ background: 'transparent', border: 'none', color: ad.isActive ? '#ef4444' : '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.8rem', gap: '4px', fontWeight: '600' }}
                                            >
                                                <Power size={14} /> {ad.isActive ? 'Disable' : 'Enable'}
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if(window.confirm('Are you sure you want to delete this ad?')) {
                                                        handleDeleteAd(ad._id);
                                                    }
                                                }} 
                                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.8rem', gap: '4px', fontWeight: '600' }}
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* Vyapar Requests */}
                {activeTab === 'vyapar-requests' && (
                    <div className="animate-fadeIn">
                        <h3 style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Store size={20} color="#8b5cf6" /> Vyapar Saathi — Access Requests
                        </h3>

                        {/* Pending */}
                        {pendingRequests.vyapar?.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>⏳ Pending Requests ({pendingRequests.vyapar.length})</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {pendingRequests.vyapar.map(u => (
                                        <div key={u._id} style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                            <div>
                                                <div style={{ color: '#fff', fontWeight: '700' }}>{u.name || 'User'}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{u.email}</div>
                                                {u.village && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>📍 {u.village}</div>}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                                                <button onClick={() => handleAccessAction(u._id, 'vyapar', 'approve')} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <CheckCircle2 size={15} /> Approve
                                                </button>
                                                <button onClick={() => handleAccessAction(u._id, 'vyapar', 'reject')} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '0.55rem 1.1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <XCircle size={15} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {pendingRequests.vyapar?.length === 0 && (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                                ✅ Koi pending request nahi hai
                            </div>
                        )}

                        {/* Approved Users */}
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>✅ Approved Users ({approvedUsers.vyapar?.length || 0})</div>
                        {approvedUsers.vyapar?.length === 0 ? (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
                                Abhi kisi ko Vyapar Saathi access approved nahi hua.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {approvedUsers.vyapar.map(u => (
                                    <div key={u._id} style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399', flexShrink: 0 }} />
                                            <div>
                                                <div style={{ color: '#fff', fontWeight: '700' }}>{u.name || 'User'}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{u.email}</div>
                                                {u.village && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>📍 {u.village}</div>}
                                            </div>
                                        </div>
                                        <button onClick={() => { if(window.confirm(`${u.name || u.email} ka Vyapar Saathi access disable karna chahte ho?`)) handleAccessAction(u._id, 'vyapar', 'reject'); }} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '0.55rem 1.1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <XCircle size={15} /> Disable
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Dairy Requests */}
                {activeTab === 'dairy-requests' && (
                    <div className="animate-fadeIn">
                        <h3 style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Milk size={20} color="#10b981" /> Dairy Saathi — Access Requests
                        </h3>

                        {/* Pending */}
                        {pendingRequests.dairy?.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>⏳ Pending Requests ({pendingRequests.dairy.length})</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {pendingRequests.dairy.map(u => (
                                        <div key={u._id} style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                            <div>
                                                <div style={{ color: '#fff', fontWeight: '700' }}>{u.name || 'User'}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{u.email}</div>
                                                {u.village && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>📍 {u.village}</div>}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                                                <button onClick={() => handleAccessAction(u._id, 'dairy', 'approve')} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <CheckCircle2 size={15} /> Approve
                                                </button>
                                                <button onClick={() => handleAccessAction(u._id, 'dairy', 'reject')} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '0.55rem 1.1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <XCircle size={15} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {pendingRequests.dairy?.length === 0 && (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                                ✅ Koi pending request nahi hai
                            </div>
                        )}

                        {/* Approved Users */}
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>✅ Approved Users ({approvedUsers.dairy?.length || 0})</div>
                        {approvedUsers.dairy?.length === 0 ? (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
                                Abhi kisi ko Dairy Saathi access approved nahi hua.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {approvedUsers.dairy.map(u => (
                                    <div key={u._id} style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399', flexShrink: 0 }} />
                                            <div>
                                                <div style={{ color: '#fff', fontWeight: '700' }}>{u.name || 'User'}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{u.email}</div>
                                                {u.village && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>📍 {u.village}</div>}
                                            </div>
                                        </div>
                                        <button onClick={() => { if(window.confirm(`${u.name || u.email} ka Dairy Saathi access disable karna chahte ho?`)) handleAccessAction(u._id, 'dairy', 'reject'); }} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '0.55rem 1.1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <XCircle size={15} /> Disable
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {/* Pashu Requests */}
                {activeTab === 'pashu-requests' && (
                    <div className="animate-fadeIn">
                        <h3 style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Stethoscope size={20} color="#10b981" /> Pashu Saathi — Access Requests
                        </h3>

                        {/* Pending */}
                        {pendingRequests.pashu?.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>⏳ Pending Requests ({pendingRequests.pashu.length})</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {pendingRequests.pashu.map(u => (
                                        <div key={u._id} style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                            <div>
                                                <div style={{ color: '#fff', fontWeight: '700' }}>{u.name || 'User'}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{u.email}</div>
                                                {u.village && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>📍 {u.village}</div>}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                                                <button onClick={() => handleAccessAction(u._id, 'pashu', 'approve')} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <CheckCircle2 size={15} /> Approve
                                                </button>
                                                <button onClick={() => handleAccessAction(u._id, 'pashu', 'reject')} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '0.55rem 1.1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <XCircle size={15} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {pendingRequests.pashu?.length === 0 && (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                                ✅ Koi pending request nahi hai
                            </div>
                        )}

                        {/* Approved Users */}
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>✅ Approved Users ({approvedUsers.pashu?.length || 0})</div>
                        {approvedUsers.pashu?.length === 0 ? (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
                                Abhi kisi ko Pashu Saathi access approved nahi hua.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {approvedUsers.pashu.map(u => (
                                    <div key={u._id} style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399', flexShrink: 0 }} />
                                            <div>
                                                <div style={{ color: '#fff', fontWeight: '700' }}>{u.name || 'User'}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{u.email}</div>
                                                {u.village && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>📍 {u.village}</div>}
                                            </div>
                                        </div>
                                        <button onClick={() => { if(window.confirm(`${u.name || u.email} ka Pashu Saathi access disable karna chahte ho?`)) handleAccessAction(u._id, 'pashu', 'reject'); }} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '0.55rem 1.1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <XCircle size={15} /> Disable
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Yatra Requests */}
                {activeTab === 'yatra-requests' && (
                    <div className="animate-fadeIn">
                        <h3 style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Car size={20} color="#f59e0b" /> Yatra Saathi — Access Requests
                        </h3>

                        {/* Pending */}
                        {pendingRequests.yatra?.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>⏳ Pending Requests ({pendingRequests.yatra.length})</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {(pendingRequests.yatra || []).map(u => (
                                        <div key={u._id} style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                            <div>
                                                <div style={{ color: '#fff', fontWeight: '700' }}>{u.name || 'User'}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{u.email}</div>
                                                {u.village && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>📍 {u.village}</div>}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                                                <button onClick={() => handleAccessAction(u._id, 'yatra', 'approve')} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <CheckCircle2 size={15} /> Approve
                                                </button>
                                                <button onClick={() => handleAccessAction(u._id, 'yatra', 'reject')} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '0.55rem 1.1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <XCircle size={15} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {pendingRequests.yatra?.length === 0 && (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                                ✅ Koi pending request nahi hai
                            </div>
                        )}

                        {/* Approved Users */}
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>✅ Approved Users ({approvedUsers.yatra?.length || 0})</div>
                        {approvedUsers.yatra?.length === 0 ? (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
                                Abhi kisi ko Yatra Saathi access approved nahi hua.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                { (approvedUsers.yatra || []).map(u => (
                                    <div key={u._id} style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399', flexShrink: 0 }} />
                                            <div>
                                                <div style={{ color: '#fff', fontWeight: '700' }}>{u.name || 'User'}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{u.email}</div>
                                                {u.village && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>📍 {u.village}</div>}
                                            </div>
                                        </div>
                                        <button onClick={() => { if(window.confirm(`${u.name || u.email} ka Yatra Saathi access disable karna chahte ho?`)) handleAccessAction(u._id, 'yatra', 'reject'); }} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '0.55rem 1.1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <XCircle size={15} /> Disable
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Hotel Requests */}
                {activeTab === 'hotel-requests' && (
                    <div className="animate-fadeIn">
                        <h3 style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Hotel size={20} color="#fbbf24" /> Hotel Saathi — Access Requests
                        </h3>

                        {/* Pending */}
                        {pendingRequests.hotel?.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>⏳ Pending Requests ({pendingRequests.hotel.length})</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {(pendingRequests.hotel || []).map(u => (
                                        <div key={u._id} style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                            <div>
                                                <div style={{ color: '#fff', fontWeight: '700' }}>{u.name || 'User'}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{u.email}</div>
                                                {u.village && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>📍 {u.village}</div>}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                                                <button onClick={() => handleAccessAction(u._id, 'hotel', 'approve')} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <CheckCircle2 size={15} /> Approve
                                                </button>
                                                <button onClick={() => handleAccessAction(u._id, 'hotel', 'reject')} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '0.55rem 1.1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <XCircle size={15} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {pendingRequests.hotel?.length === 0 && (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                                ✅ Koi pending request nahi hai
                            </div>
                        )}

                        {/* Approved Users */}
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>✅ Approved Users ({approvedUsers.hotel?.length || 0})</div>
                        {approvedUsers.hotel?.length === 0 ? (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
                                Abhi kisi ko Hotel Saathi access approved nahi hua.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {(approvedUsers.hotel || []).map(u => (
                                    <div key={u._id} style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399', flexShrink: 0 }} />
                                            <div>
                                                <div style={{ color: '#fff', fontWeight: '700' }}>{u.name || 'User'}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{u.email}</div>
                                                {u.village && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>📍 {u.village}</div>}
                                            </div>
                                        </div>
                                        <button onClick={() => { if(window.confirm(`${u.name || u.email} ka Hotel Saathi access disable karna chahte ho?`)) handleAccessAction(u._id, 'hotel', 'reject'); }} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '0.55rem 1.1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <XCircle size={15} /> Disable
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
