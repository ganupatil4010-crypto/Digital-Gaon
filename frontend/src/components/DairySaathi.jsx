import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { Milk, Users, PlusCircle, Trash2, CheckCircle2, Download, TrendingUp, Phone } from 'lucide-react';
import API_BASE_URL from '../config/api';

const DairySaathi = ({ userEmail }) => {
  const [activeTab, setActiveTab] = useState('entry');
  const [customers, setCustomers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [monthlyBill, setMonthlyBill] = useState([]);
  const [loading, setLoading] = useState(true);

  // Customer form
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');

  // Entry form
  const [selCustomer, setSelCustomer] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryMorning, setEntryMorning] = useState('');
  const [entryEvening, setEntryEvening] = useState('');
  const [entryRate, setEntryRate] = useState('');

  const email = userEmail || localStorage.getItem('userEmail');
  const now = new Date();
  const [billMonth, setBillMonth] = useState(now.getMonth());
  const [billYear, setBillYear] = useState(now.getFullYear());

  useEffect(() => { if (email) fetchAll(); }, [email]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchCustomers(), fetchEntries(), fetchBill()]);
    setLoading(false);
  };

  const fetchCustomers = async () => {
    try {
      const r = await axios.get(`${API_BASE_URL}/api/dairy/customers?email=${encodeURIComponent(email)}`);
      setCustomers(r.data);
    } catch (e) { console.error(e); }
  };

  const fetchEntries = async () => {
    try {
      const r = await axios.get(`${API_BASE_URL}/api/dairy/entries?email=${encodeURIComponent(email)}`);
      setEntries(r.data);
    } catch (e) { console.error(e); }
  };

  const fetchBill = async () => {
    try {
      const r = await axios.get(`${API_BASE_URL}/api/dairy/monthly-bill?email=${encodeURIComponent(email)}&year=${billYear}&month=${billMonth}`);
      setMonthlyBill(r.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (email) fetchBill(); }, [billMonth, billYear]);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/dairy/customers`, {
        email, customerName: cName, phoneNumber: cPhone,
        morningQty: 0, eveningQty: 0, ratePerLitre: 0
      });
      setCName(''); setCPhone('');
      fetchCustomers();
    } catch { alert('Failed to add customer.'); }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    await axios.delete(`${API_BASE_URL}/api/dairy/customers/${id}`);
    fetchCustomers();
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    const c = customers.find(x => x._id === selCustomer);
    if (!c) return alert('Customer select karo.');
    if (!entryRate || Number(entryRate) <= 0) return alert('Rate per litre daalo.');
    try {
      await axios.post(`${API_BASE_URL}/api/dairy/entries`, {
        email, customerId: c._id, customerName: c.customerName,
        date: entryDate,
        morningQty: Number(entryMorning) || 0,
        eveningQty: Number(entryEvening) || 0,
        ratePerLitre: Number(entryRate)
      });
      setEntryMorning(''); setEntryEvening('');
      fetchEntries(); fetchBill();
    } catch { alert('Failed to record entry.'); }
  };

  const handleDeleteEntry = async (id) => {
    await axios.delete(`${API_BASE_URL}/api/dairy/entries/${id}`);
    fetchEntries(); fetchBill();
  };

  const handleDownloadBillPDF = () => {
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const today = new Date().toLocaleDateString('en-IN');

    doc.setFillColor(15, 23, 42); doc.rect(0, 0, pw, 44, 'F');
    doc.setFontSize(20); doc.setTextColor(52, 211, 153);
    doc.text('Dairy Saathi', 14, 16);
    doc.setFontSize(11); doc.setTextColor(156, 163, 175);
    doc.text(`Monthly Bill — ${months[billMonth]} ${billYear}`, 14, 26);
    doc.text(`Generated: ${today}`, pw - 14, 26, { align: 'right' });
    const totalRev = monthlyBill.reduce((s, b) => s + b.totalAmount, 0);
    doc.setFontSize(11); doc.setTextColor(52, 211, 153);
    doc.text(`Total Revenue: Rs.${totalRev.toLocaleString()}`, 14, 38);
    doc.setTextColor(156, 163, 175);
    doc.text(`Customers: ${monthlyBill.length}`, pw - 14, 38, { align: 'right' });

    let y = 54;
    doc.setFillColor(30, 41, 59); doc.rect(10, y - 6, pw - 20, 10, 'F');
    doc.setFontSize(10); doc.setTextColor(167, 139, 250);
    doc.text('#', 14, y); doc.text('Customer', 24, y);
    doc.text('Litres', 100, y); doc.text('Amount (Rs.)', 130, y); doc.text('Days', 185, y);
    y += 8;

    monthlyBill.forEach((b, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFillColor(...(i % 2 === 0 ? [17, 24, 39] : [22, 33, 55]));
      doc.rect(10, y - 5, pw - 20, 9, 'F');
      doc.setFontSize(9); doc.setTextColor(249, 250, 251);
      doc.text(String(i + 1), 14, y);
      doc.text(b.customerName.substring(0, 28), 24, y);
      doc.setTextColor(96, 165, 250); doc.text(String(b.totalLitres.toFixed(1)) + ' L', 100, y);
      doc.setTextColor(52, 211, 153); doc.text(`Rs.${b.totalAmount.toFixed(0)}`, 130, y);
      doc.setTextColor(156, 163, 175); doc.text(String(b.entries), 185, y);
      y += 9;
    });

    const tp = doc.internal.getNumberOfPages();
    for (let p = 1; p <= tp; p++) {
      doc.setPage(p); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
      doc.text('Digital Gaon — Dairy Saathi', 14, 290);
      doc.text(`Page ${p} of ${tp}`, pw - 14, 290, { align: 'right' });
    }
    doc.save(`dairy-bill-${months[billMonth]}-${billYear}.pdf`);
  };

  const todayEntries = entries.filter(e => new Date(e.date).toDateString() === new Date().toDateString());
  const todayLitres = todayEntries.reduce((s, e) => s + e.totalLitres, 0);
  const todayRevenue = todayEntries.reduce((s, e) => s + e.totalAmount, 0);
  const monthRevenue = monthlyBill.reduce((s, b) => s + b.totalAmount, 0);

  const selC = customers.find(x => x._id === selCustomer);
  const previewLitres = (Number(entryMorning) || 0) + (Number(entryEvening) || 0);
  const previewAmount = entryRate ? previewLitres * Number(entryRate) : 0;

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  return (
    <div className="dairy-container animate-fadeIn">
      <header className="dairy-header">
        <div>
          <h1>🐄 Dairy Saathi</h1>
          <p>Roz ka doodh, customers aur monthly bill — sab ek jagah.</p>
        </div>
        <div className="dairy-pill"><Milk size={18} /> Meri Dairy</div>
      </header>

      <div className="dairy-stats-bar">
        {[
          { label: "Aaj ke Litres", value: `${todayLitres.toFixed(1)} L`, color: '#34d399' },
          { label: "Aaj ki Kamai", value: `₹${todayRevenue.toFixed(0)}`, color: '#60a5fa' },
          { label: "Is Mahine", value: `₹${monthRevenue.toFixed(0)}`, color: '#a78bfa' },
          { label: "Customers", value: customers.length, color: '#fbbf24' },
        ].map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className="dairy-stat-div" />}
            <div className="dairy-stat-item">
              <div className="dairy-stat-label">{s.label}</div>
              <div className="dairy-stat-val" style={{ color: s.color }}>{s.value}</div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Tabs */}
      <div className="dairy-tabs">
        {[['entry','📝 Daily Entry'],['customers','👥 Customers'],['bill','🧾 Monthly Bill']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} className={`dairy-tab-btn ${activeTab === id ? 'active' : ''}`}>{label}</button>
        ))}
      </div>

      {/* ── DAILY ENTRY TAB ── */}
      {activeTab === 'entry' && (
        <div className="dairy-grid">
          <section className="dairy-card">
            <h3 className="dairy-card-title"><PlusCircle size={18} /> Aaj ka Doodh Likho</h3>
            <form onSubmit={handleAddEntry}>
              <div className="dairy-input-group">
                <label>Customer Select Karo</label>
                <select value={selCustomer} onChange={e => setSelCustomer(e.target.value)} className="dairy-select" required>
                  <option value="">-- Customer Choose Karo --</option>
                  {customers.map(c => <option key={c._id} value={c._id}>{c.customerName} (₹{c.ratePerLitre}/L)</option>)}
                </select>
              </div>
              <div className="dairy-input-group">
                <label>Date</label>
                <input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} required />
              </div>
              <div className="dairy-input-group">
                <label>Rate per Litre (₹)</label>
                <input type="number" value={entryRate} onChange={e => setEntryRate(e.target.value)} placeholder="e.g. 50" min="1" step="0.5" required />
              </div>
              <div className="dairy-input-row">
                <div className="dairy-input-group">
                  <label>Subah (Litres)</label>
                  <input type="number" value={entryMorning} onChange={e => setEntryMorning(e.target.value)} placeholder="0.0" step="0.1" min="0" />
                </div>
                <div className="dairy-input-group">
                  <label>Shaam (Litres)</label>
                  <input type="number" value={entryEvening} onChange={e => setEntryEvening(e.target.value)} placeholder="0.0" step="0.1" min="0" />
                </div>
              </div>
              {selC && previewLitres > 0 && entryRate && (
                <div className="dairy-preview">
                  Total: <strong>{previewLitres.toFixed(1)} L</strong> × ₹{entryRate} = <strong>₹{previewAmount.toFixed(0)}</strong>
                </div>
              )}
              <button type="submit" className="dairy-btn primary"><Milk size={16} /> Entry Save Karo</button>
            </form>
          </section>

          <section className="dairy-card">
            <h3 className="dairy-card-title"><TrendingUp size={18} /> Recent Entries</h3>
            <div className="dairy-list">
              {loading ? <p className="dairy-loading">Loading...</p> :
                entries.length === 0 ? <div className="dairy-empty"><Milk size={36} style={{opacity:0.2}}/><br/>Koi entry nahi hai abhi.</div> :
                entries.slice(0, 20).map(e => (
                  <div key={e._id} className="dairy-row">
                    <div className="dairy-row-main">
                      <div>
                        <span className="dairy-row-title">{e.customerName}</span>
                        <span className="dairy-row-sub">{new Date(e.date).toLocaleDateString('en-IN')} • 🌅{e.morningQty}L + 🌙{e.eveningQty}L</span>
                      </div>
                      <span className="dairy-row-amount">₹{e.totalAmount.toFixed(0)}</span>
                    </div>
                    <button className="dairy-del-btn" onClick={() => handleDeleteEntry(e._id)}><Trash2 size={15}/></button>
                  </div>
                ))
              }
            </div>
          </section>
        </div>
      )}

      {/* ── CUSTOMERS TAB ── */}
      {activeTab === 'customers' && (
        <div className="dairy-grid">
          <section className="dairy-card">
            <h3 className="dairy-card-title"><PlusCircle size={18} /> Naya Customer Jodo</h3>
            <form onSubmit={handleAddCustomer}>
              <div className="dairy-input-group">
                <label>Customer ka Naam</label>
                <input type="text" value={cName} onChange={e => setCName(e.target.value)} placeholder="e.g. Ramesh Kumar" required />
              </div>
              <div className="dairy-input-group">
                <label>Mobile Number (Optional)</label>
                <input type="tel" value={cPhone} onChange={e => setCPhone(e.target.value)} placeholder="9876543210" />
              </div>
              <button type="submit" className="dairy-btn primary"><Users size={16}/> Customer Add Karo</button>
            </form>
          </section>

          <section className="dairy-card">
            <h3 className="dairy-card-title"><Users size={18} /> Customer List</h3>
            <div className="dairy-list">
              {customers.length === 0 ? <div className="dairy-empty"><Users size={36} style={{opacity:0.2}}/><br/>Koi customer nahi hai.</div> :
                customers.map(c => (
                  <div key={c._id} className="dairy-row">
                    <div className="dairy-row-main">
                      <div>
                        <span className="dairy-row-title">{c.customerName}</span>
                        <span className="dairy-row-sub">
                          🌅{c.morningQty}L + 🌙{c.eveningQty}L • ₹{c.ratePerLitre}/L
                          {c.phoneNumber && <> • <Phone size={11} style={{display:'inline'}}/> {c.phoneNumber}</>}
                        </span>
                      </div>
                      <span className="dairy-row-amount" style={{color:'#fbbf24'}}>
                        ₹{((c.morningQty + c.eveningQty) * c.ratePerLitre).toFixed(0)}/din
                      </span>
                    </div>
                    <button className="dairy-del-btn" onClick={() => handleDeleteCustomer(c._id)}><Trash2 size={15}/></button>
                  </div>
                ))
              }
            </div>
          </section>
        </div>
      )}

      {/* ── MONTHLY BILL TAB ── */}
      {activeTab === 'bill' && (
        <div>
          <div style={{display:'flex', gap:'1rem', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap'}}>
            <select value={billMonth} onChange={e => setBillMonth(Number(e.target.value))} className="dairy-select" style={{width:'auto',minWidth:'160px'}}>
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <input type="number" value={billYear} onChange={e => setBillYear(Number(e.target.value))} className="dairy-select" style={{width:'100px'}} min="2020" max="2030" />
            <button onClick={handleDownloadBillPDF} className="dairy-btn download" style={{width:'auto',padding:'0.7rem 1.2rem'}}>
              <Download size={16}/> PDF Download
            </button>
          </div>

          <div className="dairy-grid">
            {monthlyBill.length === 0 ? (
              <div className="dairy-card dairy-empty" style={{gridColumn:'span 2'}}>
                <Milk size={48} style={{opacity:0.2, marginBottom:'10px'}}/><br/>
                {MONTHS[billMonth]} mein koi entry nahi hai.
              </div>
            ) : monthlyBill.map((b, i) => (
              <div key={i} className="dairy-card" style={{borderLeft:'3px solid rgba(52,211,153,0.5)'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem'}}>
                  <div>
                    <div className="dairy-row-title" style={{fontSize:'1.1rem'}}>{b.customerName}</div>
                    <div className="dairy-row-sub">{b.entries} din ka hisaab</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'1.4rem', fontWeight:'800', color:'#34d399'}}>₹{b.totalAmount.toFixed(0)}</div>
                    <div style={{fontSize:'0.8rem', color:'#60a5fa'}}>{b.totalLitres.toFixed(1)} Litres</div>
                  </div>
                </div>
                <div style={{background:'rgba(255,255,255,0.03)', borderRadius:'10px', padding:'0.75rem', display:'flex', justifyContent:'space-between', fontSize:'0.85rem', color:'rgba(255,255,255,0.5)'}}>
                  <span>Total Amount</span>
                  <span style={{color:'#34d399', fontWeight:'700'}}>₹{b.totalAmount.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
          {monthlyBill.length > 0 && (
            <div style={{marginTop:'1.5rem', background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:'14px', padding:'1rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <span style={{color:'rgba(255,255,255,0.7)', fontWeight:'600'}}>{MONTHS[billMonth]} — Kul Revenue</span>
              <span style={{fontSize:'1.5rem', fontWeight:'800', color:'#34d399'}}>₹{monthRevenue.toFixed(0)}</span>
            </div>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html:`
        .dairy-container { padding: 1.5rem; max-width: 1100px; margin: 0 auto; font-family: 'Outfit', sans-serif; }
        .dairy-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .dairy-header h1 { font-size: 2rem; font-weight: 700; color: #fff; margin: 0; }
        .dairy-header p { color: rgba(255,255,255,0.55); margin: 0.2rem 0 0; font-size: 0.95rem; }
        .dairy-pill { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.3); padding: 0.6rem 1.2rem; border-radius: 50px; display: flex; align-items: center; gap: 8px; color: #34d399; font-weight: 600; }
        .dairy-stats-bar { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 1.5rem 2rem; display: flex; justify-content: space-around; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .dairy-stat-item { text-align: center; min-width: 100px; }
        .dairy-stat-label { font-size: 0.78rem; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.05rem; margin-bottom: 0.4rem; }
        .dairy-stat-val { font-size: 1.5rem; font-weight: 800; }
        .dairy-stat-div { width: 1px; height: 40px; background: rgba(255,255,255,0.08); }
        .dairy-tabs { display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap; }
        .dairy-tab-btn { flex: 1; min-width: 130px; padding: 0.85rem 1rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.55); cursor: pointer; font-weight: 600; font-size: 0.95rem; transition: all 0.25s; font-family: 'Outfit', sans-serif; }
        .dairy-tab-btn:hover { background: rgba(255,255,255,0.07); color: #fff; }
        .dairy-tab-btn.active { background: #fff; color: #000; border-color: #fff; box-shadow: 0 4px 20px rgba(255,255,255,0.15); }
        .dairy-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 2rem; }
        .dairy-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 1.75rem; }
        .dairy-card-title { font-size: 1.05rem; font-weight: 700; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 8px; color: #fff; }
        .dairy-input-group { margin-bottom: 1.1rem; }
        .dairy-input-group label { display: block; font-size: 0.88rem; color: rgba(255,255,255,0.55); margin-bottom: 0.45rem; font-weight: 500; }
        .dairy-input-group input, .dairy-select { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 0.8rem 1rem; border-radius: 12px; color: #fff; outline: none; transition: border-color 0.2s; font-family: 'Outfit', sans-serif; font-size: 0.95rem; }
        .dairy-input-group input:focus, .dairy-select:focus { border-color: #34d399; }
        .dairy-select option { background: #1e293b; color: #fff; }
        .dairy-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .dairy-preview { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2); color: #34d399; padding: 0.8rem 1rem; border-radius: 12px; text-align: center; margin-bottom: 1.1rem; font-size: 0.95rem; }
        .dairy-btn { width: 100%; padding: 1rem; border-radius: 14px; border: none; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Outfit', sans-serif; font-size: 1rem; transition: filter 0.2s, transform 0.15s; }
        .dairy-btn.primary { background: linear-gradient(135deg, #10b981, #059669); color: #fff; box-shadow: 0 8px 20px rgba(16,185,129,0.3); }
        .dairy-btn.download { background: linear-gradient(135deg, #8b5cf6, #6366f1); color: #fff; }
        .dairy-btn:hover { filter: brightness(1.1); }
        .dairy-btn:active { transform: scale(0.98); }
        .dairy-list { display: flex; flex-direction: column; gap: 0.7rem; max-height: 480px; overflow-y: auto; }
        .dairy-list::-webkit-scrollbar { width: 5px; }
        .dairy-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .dairy-row { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); padding: 0.9rem 1rem; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s; }
        .dairy-row:hover { background: rgba(255,255,255,0.06); }
        .dairy-row-main { flex: 1; display: flex; justify-content: space-between; align-items: center; margin-right: 0.75rem; }
        .dairy-row-title { display: block; font-weight: 600; color: #fff; font-size: 1rem; }
        .dairy-row-sub { display: block; font-size: 0.78rem; color: rgba(255,255,255,0.4); margin-top: 3px; }
        .dairy-row-amount { font-weight: 700; font-size: 1.1rem; color: #34d399; white-space: nowrap; }
        .dairy-del-btn { background: transparent; border: none; color: #f87171; opacity: 0.3; cursor: pointer; padding: 6px; border-radius: 8px; transition: opacity 0.2s; flex-shrink: 0; }
        .dairy-del-btn:hover { opacity: 1; background: rgba(248,113,113,0.1); }
        .dairy-empty { text-align: center; padding: 3rem 1rem; color: rgba(255,255,255,0.3); font-size: 0.9rem; }
        .dairy-loading { text-align: center; padding: 2rem; color: rgba(255,255,255,0.4); }
        @media (max-width: 850px) { .dairy-grid { grid-template-columns: 1fr; } }
        @media (max-width: 600px) { .dairy-header { flex-direction: column; align-items: flex-start; } .dairy-stats-bar { flex-direction: column; gap: 1rem; } .dairy-stat-div { width: 100%; height: 1px; } .dairy-input-row { grid-template-columns: 1fr; } }
      `}} />
    </div>
  );
};

export default DairySaathi;
