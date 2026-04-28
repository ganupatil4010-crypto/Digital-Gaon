import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Users, ShoppingBag, Trash2, Shield, BarChart3, Search, Megaphone, Plus, ExternalLink, Power, Camera, Store, Milk, CheckCircle2, XCircle, Stethoscope, Car, Hotel, Sprout } from 'lucide-react';
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
    const [pendingRequests, setPendingRequests] = useState({ vyapar: [], dairy: [], pashu: [], yatra: [], hotel: [], agri: [] });
    const [approvedUsers, setApprovedUsers] = useState({ vyapar: [], dairy: [], pashu: [], yatra: [], hotel: [], agri: [] });
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
                hotel: res.data.hotel || [],
                agri: res.data.agri || []
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
                hotel: res.data.hotel || [],
                agri: res.data.agri || []
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
        if (activeTab.includes('-requests')) {
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
            await axios.post(`${API_BASE_URL}/api/admin/ads`, newAd, getHeaders());
            alert('Advertisement saved successfully!');
            setNewAd({ title: '', imageUrl: '', redirectUrl: '', placement: 'grid' });
            setIsAddingAd(false);
            fetchAds();
        } catch (err) {
            alert('Failed to save ad');
        }
    };

    const handleDeleteAd = async (id) => {
        try {
            await axios.post(`${API_BASE_URL}/api/admin/ads/delete/${id}`, {}, getHeaders());
            alert('Advertisement deleted successfully');
            fetchAds();
        } catch (err) {
            alert('Failed to delete ad');
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
            const reader = new FileReader();
            reader.onloadend = () => setNewAd({ ...newAd, imageUrl: reader.result });
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

    const filteredAds = ads.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const renderAccessView = (feature, icon, color, label) => {
        const pending = pendingRequests[feature] || [];
        const approved = approvedUsers[feature] || [];

        return (
            <div className="animate-fadeIn">
                <h3 style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {icon} {label} — Access Requests
                </h3>

                {pending.length > 0 ? (
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fbbf24', textTransform: 'uppercase', mb: '0.75rem' }}>⏳ Pending Requests ({pending.length})</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {pending.map(u => (
                                <div key={u._id} style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '14px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={{ color: '#fff', fontWeight: '700' }}>{u.name || 'User'}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{u.email}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                                        <button onClick={() => handleAccessAction(u._id, feature, 'approve')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>Approve</button>
                                        <button onClick={() => handleAccessAction(u._id, feature, 'reject')} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer' }}>Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>✅ No pending requests</div>
                )}

                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#34d399', textTransform: 'uppercase', mb: '0.75rem' }}>✅ Approved Users ({approved.length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {approved.map(u => (
                        <div key={u._id} style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '14px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ color: '#fff', fontWeight: '700' }}>{u.name || 'User'}</div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{u.email}</div>
                            </div>
                            <button onClick={() => handleAccessAction(u._id, feature, 'reject')} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer' }}>Disable</button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading && activeTab === 'stats') return <div className="admin-container"><div className="glass-card" style={{padding:'5rem', textAlign:'center'}}><div className="loader"></div></div></div>;

    return (
        <div className="admin-container animate-fadeIn">
            <div className="glass-card">
                <div className="admin-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <Shield style={{ width: '40px', height: '40px', color: 'white' }} />
                        <h1 style={{ color: 'white', margin: 0 }}>Admin Panel</h1>
                    </div>
                </div>

                <div className="tabs-wrapper no-scrollbar" style={{ display: 'flex', marginBottom: '2.5rem', overflowX: 'auto', gap: '0.5rem' }}>
                    <button onClick={() => setActiveTab('stats')} className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}><BarChart3 size={18} /> Stats</button>
                    <button onClick={() => setActiveTab('users')} className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}><Users size={18} /> Users</button>
                    <button onClick={() => setActiveTab('products')} className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}><ShoppingBag size={18} /> Products</button>
                    <button onClick={() => setActiveTab('ads')} className={`tab-btn ${activeTab === 'ads' ? 'active' : ''}`}><Megaphone size={18} /> Ads</button>
                    
                    {['vyapar', 'dairy', 'pashu', 'yatra', 'hotel', 'agri'].map(feat => (
                        <button key={feat} onClick={() => setActiveTab(`${feat}-requests`)} className={`tab-btn ${activeTab === `${feat}-requests` ? 'active' : ''}`} style={{position:'relative'}}>
                            {feat === 'vyapar' ? <Store size={18}/> : feat === 'dairy' ? <Milk size={18}/> : feat === 'pashu' ? <Stethoscope size={18}/> : feat === 'yatra' ? <Car size={18}/> : feat === 'hotel' ? <Hotel size={18}/> : <Sprout size={18}/>}
                            <span style={{textTransform:'capitalize'}}>{feat}</span>
                            {pendingRequests[feat]?.length > 0 && <span style={{position:'absolute', top:'-5px', right:'-5px', background:'#ef4444', color:'#fff', borderRadius:'50%', width:'18px', height:'18px', fontSize:'0.6rem', display:'flex', alignItems:'center', justifyContent:'center'}}>{pendingRequests[feat].length}</span>}
                        </button>
                    ))}
                </div>

                {activeTab === 'stats' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <div className="stat-card"><h3>Users</h3><p>{stats.users}</p></div>
                        <div className="stat-card"><h3>Products</h3><p>{stats.products}</p></div>
                        <div className="stat-card"><h3>Wishlist</h3><p>{stats.wishlistItems}</p></div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="admin-search-container">
                        <input className="admin-search-input" placeholder="Search Users..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
                        <table className="admin-table">
                            <thead><tr><th>User</th><th>Location</th><th>Action</th></tr></thead>
                            <tbody>
                                {filteredUsers.map(u => (
                                    <tr key={u._id}><td>{u.email}</td><td>{u.village}</td><td><button onClick={()=>handleDeleteUser(u._id)}><Trash2 size={18}/></button></td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'vyapar-requests' && renderAccessView('vyapar', <Store size={20} color="#8b5cf6" />, '#8b5cf6', 'Vyapar Saathi')}
                {activeTab === 'dairy-requests' && renderAccessView('dairy', <Milk size={20} color="#10b981" />, '#10b981', 'Dairy Saathi')}
                {activeTab === 'pashu-requests' && renderAccessView('pashu', <Stethoscope size={20} color="#10b981" />, '#10b981', 'Pashu Saathi')}
                {activeTab === 'yatra-requests' && renderAccessView('yatra', <Car size={20} color="#f59e0b" />, '#f59e0b', 'Yatra Saathi')}
                {activeTab === 'hotel-requests' && renderAccessView('hotel', <Hotel size={20} color="#fbbf24" />, '#fbbf24', 'Hotel Saathi')}
                {activeTab === 'agri-requests' && renderAccessView('agri', <Sprout size={20} color="#10b981" />, '#10b981', 'Agri Saathi')}

            </div>
            <style>{`
                .stat-card { background: rgba(255,255,255,0.03); padding: 2rem; borderRadius: 20px; border: 1px solid rgba(255,255,255,0.05); }
                .stat-card h3 { color: rgba(255,255,255,0.4); fontSize: 0.8rem; textTransform: uppercase; marginBottom: 1rem; }
                .stat-card p { fontSize: 3rem; fontWeight: 800; color: #fff; margin: 0; }
                .tab-btn { background: rgba(255,255,255,0.03); border: none; color: rgba(255,255,255,0.5); padding: 0.8rem 1.2rem; borderRadius: 12px; cursor: pointer; display: flex; alignItems: center; gap: 8px; fontWeight: 700; whiteSpace: nowrap; transition: 0.3s; }
                .tab-btn.active { background: #fff; color: #000; }
                .admin-table { width: 100%; borderCollapse: collapse; }
                .admin-table th { textAlign: left; padding: 1rem; color: rgba(255,255,255,0.3); fontSize: 0.8rem; }
                .admin-table td { padding: 1rem; color: #fff; borderBottom: 1px solid rgba(255,255,255,0.05); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

export default AdminPanel;
