import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import {
  Store, TrendingUp, ShoppingCart, Trash2, Users,
  PlusCircle, CheckCircle2, Phone, IndianRupee, AlertTriangle, Download
} from 'lucide-react';
import API_BASE_URL from '../config/api';

const VyaparSaathi = ({ userEmail }) => {
  const [activeTab, setActiveTab] = useState('sales');

  // Sales State
  const [sales, setSales] = useState([]);
  const [saleItemName, setSaleItemName] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [saleQuantity, setSaleQuantity] = useState('1');

  // Udhaar State
  const [udhaarList, setUdhaarList] = useState([]);
  const [udhaarName, setUdhaarName] = useState('');
  const [udhaarPhone, setUdhaarPhone] = useState('');
  const [udhaarAmount, setUdhaarAmount] = useState('');

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalUdhaar, setTotalUdhaar] = useState(0);
  const [loading, setLoading] = useState(true);

  const email = userEmail || localStorage.getItem('userEmail');

  const handleDownloadSalesPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('en-IN');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setFontSize(20);
    doc.setTextColor(167, 139, 250);
    doc.text('Vyapar Saathi', 14, 16);
    doc.setFontSize(11);
    doc.setTextColor(156, 163, 175);
    doc.text('Daily Sales Report', 14, 25);
    doc.text(`Generated: ${today}`, pageWidth - 14, 25, { align: 'right' });
    doc.setFontSize(12);
    doc.setTextColor(52, 211, 153);
    doc.text(`Total Revenue: Rs.${totalRevenue.toLocaleString()}`, 14, 35);
    doc.setTextColor(156, 163, 175);
    doc.text(`Total Entries: ${sales.length}`, pageWidth - 14, 35, { align: 'right' });

    // Table Header
    let y = 50;
    doc.setFillColor(30, 41, 59);
    doc.rect(10, y - 6, pageWidth - 20, 10, 'F');
    doc.setFontSize(10);
    doc.setTextColor(167, 139, 250);
    doc.text('#', 14, y);
    doc.text('Item / Saman', 25, y);
    doc.text('Qty', 110, y);
    doc.text('Amount (Rs.)', 135, y);
    doc.text('Date', 175, y);

    // Table Rows
    y += 8;
    sales.forEach((sale, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      const bg = i % 2 === 0 ? [17, 24, 39] : [22, 33, 55];
      doc.setFillColor(...bg);
      doc.rect(10, y - 5, pageWidth - 20, 9, 'F');
      doc.setTextColor(249, 250, 251);
      doc.setFontSize(9);
      doc.text(String(i + 1), 14, y);
      const itemText = sale.itemName.length > 35 ? sale.itemName.substring(0, 35) + '...' : sale.itemName;
      doc.text(itemText, 25, y);
      doc.text(String(sale.quantitySold), 110, y);
      doc.setTextColor(52, 211, 153);
      doc.text(`Rs.${sale.amount.toLocaleString()}`, 135, y);
      doc.setTextColor(156, 163, 175);
      doc.text(new Date(sale.date).toLocaleDateString('en-IN'), 175, y);
      y += 9;
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Digital Gaon — Vyapar Saathi', 14, 290);
      doc.text(`Page ${p} of ${totalPages}`, pageWidth - 14, 290, { align: 'right' });
    }

    doc.save(`vyapar-sales-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleDownloadUdhaarPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('en-IN');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setFontSize(20);
    doc.setTextColor(167, 139, 250);
    doc.text('Vyapar Saathi', 14, 16);
    doc.setFontSize(11);
    doc.setTextColor(156, 163, 175);
    doc.text('Udhaar Khata Report', 14, 25);
    doc.text(`Generated: ${today}`, pageWidth - 14, 25, { align: 'right' });
    doc.setFontSize(12);
    doc.setTextColor(248, 113, 113);
    doc.text(`Total Udhaar Baaki: Rs.${totalUdhaar.toLocaleString()}`, 14, 35);
    doc.setTextColor(156, 163, 175);
    doc.text(`Customers: ${udhaarList.length}`, pageWidth - 14, 35, { align: 'right' });

    // Table Header
    let y = 50;
    doc.setFillColor(30, 41, 59);
    doc.rect(10, y - 6, pageWidth - 20, 10, 'F');
    doc.setFontSize(10);
    doc.setTextColor(167, 139, 250);
    doc.text('#', 14, y);
    doc.text('Customer Naam', 25, y);
    doc.text('Mobile', 105, y);
    doc.text('Udhaar (Rs.)', 150, y);
    doc.text('Date', 185, y);

    // Table Rows
    y += 8;
    udhaarList.forEach((u, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      const bg = i % 2 === 0 ? [17, 24, 39] : [22, 33, 55];
      doc.setFillColor(...bg);
      doc.rect(10, y - 5, pageWidth - 20, 9, 'F');
      doc.setTextColor(249, 250, 251);
      doc.setFontSize(9);
      doc.text(String(i + 1), 14, y);
      doc.text(u.customerName.length > 30 ? u.customerName.substring(0, 30) + '...' : u.customerName, 25, y);
      doc.setTextColor(156, 163, 175);
      doc.text(u.phoneNumber || '-', 105, y);
      doc.setTextColor(248, 113, 113);
      doc.text(`Rs.${u.amount.toLocaleString()}`, 150, y);
      doc.setTextColor(156, 163, 175);
      doc.text(new Date(u.date).toLocaleDateString('en-IN'), 185, y);
      y += 9;
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Digital Gaon — Vyapar Saathi', 14, 290);
      doc.text(`Page ${p} of ${totalPages}`, pageWidth - 14, 290, { align: 'right' });
    }

    doc.save(`vyapar-udhaar-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    if (email) fetchData();
  }, [email]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchSales(), fetchUdhaar()]);
    setLoading(false);
  };

  const fetchSales = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/vyapar/sales?email=${encodeURIComponent(email)}`);
      setSales(res.data);
      const revenue = res.data.reduce((sum, s) => sum + s.amount, 0);
      setTotalRevenue(revenue);
    } catch (err) { console.error('Error fetching sales:', err); }
  };

  const fetchUdhaar = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/vyapar/udhaar?email=${encodeURIComponent(email)}`);
      setUdhaarList(res.data);
      const total = res.data.reduce((sum, u) => sum + u.amount, 0);
      setTotalUdhaar(total);
    } catch (err) { console.error('Error fetching udhaar:', err); }
  };

  const handleRecordSale = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/vyapar/sales`, {
        email, itemName: saleItemName,
        amount: Number(saleAmount), quantitySold: Number(saleQuantity)
      });
      setSaleItemName(''); setSaleAmount(''); setSaleQuantity('1');
      fetchSales();
    } catch (err) { alert('Failed to record sale.'); }
  };

  const handleDeleteSale = async (id) => {
    if (!window.confirm('Is yah sale delete karna chahte hain?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/vyapar/sales/${id}`);
      fetchSales();
    } catch (err) { console.error('Error deleting sale:', err); }
  };

  const handleAddUdhaar = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/vyapar/udhaar`, {
        email, customerName: udhaarName,
        phoneNumber: udhaarPhone, amount: Number(udhaarAmount)
      });
      setUdhaarName(''); setUdhaarPhone(''); setUdhaarAmount('');
      fetchUdhaar();
    } catch (err) { alert('Failed to add udhaar entry.'); }
  };

  const handleSettleUdhaar = async (id, name) => {
    if (!window.confirm(`${name} ka udhaar settle ho gaya?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/vyapar/udhaar/${id}`);
      fetchUdhaar();
    } catch (err) { console.error('Error settling udhaar:', err); }
  };

  return (
    <div className="vyapar-container animate-fadeIn">
      {/* Header */}
      <header className="vyapar-header">
        <div>
          <h1>Vyapar Saathi</h1>
          <p>Smart Sales & Udhaar Tracker for Dukandaars.</p>
        </div>
        <div className="status-pill">
          <Store size={20} />
          <span>Meri Dukaan</span>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="vyapar-stats-bar">
        <div className="stats-item">
          <div className="stats-label">Aaj ki Kamai</div>
          <div className="stats-value revenue">₹{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="stats-divider"></div>
        <div className="stats-item">
          <div className="stats-label">Kul Sales</div>
          <div className="stats-value stock">{sales.length}</div>
        </div>
        <div className="stats-divider"></div>
        <div className="stats-item">
          <div className="stats-label">Total Udhaar Baaki</div>
          <div className={`stats-value ${totalUdhaar > 0 ? 'active-alert' : 'revenue'}`}>
            ₹{totalUdhaar.toLocaleString()}
          </div>
        </div>
        <div className="stats-divider"></div>
        <div className="stats-item">
          <div className="stats-label">Udhaar Customers</div>
          <div className={`stats-value ${udhaarList.length > 0 ? 'active-alert' : 'stock'}`}>
            {udhaarList.length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="vyapar-tabs-row">
        <button
          onClick={() => setActiveTab('sales')}
          className={`vyapar-tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
        >
          <ShoppingCart size={18} /> Daily Sales
        </button>
        <button
          onClick={() => setActiveTab('udhaar')}
          className={`vyapar-tab-btn ${activeTab === 'udhaar' ? 'active udhaar-active' : ''}`}
        >
          <Users size={18} /> Udhaar Khata
          {udhaarList.length > 0 && (
            <span className="udhaar-badge">{udhaarList.length}</span>
          )}
        </button>
      </div>

      {/* Content Grid */}
      <div className="vyapar-main-grid">

        {/* -------- SALES TAB -------- */}
        {activeTab === 'sales' && (
          <>
            {/* Form */}
            <section className="vyapar-card">
              <h3 className="card-title"><PlusCircle size={20} /> Bikri Darz Karo</h3>
              <form onSubmit={handleRecordSale}>
                <div className="input-group">
                  <label>Item / Saman ka Naam</label>
                  <input type="text" value={saleItemName} onChange={e => setSaleItemName(e.target.value)} placeholder="e.g. Chawal 5kg, Soap, Biscuit" required />
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label>Matra (Qty)</label>
                    <input type="number" value={saleQuantity} onChange={e => setSaleQuantity(e.target.value)} placeholder="1" min="1" required />
                  </div>
                  <div className="input-group">
                    <label>Kul Rakam (₹)</label>
                    <input type="number" value={saleAmount} onChange={e => setSaleAmount(e.target.value)} placeholder="0" min="1" required />
                  </div>
                </div>
                {saleAmount && (
                  <div className="calc-preview">
                    Sale Amount: <strong>₹{Number(saleAmount).toLocaleString()}</strong>
                  </div>
                )}
                <button type="submit" className="vyapar-btn primary">
                  <ShoppingCart size={18} /> Sale Record Karo
                </button>
              </form>
            </section>

            {/* Sales List */}
            <section className="vyapar-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 className="card-title" style={{ margin: 0 }}><TrendingUp size={20} /> Recent Bikri</h3>
                <button
                  onClick={handleDownloadSalesPDF}
                  title="Download Sales as PDF"
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#9ca3af', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                >
                  <Download size={15} /> Download
                </button>
              </div>
              <div id="sales-list-container" className="vyapar-list-container">
                {loading ? <p className="loading-text">Loading...</p> :
                  sales.length === 0
                    ? <div className="empty-state"><ShoppingCart size={40} style={{ opacity: 0.2, marginBottom: '10px' }} /><br />Koi sale abhi record nahi ki gayi.</div>
                    : sales.map(sale => (
                      <div key={sale._id} className="list-row">
                        <div className="row-main">
                          <div className="row-info">
                            <span className="row-title">{sale.itemName}</span>
                            <span className="row-subtitle">Qty: {sale.quantitySold} • {new Date(sale.date).toLocaleDateString('hi-IN')}</span>
                          </div>
                          <div className="row-amount income" style={{ marginRight: '1rem' }}>+₹{sale.amount}</div>
                        </div>
                        <button className="del-btn" onClick={() => handleDeleteSale(sale._id)}><Trash2 size={16} /></button>
                      </div>
                    ))
                }
              </div>
            </section>
          </>
        )}

        {/* -------- UDHAAR KHATA TAB -------- */}
        {activeTab === 'udhaar' && (
          <>
            {/* Udhaar Form */}
            <section className="vyapar-card">
              <h3 className="card-title"><Users size={20} /> Naya Udhaar Likho</h3>
              <form onSubmit={handleAddUdhaar}>
                <div className="input-group">
                  <label>Customer ka Naam</label>
                  <input type="text" value={udhaarName} onChange={e => setUdhaarName(e.target.value)} placeholder="e.g. Ramesh Kumar" required />
                </div>
                <div className="input-group">
                  <label>Mobile Number (Optional)</label>
                  <input type="tel" value={udhaarPhone} onChange={e => setUdhaarPhone(e.target.value)} placeholder="e.g. 9876543210" />
                </div>
                <div className="input-group">
                  <label>Udhaar Rakam (₹)</label>
                  <input type="number" value={udhaarAmount} onChange={e => setUdhaarAmount(e.target.value)} placeholder="0" min="1" required />
                </div>
                {udhaarAmount && (
                  <div className="calc-preview udhaar-preview">
                    Udhaar: <strong>₹{Number(udhaarAmount).toLocaleString()}</strong>
                  </div>
                )}
                <button type="submit" className="vyapar-btn warning">
                  <AlertTriangle size={18} /> Udhaar Daalo
                </button>
              </form>
            </section>

            {/* Udhaar List */}
            <section className="vyapar-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 className="card-title" style={{ margin: 0 }}><IndianRupee size={20} /> Baaki Udhaar List</h3>
                <button
                  onClick={handleDownloadUdhaarPDF}
                  title="Download Udhaar as PDF"
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#9ca3af', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                >
                  <Download size={15} /> Download
                </button>
              </div>
              {totalUdhaar > 0 && (
                <div className="udhaar-total-bar">
                  <span>Total Baaki:</span>
                  <strong>₹{totalUdhaar.toLocaleString()}</strong>
                </div>
              )}
              <div id="udhaar-list-container" className="vyapar-list-container">
                {loading ? <p className="loading-text">Loading...</p> :
                  udhaarList.length === 0
                    ? <div className="empty-state"><CheckCircle2 size={40} style={{ opacity: 0.2, marginBottom: '10px', color: '#34d399' }} /><br />Badhaai! Koi udhaar baaki nahi hai.</div>
                    : udhaarList.map(u => (
                      <div key={u._id} className="list-row udhaar-row">
                        <div className="row-main">
                          <div className="row-info">
                            <span className="row-title">{u.customerName}</span>
                            <span className="row-subtitle">
                              {u.phoneNumber && <><Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />{u.phoneNumber} • </>}
                              {new Date(u.date).toLocaleDateString('hi-IN')}
                            </span>
                          </div>
                          <div className="row-amount udhaar-amount" style={{ marginRight: '1rem' }}>
                            ₹{u.amount.toLocaleString()}
                          </div>
                        </div>
                        <button
                          className="settle-btn"
                          onClick={() => handleSettleUdhaar(u._id, u.customerName)}
                          title="Udhaar Settle Mark Karo"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      </div>
                    ))
                }
              </div>
            </section>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .vyapar-container { padding: 1.5rem; max-width: 1100px; margin: 0 auto; font-family: 'Outfit', sans-serif; }
        
        .vyapar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .vyapar-header h1 { font-size: 2rem; font-weight: 700; color: #fff; margin: 0; }
        .vyapar-header p { color: rgba(255,255,255,0.6); margin: 0.2rem 0 0; font-size: 0.95rem; }
        
        .status-pill { background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.3); padding: 0.6rem 1.2rem; border-radius: 50px; display: flex; align-items: center; gap: 8px; color: #a78bfa; font-weight: 600; white-space: nowrap; }
        
        .vyapar-stats-bar { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 1.25rem 1.5rem; display: grid; grid-template-columns: repeat(4, 1fr); align-items: center; margin-bottom: 2rem; backdrop-filter: blur(10px); }
        .stats-item { text-align: center; padding: 0.5rem; }
        .stats-label { font-size: 0.72rem; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.06rem; margin-bottom: 0.4rem; }
        .stats-value { font-size: 1.4rem; font-weight: 800; }
        .stats-value.revenue { color: #34d399; }
        .stats-value.stock { color: #60a5fa; }
        .stats-value.active-alert { color: #f87171; }
        .stats-divider { width: 1px; height: 44px; background: rgba(255,255,255,0.08); margin: auto; }

        .vyapar-tabs-row { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .vyapar-tab-btn { flex: 1; padding: 0.9rem 1rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.55); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; font-size: 0.95rem; transition: all 0.25s; position: relative; font-family: 'Outfit', sans-serif; }
        .vyapar-tab-btn:hover { background: rgba(255,255,255,0.07); color: #fff; }
        .vyapar-tab-btn.active { background: #fff; color: #000; border-color: #fff; box-shadow: 0 4px 20px rgba(255,255,255,0.15); }
        .vyapar-tab-btn.udhaar-active { background: linear-gradient(135deg, rgba(248,113,113,0.2), rgba(251,146,60,0.2)); color: #fca5a5; border-color: rgba(248,113,113,0.4); }
        .udhaar-badge { background: #ef4444; color: white; font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: 20px; margin-left: 4px; }

        .vyapar-main-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 2rem; }
        
        .vyapar-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 1.5rem; }
        .card-title { font-size: 1.05rem; font-weight: 700; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 8px; color: #fff; }
        
        .input-group { margin-bottom: 1.1rem; }
        .input-group label { display: block; font-size: 0.88rem; color: rgba(255,255,255,0.55); margin-bottom: 0.5rem; font-weight: 500; }
        .input-group input { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 0.85rem 1rem; border-radius: 12px; color: #fff; outline: none; transition: border-color 0.2s; font-family: 'Outfit', sans-serif; font-size: 0.95rem; box-sizing: border-box; }
        .input-group input:focus { border-color: #a78bfa; background: rgba(139,92,246,0.08); }
        .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        
        .calc-preview { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2); color: #34d399; padding: 0.75rem 1rem; border-radius: 12px; text-align: center; margin-bottom: 1.1rem; font-size: 0.95rem; }
        .udhaar-preview { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); color: #fca5a5; }
        
        .vyapar-btn { width: 100%; padding: 1rem; border-radius: 14px; border: none; font-weight: 700; cursor: pointer; transition: filter 0.2s, transform 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Outfit', sans-serif; font-size: 1rem; }
        .vyapar-btn.primary { background: linear-gradient(135deg, #8b5cf6, #6366f1); color: #fff; box-shadow: 0 8px 20px rgba(139,92,246,0.3); }
        .vyapar-btn.warning { background: linear-gradient(135deg, #f87171, #fb923c); color: #fff; box-shadow: 0 8px 20px rgba(248,113,113,0.3); }
        .vyapar-btn:hover { filter: brightness(1.1); }
        .vyapar-btn:active { transform: scale(0.98); }
        
        .vyapar-list-container { display: flex; flex-direction: column; gap: 0.75rem; max-height: 480px; overflow-y: auto; padding-right: 4px; }
        .vyapar-list-container::-webkit-scrollbar { width: 5px; }
        .vyapar-list-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        
        .list-row { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); padding: 0.85rem 1rem; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s; }
        .list-row:hover { background: rgba(255,255,255,0.06); }
        .udhaar-row { border-left: 3px solid rgba(248,113,113,0.5); }
        .row-main { flex: 1; display: flex; justify-content: space-between; align-items: center; min-width: 0; }
        .row-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
        .row-title { font-weight: 600; color: #fff; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
        .row-subtitle { font-size: 0.75rem; color: rgba(255,255,255,0.4); display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
        .row-amount { font-weight: 700; font-size: 1rem; white-space: nowrap; flex-shrink: 0; margin: 0 0.5rem; }
        .row-amount.income { color: #34d399; }
        .udhaar-amount { color: #fca5a5; }

        .udhaar-total-bar { background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2); border-radius: 12px; padding: 0.75rem 1.25rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; color: #fca5a5; font-size: 0.9rem; }
        .udhaar-total-bar strong { font-size: 1.1rem; }
        
        .del-btn { background: transparent; border: none; color: #f87171; opacity: 0.3; cursor: pointer; padding: 6px; transition: opacity 0.2s; border-radius: 8px; flex-shrink: 0; }
        .del-btn:hover { opacity: 1; background: rgba(248,113,113,0.1); }
        
        .settle-btn { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.3); color: #34d399; cursor: pointer; padding: 8px; transition: all 0.2s; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; }
        .settle-btn:hover { background: #34d399; color: #000; }
        
        .empty-state { text-align: center; padding: 2.5rem 1rem; color: rgba(255,255,255,0.3); font-size: 0.9rem; line-height: 1.8; }
        .loading-text { text-align: center; padding: 2rem; color: rgba(255,255,255,0.4); }

        /* ── TABLET (≤850px) ── */
        @media (max-width: 850px) {
          .vyapar-main-grid { grid-template-columns: 1fr; }
          .vyapar-stats-bar { grid-template-columns: repeat(2, 1fr); }
          .stats-divider { display: none; }
        }

        /* ── MOBILE (≤600px) ── */
        @media (max-width: 600px) {
          .vyapar-container { padding: 1rem 0.75rem 2rem; }
          .vyapar-header { flex-direction: column; align-items: flex-start; gap: 0.6rem; margin-bottom: 1.25rem; }
          .vyapar-header h1 { font-size: 1.5rem; }
          .vyapar-header p { font-size: 0.82rem; }
          .status-pill { font-size: 0.8rem; padding: 0.4rem 0.85rem; }

          .vyapar-stats-bar { grid-template-columns: repeat(2, 1fr); padding: 0.75rem 0.5rem; margin-bottom: 1.1rem; border-radius: 14px; }
          .stats-item { padding: 0.5rem 0.4rem; }
          .stats-label { font-size: 0.62rem; letter-spacing: 0.02rem; }
          .stats-value { font-size: 1.1rem; }

          .vyapar-tabs-row { gap: 0.5rem; margin-bottom: 1.1rem; }
          .vyapar-tab-btn { padding: 0.7rem 0.4rem; font-size: 0.78rem; gap: 4px; border-radius: 11px; }

          .vyapar-card { padding: 1rem 0.9rem; border-radius: 14px; }
          .card-title { font-size: 0.9rem; margin-bottom: 1rem; gap: 6px; }

          .input-group { margin-bottom: 0.85rem; }
          .input-group label { font-size: 0.8rem; margin-bottom: 0.4rem; }
          .input-group input { padding: 0.72rem 0.85rem; font-size: 0.88rem; border-radius: 10px; }
          .input-row { gap: 0.6rem; }

          .vyapar-btn { padding: 0.85rem; font-size: 0.9rem; border-radius: 12px; }
          .calc-preview { padding: 0.6rem; font-size: 0.85rem; border-radius: 10px; margin-bottom: 0.85rem; }

          .vyapar-list-container { max-height: 320px; gap: 0.55rem; }
          .list-row { padding: 0.7rem 0.8rem; border-radius: 11px; }
          .row-title { font-size: 0.85rem; max-width: 110px; }
          .row-subtitle { font-size: 0.68rem; }
          .row-amount { font-size: 0.9rem; margin: 0 0.3rem; }

          .udhaar-total-bar { padding: 0.55rem 0.85rem; font-size: 0.8rem; border-radius: 10px; }
          .settle-btn { padding: 6px; border-radius: 8px; }
          .del-btn { padding: 4px; }
        }

        /* ── VERY SMALL (≤380px) ── */
        @media (max-width: 380px) {
          .vyapar-container { padding: 0.75rem 0.5rem 2rem; }
          .vyapar-header h1 { font-size: 1.3rem; }
          .stats-value { font-size: 0.95rem; }
          .stats-label { font-size: 0.58rem; }
          .vyapar-tab-btn { font-size: 0.72rem; padding: 0.6rem 0.3rem; }
          .input-row { grid-template-columns: 1fr; }
          .row-title { max-width: 90px; }
          .vyapar-stats-bar { border-radius: 12px; }
        }
      `}} />
    </div>
  );
};

export default VyaparSaathi;
