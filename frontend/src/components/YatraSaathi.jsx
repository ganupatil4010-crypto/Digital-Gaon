import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Car, MapPin, Phone, Calendar, IndianRupee, 
  PlusCircle, Trash2, CheckCircle2, Search,
  ArrowRight, TrendingUp, AlertCircle, Clock
} from 'lucide-react';
import API_BASE_URL from '../config/api';

const YatraSaathi = ({ userEmail }) => {
  const [activeTab, setActiveTab] = useState('list'); // list | add
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ upcomingTrips: 0, pendingPayment: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    destination: '',
    tripDate: '',
    totalAmount: '',
    advancePaid: ''
  });

  const email = userEmail || localStorage.getItem('userEmail');

  useEffect(() => {
    if (email) fetchData();
  }, [email]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, sRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/yatra/bookings?email=${encodeURIComponent(email)}`),
        axios.get(`${API_BASE_URL}/api/yatra/stats?email=${encodeURIComponent(email)}`)
      ]);
      setBookings(bRes.data);
      setStats(sRes.data);
    } catch (err) {
      console.error('Error fetching yatra data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBooking = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/yatra/bookings`, { ...formData, userEmail: email });
      setFormData({ customerName: '', phoneNumber: '', destination: '', tripDate: '', totalAmount: '', advancePaid: '' });
      setActiveTab('list');
      fetchData();
    } catch (err) { alert('Booking add karne mein galti hui.'); }
  };

  const handleSettle = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/yatra/bookings/${id}/complete`);
      fetchData();
    } catch (err) { console.error('Error settling trip:', err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Is booking ko delete karna chahte hain?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/yatra/bookings/${id}`);
      fetchData();
    } catch (err) { console.error('Error deleting booking:', err); }
  };

  const filteredBookings = bookings.filter(b => 
    b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputStyle = {
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '1rem 1.25rem',
    borderRadius: '14px',
    color: 'white',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit'
  };

  return (
    <div className="yatra-container animate-fadeIn">
      {/* Header Section */}
      <header className="yatra-hero" style={{ 
          background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(0,0,0,0.2))', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '32px', padding: '2.5rem', marginBottom: '2.5rem', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem',
          backdropFilter: 'blur(20px)'
      }}>
        <div className="hero-info" style={{ textAlign: window.innerWidth < 768 ? 'center' : 'left', flex: 1 }}>
          <div style={{ display: 'inline-block', padding: '0.3rem 0.8rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Trip Manager</div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '800', margin: '0 0 0.5rem', background: 'linear-gradient(135deg, #fff, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Yatra Saathi 🚕</h1>
          <p>Taxi aur travel business ke liye simple digital diary. Booking aur hisab ab aapke ungliyon par.</p>
        </div>
        <div className="yatra-stats">
          <div className="y-stat-item">
            <span className="y-stat-label">Upcoming Trips</span>
            <span className="y-stat-value">{stats.upcomingTrips}</span>
          </div>
          <div className="y-stat-divider"></div>
          <div className="y-stat-item">
            <span className="y-stat-label">Pending Amount</span>
            <span className="y-stat-value warning">₹{stats.pendingPayment}</span>
          </div>
        </div>
      </header>

      {/* Main Controls */}
      <div className="yatra-controls">
        <div className="yatra-search">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by customer or destination..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="yatra-tabs">
          <button 
            className={`y-tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <Clock size={18} /> Bookings
          </button>
          <button 
            className={`y-tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <PlusCircle size={18} /> New Trip
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="yatra-content">
        {activeTab === 'add' ? (
          <div className="yatra-card form-card">
            <h2 className="card-title"><Car size={20} /> Record New Booking</h2>
            <form onSubmit={handleAddBooking} className="yatra-form">
                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 600 ? '1fr' : '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Customer Name</label>
                        <input
                            type="text"
                            style={inputStyle}
                            placeholder="Customer ka naam"
                            value={formData.customerName}
                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Customer Mobile</label>
                        <input
                            type="tel"
                            style={inputStyle}
                            placeholder="10-digit mobile"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 600 ? '1fr' : '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Destination / Route</label>
                        <input
                            type="text"
                            style={inputStyle}
                            placeholder="Kaha jaana hai?"
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Trip Date</label>
                        <input
                            type="date"
                            style={inputStyle}
                            value={formData.tripDate}
                            onChange={(e) => setFormData({ ...formData, tripDate: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 600 ? '1fr' : '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Total Amount (₹)</label>
                        <input
                            type="number"
                            style={inputStyle}
                            placeholder="Pura kiraya"
                            value={formData.totalAmount}
                            onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Advance Paid (₹)</label>
                        <input
                            type="number"
                            style={inputStyle}
                            placeholder="Kitna advance mila?"
                            value={formData.advancePaid}
                            onChange={(e) => setFormData({ ...formData, advancePaid: e.target.value })}
                            required
                        />
                    </div>
                </div>
              {formData.totalAmount && (
                <div className="y-preview">
                  Baki Rakam: <strong>₹{Number(formData.totalAmount) - Number(formData.advancePaid || 0)}</strong>
                </div>
              )}
              <button type="submit" className="y-submit-btn">
                Confirm Booking <ArrowRight size={18} />
              </button>
            </form>
          </div>
        ) : (
          <div className="yatra-list-grid">
            {loading ? <p className="loading-txt">Loading bookings...</p> : 
              filteredBookings.length === 0 ? (
                <div className="y-empty">
                  <Car size={60} />
                  <p>Abhi koi active booking nahi hai.</p>
                  <button onClick={() => setActiveTab('add')}>Nayi Booking Karein</button>
                </div>
              ) : (
                filteredBookings.map(b => (
                  <div key={b._id} className={`y-booking-card ${b.status === 'Completed' ? 'completed' : ''}`}>
                    <div className="y-card-top">
                      <div className="y-dest">
                        <MapPin size={16} />
                        <span>{b.destination}</span>
                      </div>
                      <div className="y-status-pill">{b.status}</div>
                    </div>
                    <div className="y-card-body">
                      <h3>{b.customerName}</h3>
                      <div className="y-info-line"><Calendar size={14} /> {new Date(b.tripDate).toLocaleDateString('hi-IN')}</div>
                      {b.phoneNumber && <div className="y-info-line"><Phone size={14} /> {b.phoneNumber}</div>}
                    </div>
                    <div className="y-card-footer">
                      <div className="y-amount-box">
                        <div className="y-total">₹{b.totalAmount}</div>
                        {b.totalAmount - b.advancePaid > 0 && (
                          <div className="y-due">Due: ₹{b.totalAmount - b.advancePaid}</div>
                        )}
                      </div>
                      <div className="y-actions">
                        {b.status === 'Upcoming' && (
                          <button onClick={() => handleSettle(b._id)} className="y-btn-icon success" title="Complete Trip"><CheckCircle2 size={18} /></button>
                        )}
                        <button onClick={() => handleDelete(b._id)} className="y-btn-icon danger" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )
            }
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .yatra-container { padding: 2rem; max-width: 1200px; margin: 0 auto; color: white; font-family: 'Outfit', sans-serif; }
        .yatra-hero p { color: rgba(255,255,255,0.6); max-width: 450px; line-height: 1.6; }
        .yatra-stats { display: flex; align-items: center; gap: 2rem; background: rgba(0,0,0,0.2); padding: 1.5rem 2rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); }
        .y-stat-item { text-align: center; }
        .y-stat-label { display: block; font-size: 0.7rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
        .y-stat-value { font-size: 1.8rem; font-weight: 800; }
        .y-stat-value.warning { color: #f59e0b; }
        .y-stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.1); }
        .yatra-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 1.5rem; flex-wrap: wrap; }
        .yatra-search { position: relative; flex: 1; max-width: 400px; }
        .yatra-search svg { position: absolute; left: 1.25rem; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.3); }
        .yatra-search input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 1rem 1rem 1rem 3.5rem; border-radius: 100px; color: white; outline: none; }
        .yatra-tabs { display: flex; gap: 0.5rem; background: rgba(0,0,0,0.2); padding: 0.4rem; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); }
        .y-empty button { 
          background: linear-gradient(135deg, #f59e0b, #fb923c); 
          color: white; 
          border: none; 
          padding: 0.9rem 2rem; 
          border-radius: 14px; 
          cursor: pointer; 
          margin-top: 1.5rem; 
          font-weight: 800; 
          box-shadow: 0 10px 20px -5px rgba(245, 158, 11, 0.4);
          transition: 0.3s;
        }
        .y-empty button:hover { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 15px 30px -5px rgba(245, 158, 11, 0.5); }
        .y-tab { background: transparent; border: none; color: rgba(255,255,255,0.5); padding: 0.75rem 1.25rem; border-radius: 12px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
        .y-tab.active { background: white; color: black; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
        .yatra-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; padding: 2.5rem; backdrop-filter: blur(30px); }
        .card-title { font-size: 1.2rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 10px; color: #f59e0b; }
        .yatra-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .y-preview { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); color: #f59e0b; padding: 1rem; border-radius: 14px; text-align: center; font-size: 1rem; }
        .y-submit-btn { background: linear-gradient(135deg, #f59e0b, #fb923c); color: white; border: none; padding: 1.1rem; border-radius: 16px; font-weight: 800; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; margin-top: 1rem; box-shadow: 0 10px 20px -5px rgba(245, 158, 11, 0.4); }
        .yatra-list-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .y-booking-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 1.75rem; transition: all 0.3s; position: relative; overflow: hidden; }
        .y-booking-card:hover { transform: translateY(-5px); border-color: #f59e0b; background: rgba(255,255,255,0.06); }
        .y-booking-card.completed { opacity: 0.6; }
        .y-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .y-dest { display: flex; align-items: center; gap: 8px; color: #f59e0b; font-weight: 700; font-size: 0.95rem; }
        .y-status-pill { font-size: 0.6rem; font-weight: 800; padding: 4px 10px; background: rgba(255,255,255,0.1); border-radius: 6px; text-transform: uppercase; }
        .y-card-body h3 { font-size: 1.4rem; margin: 0 0 0.75rem; color: #fff; }
        .y-info-line { font-size: 0.85rem; color: rgba(255,255,255,0.5); display: flex; align-items: center; gap: 8px; margin-top: 6px; }
        .y-card-footer { margin-top: 1.75rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: flex-end; }
        .y-total { font-size: 1.3rem; font-weight: 800; color: #fff; }
        .y-due { font-size: 0.75rem; color: #f87171; font-weight: 700; margin-top: 2px; }
        .y-actions { display: flex; gap: 10px; }
        .y-btn-icon { width: 38px; height: 38px; border-radius: 12px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .y-btn-icon.success { background: rgba(52, 211, 153, 0.1); color: #34d399; }
        .y-btn-icon.danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .y-empty { grid-column: 1 / -1; padding: 5rem 2rem; text-align: center; color: rgba(255,255,255,0.2); }
        @media (max-width: 768px) {
          .yatra-hero { padding: 2rem; text-align: center; flex-direction: column; }
          .yatra-hero h1 { font-size: 2.2rem; }
          .yatra-stats { width: 100%; justify-content: center; }
          .yatra-search { max-width: 100%; }
        }
      `}} />
    </div>
  );
};

export default YatraSaathi;
