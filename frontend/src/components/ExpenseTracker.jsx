import React, { useState, useEffect } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { Wallet, Plus, Trash2, TrendingUp, TrendingDown, Calendar, ArrowRightLeft, Droplets, CheckCircle2, Download } from 'lucide-react';
import API_BASE_URL from '../config/api';

const ExpenseTracker = ({ userEmail }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('milk'); // 'milk' or 'general'
  const [historyTab, setHistoryTab] = useState('milk');
  
  const [milkData, setMilkData] = useState({ quantity: '', rate: '', date: new Date().toISOString().split('T')[0] });
  const [generalData, setGeneralData] = useState({ title: '', amount: '', type: 'expense', category: 'General', date: new Date().toISOString().split('T')[0] });

  const email = userEmail || localStorage.getItem('userEmail');

  useEffect(() => { fetchEntries(); }, [email]);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/expenses?email=${encodeURIComponent(email)}`);
      setEntries(res.data);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const handleMilkSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(milkData.quantity) * parseFloat(milkData.rate);
    try {
      await axios.post(`${API_BASE_URL}/api/expenses`, {
        title: `Milk Entry (${milkData.quantity}L)`,
        amount, quantity: parseFloat(milkData.quantity), rate: parseFloat(milkData.rate),
        type: 'income', category: 'Dairy', date: milkData.date, userEmail: email
      });
      setMilkData({ quantity: '', rate: '', date: new Date().toISOString().split('T')[0] });
      fetchEntries();
      setHistoryTab('milk');
    } catch (err) { alert('Saving failed. Check connection.'); }
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/expenses`, { ...generalData, userEmail: email });
      setGeneralData({ title: '', amount: '', type: 'expense', category: 'General', date: new Date().toISOString().split('T')[0] });
      fetchEntries();
      setHistoryTab('general');
    } catch (err) { alert('Saving failed.'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this record?')) {
      await axios.delete(`${API_BASE_URL}/api/expenses/${id}`);
      fetchEntries();
    }
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('history-list-container');
    if (!element) return;
    
    // Temporarily add a background color if it's transparent for better image quality
    const originalBg = element.style.backgroundColor;
    element.style.backgroundColor = '#1e293b'; // Slate 800 background
    
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `digital-khata-history-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error capturing image:', err);
      alert('Failed to download image.');
    } finally {
      element.style.backgroundColor = originalBg; // Restore background
    }
  };

  const totalIncome = entries.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const filteredEntries = entries.filter(e => historyTab === 'milk' ? e.category === 'Dairy' : e.category !== 'Dairy');

  return (
    <div className="khata-container animate-fadeIn">
      {/* Header Section */}
      <header className="khata-header">
        <div>
          <h1>Digital Khata</h1>
          <p>Manage your farming finances simply and clearly.</p>
        </div>
        <div className="balance-pill">
          <Wallet size={20} />
          <span>Balance: ₹{balance.toLocaleString()}</span>
        </div>
      </header>

      {/* Modern Stats Bar */}
      <div className="khata-stats-bar">
        <div className="stats-item">
          <div className="stats-label">Total Income</div>
          <div className="stats-value income">₹{totalIncome.toLocaleString()}</div>
        </div>
        <div className="stats-divider"></div>
        <div className="stats-item">
          <div className="stats-label">Total Expense</div>
          <div className="stats-value expense">₹{totalExpense.toLocaleString()}</div>
        </div>
        <div className="stats-divider"></div>
        <div className="stats-item">
          <div className="stats-label">Net Savings</div>
          <div className="stats-value savings">₹{balance.toLocaleString()}</div>
        </div>
      </div>

      <div className="khata-main-grid">
        {/* Left Side: Forms */}
        <section className="khata-card form-section">
          <div className="section-tabs">
            <button onClick={() => setActiveTab('milk')} className={activeTab === 'milk' ? 'active' : ''}>
              <Droplets size={18} /> Milk Log
            </button>
            <button onClick={() => setActiveTab('general')} className={activeTab === 'general' ? 'active' : ''}>
              <Plus size={18} /> Other Entry
            </button>
          </div>

          <div className="form-content">
            {activeTab === 'milk' ? (
              <form onSubmit={handleMilkSubmit}>
                <div className="input-group">
                  <label>Milk Quantity (Litres)</label>
                  <input type="number" step="0.1" value={milkData.quantity} onChange={e => setMilkData({...milkData, quantity: e.target.value})} placeholder="0.0" required />
                </div>
                <div className="input-group">
                  <label>Rate (₹ per Litre)</label>
                  <input type="number" step="0.1" value={milkData.rate} onChange={e => setMilkData({...milkData, rate: e.target.value})} placeholder="0.0" required />
                </div>
                <div className="input-group">
                  <label>Entry Date</label>
                  <input type="date" value={milkData.date} onChange={e => setMilkData({...milkData, date: e.target.value})} required />
                </div>
                <div className="calc-preview">
                  Total: <strong>₹{(parseFloat(milkData.quantity || 0) * parseFloat(milkData.rate || 0)).toFixed(2)}</strong>
                </div>
                <button type="submit" className="khata-btn primary">Save Entry</button>
              </form>
            ) : (
              <form onSubmit={handleGeneralSubmit}>
                <div className="input-group">
                  <label>Description</label>
                  <input type="text" value={generalData.title} onChange={e => setGeneralData({...generalData, title: e.target.value})} placeholder="Fertilizer, Wages, etc." required />
                </div>
                <div className="input-group">
                  <label>Amount (₹)</label>
                  <input type="number" value={generalData.amount} onChange={e => setGeneralData({...generalData, amount: parseFloat(e.target.value)})} placeholder="0" required />
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label>Type</label>
                    <select value={generalData.type} onChange={e => setGeneralData({...generalData, type: e.target.value})}>
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Date</label>
                    <input type="date" value={generalData.date} onChange={e => setGeneralData({...generalData, date: e.target.value})} required />
                  </div>
                </div>
                <button type="submit" className="khata-btn primary">Save Entry</button>
              </form>
            )}
          </div>
        </section>

        {/* Right Side: History */}
        <section className="khata-card history-section">
          <div className="section-header">
            <h3>Recent History</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="history-filters">
                <button onClick={() => setHistoryTab('milk')} className={historyTab === 'milk' ? 'active' : ''}>Milk</button>
                <button onClick={() => setHistoryTab('general')} className={historyTab === 'general' ? 'active' : ''}>Other</button>
              </div>
              <button 
                onClick={handleDownloadImage}
                title="Download as Image"
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Download size={18} />
              </button>
            </div>
          </div>

          <div id="history-list-container" className="history-list" style={{ padding: '10px', borderRadius: '8px' }}>
            {loading ? <p className="loading-text">Loading...</p> : 
             filteredEntries.length === 0 ? <div className="empty-state">No records found.</div> :
             filteredEntries.map(entry => (
               <div key={entry._id} className="history-row">
                 <div className="row-main">
                   <div className="row-info">
                     <span className="row-title">{entry.title}</span>
                     <span className="row-date">{new Date(entry.date).toLocaleDateString()}</span>
                   </div>
                   <div className={`row-amount ${entry.type}`}>
                     {entry.type === 'income' ? '+' : '-'} ₹{entry.amount.toLocaleString()}
                   </div>
                 </div>
                 <button className="del-btn" onClick={() => handleDelete(entry._id)}><Trash2 size={16} /></button>
               </div>
             ))
            }
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .khata-container { padding: 1.5rem; max-width: 1100px; margin: 0 auto; font-family: 'Inter', sans-serif; }
        .khata-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .khata-header h1 { font-size: 2rem; font-weight: 700; color: #fff; margin: 0; }
        .khata-header p { color: rgba(255,255,255,0.6); margin: 0.2rem 0 0; }
        
        .balance-pill { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); padding: 0.6rem 1.2rem; border-radius: 50px; display: flex; align-items: center; gap: 8px; color: #60a5fa; font-weight: 600; }
        
        .khata-stats-bar { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.5rem; display: flex; justify-content: space-around; align-items: center; margin-bottom: 2.5rem; backdrop-filter: blur(10px); }
        .stats-item { text-align: center; }
        .stats-label { font-size: 0.85rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.05rem; margin-bottom: 0.5rem; }
        .stats-value { font-size: 1.5rem; font-weight: 700; }
        .stats-value.income { color: #34d399; }
        .stats-value.expense { color: #f87171; }
        .stats-value.savings { color: #60a5fa; }
        .stats-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.1); }

        .khata-main-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 2rem; }
        
        .khata-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 1.5rem; }
        
        .section-tabs { display: flex; gap: 10px; margin-bottom: 2rem; }
        .section-tabs button { flex: 1; padding: 0.8rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.6); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; transition: all 0.2s; }
        .section-tabs button.active { background: #fff; color: #000; border-color: #fff; }
        
        .input-group { margin-bottom: 1.2rem; }
        .input-group label { display: block; font-size: 0.9rem; color: rgba(255,255,255,0.6); margin-bottom: 0.5rem; }
        .input-group input, .input-group select { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 0.8rem; border-radius: 10px; color: #fff; outline: none; }
        .input-group input:focus { border-color: #60a5fa; }
        .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        
        .calc-preview { background: rgba(52, 211, 153, 0.1); color: #34d399; padding: 1rem; border-radius: 10px; text-align: center; margin-bottom: 1.2rem; }
        .khata-btn { width: 100%; padding: 1rem; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; transition: transform 0.2s; }
        .khata-btn.primary { background: #3b82f6; color: #fff; }
        .khata-btn:active { transform: scale(0.98); }
        
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .section-header h3 { margin: 0; font-size: 1.2rem; }
        .history-filters { display: flex; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 3px; }
        .history-filters button { background: transparent; border: none; color: rgba(255,255,255,0.5); padding: 0.4rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
        .history-filters button.active { background: rgba(255,255,255,0.1); color: #fff; }
        
        .history-list { display: flex; flex-direction: column; gap: 0.8rem; max-height: 500px; overflow-y: auto; }
        .history-row { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1rem; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s; }
        .history-row:hover { background: rgba(255,255,255,0.04); }
        .row-main { flex: 1; display: flex; justify-content: space-between; align-items: center; margin-right: 1rem; }
        .row-info { display: flex; flex-direction: column; }
        .row-title { font-weight: 600; color: #fff; }
        .row-date { font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 2px; }
        .row-amount { font-weight: 700; font-size: 1.1rem; }
        .row-amount.income { color: #34d399; }
        .row-amount.expense { color: #f87171; }
        
        .del-btn { background: transparent; border: none; color: #f87171; opacity: 0.3; cursor: pointer; padding: 5px; }
        .del-btn:hover { opacity: 1; }
        .empty-state { text-align: center; padding: 3rem; color: rgba(255,255,255,0.3); }
        .loading-text { text-align: center; padding: 2rem; }

        @media (max-width: 850px) { 
          .khata-main-grid { grid-template-columns: 1fr; } 
        }
        @media (max-width: 600px) {
          .khata-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .khata-stats-bar { flex-direction: column; gap: 1.5rem; padding: 1.5rem 1rem; }
          .stats-divider { width: 100%; height: 1px; }
          .input-row { grid-template-columns: 1fr; }
          .section-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .row-main { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
        }
      `}} />
    </div>
  );
};

export default ExpenseTracker;
