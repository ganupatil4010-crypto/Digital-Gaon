import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    Users, ShoppingBag, Trash2, Shield, BarChart3, Search, 
    Megaphone, Plus, ExternalLink, Power, Camera, Store, 
    Milk, CheckCircle2, XCircle, Stethoscope, Car, Hotel, 
    Sprout, Activity, ArrowUpRight, Filter
} from 'lucide-react';
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
    const [pendingRequests, setPendingRequests] = useState({});
    const [approvedUsers, setApprovedUsers] = useState({});
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
        fetchAllRequests();
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

    const fetchAllRequests = async () => {
        try {
            const [pending, approved] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/access/pending`),
                axios.get(`${API_BASE_URL}/api/access/approved`)
            ]);
            setPendingRequests(pending.data);
            setApprovedUsers(approved.data);
        } catch (err) { console.error('Error fetching requests:', err); }
    };

    const handleAccessAction = async (userId, feature, action) => {
        try {
            await axios.put(`${API_BASE_URL}/api/access/manage`, { userId, feature, action });
            fetchAllRequests();
        } catch { alert('Action failed.'); }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}${API_URL}/users`, getHeaders());
            setUsers(res.data);
        } catch (err) { console.error('Error fetching users:', err); }
        finally { setLoading(false); }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}${API_URL}/products`, getHeaders());
            setProducts(res.data);
        } catch (err) { console.error('Error fetching products:', err); }
        finally { setLoading(false); }
    };

    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}${API_URL}/ads`, getHeaders());
            setAds(res.data);
        } catch (err) { console.error('Error fetching ads:', err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'products') fetchProducts();
        if (activeTab === 'ads') fetchAds();
    }, [activeTab]);

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete user?')) return;
        try {
            await axios.delete(`${API_BASE_URL}${API_URL}/users/${id}`, getHeaders());
            fetchUsers();
            fetchStats();
        } catch { alert('Failed'); }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Delete product?')) return;
        try {
            await axios.delete(`${API_BASE_URL}${API_URL}/products/${id}`, getHeaders());
            fetchProducts();
            fetchStats();
        } catch { alert('Failed'); }
    };

    const handleCreateAd = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}${API_URL}/ads`, newAd, getHeaders());
            alert('Ad Saved');
            setNewAd({ title: '', imageUrl: '', redirectUrl: '', placement: 'grid' });
            setIsAddingAd(false);
            fetchAds();
        } catch { alert('Failed'); }
    };

    const handleDeleteAd = async (id) => {
        if (!window.confirm('Delete ad?')) return;
        try {
            await axios.delete(`${API_BASE_URL}${API_URL}/ads/${id}`, getHeaders());
            fetchAds();
        } catch { alert('Failed'); }
    };

    const handleToggleAd = async (id) => {
        try {
            await axios.patch(`${API_BASE_URL}${API_URL}/ads/${id}/toggle`, {}, getHeaders());
            fetchAds();
        } catch { alert('Failed'); }
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
    const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredAds = ads.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const renderAccessView = (feature, icon, color, title) => {
        const pending = pendingRequests[feature] || [];
        const approved = approvedUsers[feature] || [];

        return (
            <div className="compact-view animate-fadeIn">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div className="compact-card">
                        <div className="card-label" style={{ color: '#fbbf24' }}>⏳ Pending: {title}</div>
                        <div className="compact-list">
                            {pending.length > 0 ? pending.map(u => (
                                <div key={u._id} className="compact-item">
                                    <div className="u-info">
                                        <div className="u-email">{u.email}</div>
                                        <div className="u-loc">{u.village || 'N/A'}</div>
                                    </div>
                                    <div className="u-btns">
                                        <button onClick={() => handleAccessAction(u._id, feature, 'approve')} className="btn-ok"><CheckCircle2 size={14}/></button>
                                        <button onClick={() => handleAccessAction(u._id, feature, 'reject')} className="btn-no"><XCircle size={14}/></button>
                                    </div>
                                </div>
                            )) : <div className="no-data-mini">No requests</div>}
                        </div>
                    </div>

                    <div className="compact-card">
                        <div className="card-label" style={{ color: '#10b981' }}>✅ Approved: {title}</div>
                        <div className="compact-list">
                            {approved.length > 0 ? approved.map(u => (
                                <div key={u._id} className="compact-item">
                                    <div className="u-email">{u.email}</div>
                                    <button onClick={() => handleAccessAction(u._id, feature, 'reject')} className="btn-revoke">Revoke</button>
                                </div>
                            )) : <div className="no-data-mini">None</div>}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="compact-admin-shell animate-fadeIn">
            <div className="compact-glass-container">
                {/* Compact Header */}
                <div className="compact-header">
                    <div className="header-left">
                        <div className="shield-mini"><Shield size={20}/></div>
                        <div className="header-titles">
                            <h1>Admin Console</h1>
                            <span className="live-tag">System Secure</span>
                        </div>
                    </div>
                    <div className="header-search-mini">
                        <Search size={16}/>
                        <input placeholder="Search..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
                    </div>
                </div>

                {/* Compact Tabs */}
                <div className="compact-tabs no-scrollbar">
                    <button onClick={() => setActiveTab('stats')} className={`c-tab ${activeTab === 'stats' ? 'active' : ''}`}><BarChart3 size={16}/> Stats</button>
                    <button onClick={() => setActiveTab('users')} className={`c-tab ${activeTab === 'users' ? 'active' : ''}`}><Users size={16}/> Users</button>
                    <button onClick={() => setActiveTab('products')} className={`c-tab ${activeTab === 'products' ? 'active' : ''}`}><ShoppingBag size={16}/> Market</button>
                    <button onClick={() => setActiveTab('ads')} className={`c-tab ${activeTab === 'ads' ? 'active' : ''}`}><Megaphone size={16}/> Ads</button>
                    <div className="c-divider"></div>
                    {['vyapar', 'dairy', 'pashu', 'yatra', 'hotel', 'agri'].map(feat => (
                        <button key={feat} onClick={() => setActiveTab(`${feat}-requests`)} className={`c-tab ${activeTab === `${feat}-requests` ? 'active' : ''}`} style={{position:'relative'}}>
                            {feat === 'vyapar' ? <Store size={16}/> : feat === 'dairy' ? <Milk size={16}/> : feat === 'pashu' ? <Stethoscope size={16}/> : feat === 'yatra' ? <Car size={16}/> : feat === 'hotel' ? <Hotel size={16}/> : <Sprout size={16}/>}
                            <span>{feat}</span>
                            {pendingRequests[feat]?.length > 0 && <span className="c-notif">{pendingRequests[feat].length}</span>}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="compact-content">
                    {activeTab === 'stats' && (
                        <div className="compact-stats-grid">
                            <div className="c-stat-card">
                                <Users size={20} className="s-icon-p"/>
                                <div className="s-vals">
                                    <span className="s-num">{stats.users}</span>
                                    <span className="s-lab">Citizens</span>
                                </div>
                            </div>
                            <div className="c-stat-card">
                                <ShoppingBag size={20} className="s-icon-g"/>
                                <div className="s-vals">
                                    <span className="s-num">{stats.products}</span>
                                    <span className="s-lab">Listings</span>
                                </div>
                            </div>
                            <div className="c-stat-card">
                                <Activity size={20} className="s-icon-b"/>
                                <div className="s-vals">
                                    <span className="s-num">{stats.wishlistItems}</span>
                                    <span className="s-lab">Interactions</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {(activeTab === 'users' || activeTab === 'products') && (
                        <div className="compact-table-shell">
                            <table className="c-table">
                                <thead>
                                    {activeTab === 'users' ? 
                                        <tr><th>Identity</th><th>Location</th><th>Level</th><th>Action</th></tr> :
                                        <tr><th>Listing</th><th>Seller</th><th>Price</th><th>Action</th></tr>
                                    }
                                </thead>
                                <tbody>
                                    {activeTab === 'users' && filteredUsers.map(u => (
                                        <tr key={u._id}>
                                            <td>
                                                <div className="c-user-cell">
                                                    <div className="c-avatar">{u.email[0].toUpperCase()}</div>
                                                    <span>{u.email}</span>
                                                </div>
                                            </td>
                                            <td>{u.village || '-'}</td>
                                            <td>
                                                {u.role === 'admin' ? 
                                                    <span className="c-badge-admin">ADMIN</span> : 
                                                    <span className="c-badge-user">USER</span>
                                                }
                                            </td>
                                            <td><button onClick={()=>handleDeleteUser(u._id)} className="c-btn-del"><Trash2 size={14}/></button></td>
                                        </tr>
                                    ))}
                                    {activeTab === 'products' && filteredProducts.map(p => (
                                        <tr key={p._id}>
                                            <td>
                                                <div className="c-user-cell">
                                                    <img src={p.img} className="c-p-img" />
                                                    <span>{p.title}</span>
                                                </div>
                                            </td>
                                            <td>{p.sellerEmail}</td>
                                            <td className="c-price">₹{p.price}</td>
                                            <td><button onClick={()=>handleDeleteProduct(p._id)} className="c-btn-del"><Trash2 size={14}/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'ads' && (
                        <div className="compact-ads-area">
                            <div className="c-ads-header">
                                <h2>Campaigns</h2>
                                <button onClick={()=>setIsAddingAd(true)} className="c-btn-add"><Plus size={14}/> Add</button>
                            </div>

                            {isAddingAd && (
                                <div className="c-form-card">
                                    <form onSubmit={handleCreateAd} className="c-form">
                                        <input placeholder="Title" value={newAd.title} onChange={e=>setNewAd({...newAd,title:e.target.value})} required />
                                        <input placeholder="URL" value={newAd.redirectUrl} onChange={e=>setNewAd({...newAd,redirectUrl:e.target.value})} />
                                        <select value={newAd.placement} onChange={e=>setNewAd({...newAd,placement:e.target.value})}>
                                            <option value="grid">Grid</option>
                                            <option value="top">Top</option>
                                        </select>
                                        <div className="c-file-box" onClick={()=>fileInputRef.current.click()}>
                                            <Camera size={14}/> {newAd.imageUrl ? 'Image Ready' : 'Upload'}
                                            <input type="file" ref={fileInputRef} onChange={handleAdFileChange} hidden />
                                        </div>
                                        <div className="c-form-btns">
                                            <button type="submit" className="c-btn-save">Save</button>
                                            <button type="button" onClick={()=>setIsAddingAd(false)} className="c-btn-cancel">X</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="c-ads-grid">
                                {filteredAds.map(ad => (
                                    <div key={ad._id} className="c-ad-item">
                                        <img src={ad.imageUrl} alt="" />
                                        <div className="c-ad-meta">
                                            <div className="c-ad-top">
                                                <span>{ad.title}</span>
                                                <button onClick={()=>handleDeleteAd(ad._id)} className="c-ad-del"><Trash2 size={12}/></button>
                                            </div>
                                            <button onClick={()=>handleToggleAd(ad._id)} className={`c-ad-toggle ${ad.isActive ? 'on' : 'off'}`}>
                                                {ad.isActive ? 'Active' : 'Paused'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab.includes('-requests') && renderAccessView(
                        activeTab.split('-')[0], 
                        null, null,
                        activeTab.split('-')[0].toUpperCase()
                    )}
                </div>
            </div>

            <style>{`
                .compact-admin-shell { padding: 1.5rem; background: #030712; min-height: 100vh; color: #f3f4f6; font-family: 'Inter', sans-serif; }
                .compact-glass-container { max-width: 1100px; margin: 0 auto; background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 1.5rem; }
                
                .compact-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; }
                .header-left { display: flex; align-items: center; gap: 12px; }
                .shield-mini { background: #8b5cf6; padding: 8px; border-radius: 10px; color: #fff; box-shadow: 0 0 15px rgba(139, 92, 246, 0.3); }
                .header-titles h1 { font-size: 1.1rem; font-weight: 800; margin: 0; }
                .live-tag { font-size: 0.65rem; color: #10b981; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
                .header-search-mini { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 6px 12px; border-radius: 10px; display: flex; align-items: center; gap: 10px; width: 220px; }
                .header-search-mini input { background: transparent; border: none; color: #fff; outline: none; font-size: 0.8rem; width: 100%; }
                
                .compact-tabs { display: flex; gap: 6px; overflow-x: auto; margin-bottom: 1.5rem; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .c-tab { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.4); padding: 7px 14px; border-radius: 10px; cursor: pointer; font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 8px; white-space: nowrap; transition: 0.3s; }
                .c-tab:hover { color: #fff; background: rgba(255,255,255,0.05); }
                .c-tab.active { background: #fff; color: #000; border-color: #fff; }
                .c-divider { width: 1px; height: 24px; background: rgba(255,255,255,0.1); margin: 0 5px; flex-shrink: 0; align-self: center; }
                .c-notif { position: absolute; top: -4px; right: -4px; background: #ef4444; color: #fff; font-size: 0.55rem; width: 15px; height: 15px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

                .compact-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
                .c-stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 1rem; border-radius: 15px; display: flex; align-items: center; gap: 15px; }
                .s-icon-p { color: #8b5cf6; } .s-icon-g { color: #10b981; } .s-icon-b { color: #3b82f6; }
                .s-num { display: block; font-size: 1.3rem; font-weight: 800; color: #fff; }
                .s-lab { font-size: 0.7rem; color: rgba(255,255,255,0.4); font-weight: 600; text-transform: uppercase; }

                .compact-table-shell { background: rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.05); border-radius: 15px; overflow-x: auto; }
                .c-table { width: 100%; border-collapse: collapse; min-width: 500px; font-size: 0.85rem; }
                .c-table th { text-align: left; padding: 12px 15px; color: rgba(255,255,255,0.3); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; background: rgba(255,255,255,0.02); }
                .c-table td { padding: 12px 15px; border-bottom: 1px solid rgba(255,255,255,0.03); color: rgba(255,255,255,0.8); }
                .c-user-cell { display: flex; align-items: center; gap: 10px; }
                .c-avatar { width: 26px; height: 26px; border-radius: 6px; background: #8b5cf6; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; }
                .c-p-img { width: 28px; height: 28px; border-radius: 6px; object-fit: cover; }
                .c-badge-admin { background: rgba(139,92,246,0.2); color: #a78bfa; padding: 2px 8px; border-radius: 5px; font-size: 0.6rem; font-weight: 800; border: 1px solid rgba(139,92,246,0.3); }
                .c-badge-user { color: rgba(255,255,255,0.3); font-size: 0.6rem; font-weight: 700; }
                .c-btn-del { background: rgba(239,68,68,0.1); border: none; color: #f87171; padding: 6px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
                .c-btn-del:hover { background: #ef4444; color: #fff; }
                .c-price { color: #10b981; font-weight: 700; }

                .c-ads-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; }
                .c-ads-header h2 { font-size: 1rem; margin: 0; }
                .c-btn-add { background: #fff; color: #000; border: none; padding: 6px 14px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; }
                .c-form-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); padding: 1.2rem; border-radius: 15px; margin-bottom: 1.5rem; }
                .c-form { display: flex; gap: 10px; flex-wrap: wrap; }
                .c-form input, .c-form select { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; color: #fff; font-size: 0.8rem; outline: none; flex: 1; min-width: 120px; }
                .c-file-box { background: rgba(139,92,246,0.05); border: 1px dashed rgba(139,92,246,0.2); padding: 8px 12px; border-radius: 8px; font-size: 0.75rem; color: #a78bfa; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
                .c-btn-save { background: #8b5cf6; border: none; color: #fff; padding: 8px 15px; border-radius: 8px; font-weight: 800; font-size: 0.8rem; cursor: pointer; }
                .c-btn-cancel { background: rgba(255,255,255,0.05); border: none; color: #fff; padding: 8px 12px; border-radius: 8px; cursor: pointer; }

                .c-ads-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
                .c-ad-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 15px; overflow: hidden; }
                .c-ad-item img { width: 100%; height: 100px; object-fit: cover; }
                .c-ad-meta { padding: 10px; }
                .c-ad-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
                .c-ad-top span { font-size: 0.8rem; font-weight: 700; }
                .c-ad-del { background: transparent; border: none; color: #f87171; cursor: pointer; opacity: 0.6; }
                .c-ad-toggle { width: 100%; border: none; border-radius: 6px; padding: 4px; font-size: 0.65rem; font-weight: 800; cursor: pointer; }
                .c-ad-toggle.on { background: rgba(16,185,129,0.15); color: #10b981; }
                .c-ad-toggle.off { background: rgba(239,68,68,0.1); color: #f87171; }

                .compact-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 15px; padding: 1rem; }
                .card-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; margin-bottom: 1rem; }
                .compact-list { display: flex; flex-direction: column; gap: 8px; }
                .compact-item { background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; }
                .u-btns { display: flex; gap: 5px; }
                .btn-ok { background: #10b981; border: none; color: #fff; padding: 4px 8px; border-radius: 5px; cursor: pointer; }
                .btn-no { background: #ef4444; border: none; color: #fff; padding: 4px 8px; border-radius: 5px; cursor: pointer; }
                .btn-revoke { background: rgba(239,68,68,0.1); color: #f87171; border: none; padding: 4px 8px; border-radius: 5px; font-size: 0.7rem; font-weight: 700; cursor: pointer; }

                @media (max-width: 768px) {
                    .compact-admin-shell { padding: 0.8rem; }
                    .compact-glass-container { padding: 1rem; border-radius: 15px; }
                    .header-search-mini { display: none; }
                    .c-tab span { display: none; }
                    .c-tab { padding: 10px; border-radius: 12px; }
                    .compact-stats-grid { grid-template-columns: 1fr; }
                    .c-stat-card { padding: 0.8rem; }
                    .s-num { font-size: 1.1rem; }
                }

                .no-scrollbar::-webkit-scrollbar { display: none; }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default AdminPanel;
