import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, ShoppingBag, Trash2, Shield, BarChart3, Search } from 'lucide-react';
import API_BASE_URL from '../config/api';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState({ users: 0, products: 0, wishlistItems: 0 });
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const API_URL = '/api/admin';

    const getHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    const headers = getHeaders(); // For initial mount fetches

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}${API_URL}/stats`, { headers });
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching admin stats:', err);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}${API_URL}/users`, { headers });
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}${API_URL}/products`, { headers });
            setProducts(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'products') fetchProducts();
    }, [activeTab]);

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`${API_BASE_URL}${API_URL}/users/${id}`, { headers });
            fetchUsers();
            fetchStats();
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await axios.delete(`${API_BASE_URL}${API_URL}/products/${id}`, { headers: getHeaders() });
            fetchProducts();
            fetchStats();
        } catch (err) {
            alert('Failed to delete product');
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
                <div style={{ display: 'flex', marginBottom: '2.5rem' }}>
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
                    </div>
                </div>

                {/* Dashboard Stats */}
                {activeTab === 'stats' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
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
            </div>
        </div>
    );
};

export default AdminPanel;
