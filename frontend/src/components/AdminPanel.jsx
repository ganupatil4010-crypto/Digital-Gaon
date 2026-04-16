import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, ShoppingBag, Trash2, Shield, BarChart3, Search } from 'lucide-react';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState({ users: 0, products: 0, wishlistItems: 0 });
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const API_URL = '/api/admin';
    const token = localStorage.getItem('token');

    const headers = {
        Authorization: `Bearer ${token}`
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_URL}/stats`, { headers });
            setStats(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching admin stats:', err);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/users`, { headers });
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/products`, { headers });
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
            await axios.delete(`${API_URL}/users/${id}`, { headers });
            fetchUsers();
            fetchStats();
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await axios.delete(`${API_URL}/products/${id}`, { headers });
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

    return (
        <div className="admin-container">
            <div className="glass-card mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-8 h-8 text-green-400" />
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                        Admin Command Center
                    </h1>
                </div>

                <div className="flex gap-4 mb-8">
                    <button 
                        onClick={() => setActiveTab('stats')}
                        className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
                    >
                        <BarChart3 className="w-4 h-4" /> Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    >
                        <Users className="w-4 h-4" /> Manage Users
                    </button>
                    <button 
                        onClick={() => setActiveTab('products')}
                        className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                    >
                        <ShoppingBag className="w-4 h-4" /> Manage Products
                    </button>
                </div>

                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                        <div className="stat-card glass-inner">
                            <Users className="w-10 h-10 text-blue-400 mb-2" />
                            <div className="text-3xl font-bold">{stats.users}</div>
                            <div className="text-gray-400">Total Users</div>
                        </div>
                        <div className="stat-card glass-inner">
                            <ShoppingBag className="w-10 h-10 text-green-400 mb-2" />
                            <div className="text-3xl font-bold">{stats.products}</div>
                            <div className="text-gray-400">Live Listings</div>
                        </div>
                        <div className="stat-card glass-inner">
                            <Trash2 className="w-10 h-10 text-red-400 mb-2" />
                            <div className="text-3xl font-bold">{stats.wishlistItems}</div>
                            <div className="text-gray-400">Wishlist Saves</div>
                        </div>
                    </div>
                )}

                {(activeTab === 'users' || activeTab === 'products') && (
                    <div className="animate-fadeIn">
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input 
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-body"
                            />
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-white/10 glass-inner">
                            <table className="w-full text-left font-body">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        {activeTab === 'users' ? (
                                            <>
                                                <th className="p-4">User</th>
                                                <th className="p-4">Location</th>
                                                <th className="p-4">Role</th>
                                                <th className="p-4">Action</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="p-4">Product</th>
                                                <th className="p-4">Seller</th>
                                                <th className="p-4">Price</th>
                                                <th className="p-4">Action</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeTab === 'users' && filteredUsers.map(user => (
                                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.email} className="w-8 h-8 rounded-full" />
                                                    <div>
                                                        <div className="font-semibold">{user.name || 'Anonymous'}</div>
                                                        <div className="text-xs text-gray-400">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-300">{user.village || 'N/A'}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button onClick={() => handleDeleteUser(user.id)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-all">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {activeTab === 'products' && filteredProducts.map(product => (
                                        <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={product.img} className="w-10 h-10 rounded object-cover" />
                                                    <div className="font-semibold">{product.title}</div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-400">{product.sellerEmail}</td>
                                            <td className="p-4 font-bold text-green-400">₹{product.price}</td>
                                            <td className="p-4">
                                                <button onClick={() => handleDeleteProduct(product.id)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-all">
                                                    <Trash2 className="w-5 h-5" />
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
