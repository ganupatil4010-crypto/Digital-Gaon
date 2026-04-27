import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { 
  Hotel, Utensils, Receipt, Users, PlusCircle, Trash2, 
  CheckCircle2, Download, TrendingUp, IndianRupee, Clock, ChevronRight, 
  AlertTriangle, Phone, ChefHat, Sparkles, LayoutDashboard, History,
  Plus, X, Wallet, ShoppingBag, FileText, Printer
} from 'lucide-react';
import API_BASE_URL from '../config/api';

const HotelSaathi = ({ userEmail }) => {
  const [activeTab, setActiveTab] = useState('orders'); 
  const [orders, setOrders] = useState([]);
  const [udhaarList, setUdhaarList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Order State
  const [selTable, setSelTable] = useState('');
  const [currentItems, setCurrentItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQty, setItemQty] = useState('1');

  // Udhaar State
  const [uName, setUName] = useState('');
  const [uPhone, setUPhone] = useState('');
  const [uAmount, setUAmount] = useState('');

  const [menu, setMenu] = useState(() => {
    const saved = localStorage.getItem('hotelMenu');
    return saved ? JSON.parse(saved) : [
      { name: 'Masala Tea', price: 20 },
      { name: 'Samosa', price: 30 },
      { name: 'Veg Thali', price: 150 },
      { name: 'Chicken Biryani', price: 220 },
      { name: 'Coffee', price: 40 },
      { name: 'Cold Drink', price: 30 }
    ];
  });

  const email = userEmail || localStorage.getItem('userEmail');

  useEffect(() => {
    if (email) fetchData();
  }, [email]);

  useEffect(() => {
    localStorage.setItem('hotelMenu', JSON.stringify(menu));
  }, [menu]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [oRes, uRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/hotel/orders?email=${encodeURIComponent(email)}`),
        axios.get(`${API_BASE_URL}/api/hotel/udhaar?email=${encodeURIComponent(email)}`)
      ]);
      setOrders(oRes.data);
      setUdhaarList(uRes.data);
    } catch (err) { console.error('Error fetching hotel data:', err); }
    finally { setLoading(false); }
  };

  const handleAddItemToOrder = () => {
    if (!itemName || !itemPrice) return;
    setCurrentItems([...currentItems, { 
      name: itemName, 
      price: Number(itemPrice), 
      qty: Number(itemQty),
      id: Date.now()
    }]);
    setItemName(''); setItemPrice(''); setItemQty('1');
  };

  const handleRemoveItem = (id) => {
    setCurrentItems(currentItems.filter(item => item.id !== id));
  };

  const handleSaveOrder = async () => {
    if (!selTable || currentItems.length === 0) {
      alert("Please enter table name and add items.");
      return;
    }
    setActionLoading(true);
    const total = currentItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    try {
      await axios.post(`${API_BASE_URL}/api/hotel/orders`, {
        email, tableName: selTable, items: currentItems.map(({name, price, qty}) => ({name, price, qty})), totalAmount: total, status: 'Paid'
      });
      setSelTable(''); setCurrentItems([]);
      fetchData();
    } catch (err) { console.error('Order save error:', err); }
    finally { setActionLoading(false); }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/hotel/orders/${id}`);
      fetchData();
    } catch (err) { console.error('Delete error:', err); }
  };

  const handleAddUdhaar = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/hotel/udhaar`, {
        email, customerName: uName, phoneNumber: uPhone, amount: Number(uAmount)
      });
      setUName(''); setUPhone(''); setUAmount('');
      fetchData();
    } catch (err) { console.error('Udhaar add error:', err); }
    finally { setActionLoading(false); }
  };

  const handleSettleUdhaar = async (id) => {
    if (!window.confirm('Mark as settled?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/hotel/udhaar/${id}`);
      fetchData();
    } catch (err) { console.error('Settle udhaar error:', err); }
  };

  const downloadReceipt = (order) => {
    const doc = new jsPDF({ unit: 'mm', format: [80, 150] });
    doc.setFont('helvetica', 'bold');
    doc.text('HOTEL SAATHI BILL', 40, 12, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Guest: ${order.tableName}`, 10, 22);
    doc.text(`Date: ${new Date(order.date).toLocaleString()}`, 10, 27);
    doc.line(10, 30, 70, 30);
    let y = 37;
    order.items.forEach(item => {
      doc.text(`${item.name} x${item.qty}`, 10, y);
      doc.text(`Rs.${item.price * item.qty}`, 70, y, { align: 'right' });
      y += 6;
    });
    doc.line(10, y, 70, y);
    y += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 10, y);
    doc.text(`Rs.${order.totalAmount}`, 70, y, { align: 'right' });
    doc.save(`Order_${order.tableName}.pdf`);
  };

  const downloadCreditReceipt = (entry) => {
    const doc = new jsPDF({ unit: 'mm', format: [80, 120] });
    doc.setFont('helvetica', 'bold');
    doc.text('UDHAAR PARCHA', 40, 12, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Customer: ${entry.customerName}`, 10, 25);
    doc.text(`Phone: ${entry.phoneNumber || 'N/A'}`, 10, 32);
    doc.text(`Date: ${new Date(entry.date).toLocaleDateString()}`, 10, 39);
    doc.line(10, 45, 70, 45);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('AMOUNT DUE:', 10, 60);
    doc.text(`Rs.${entry.amount}`, 70, 60, { align: 'right' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Please settle as soon as possible.', 40, 80, { align: 'center' });
    doc.save(`Udhaar_${entry.customerName}.pdf`);
  };

  const downloadDailyReport = () => {
    const tOrders = orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString());
    if (tOrders.length === 0) {
      alert("No orders today to generate report.");
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Daily Sales Report', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 25);
    doc.line(20, 28, 190, 28);
    let y = 40;
    doc.setFont('helvetica', 'bold');
    doc.text('Table/Guest', 20, y);
    doc.text('Items', 80, y);
    doc.text('Amount', 170, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 10;
    tOrders.forEach((o, index) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${index + 1}. ${o.tableName}`, 20, y);
      doc.text(`${o.items.length} items`, 80, y);
      doc.text(`Rs.${o.totalAmount}`, 170, y, { align: 'right' });
      y += 8;
    });
    y += 10;
    doc.line(20, y, 190, y);
    y += 10;
    const total = tOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('GRAND TOTAL:', 20, y);
    doc.text(`Rs.${total}`, 170, y, { align: 'right' });
    doc.save(`Daily_Report_${new Date().toLocaleDateString()}.pdf`);
  };

  const todayOrders = orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.filter(o => o.status === 'Paid').reduce((sum, o) => sum + o.totalAmount, 0);
  const totalPendingUdhaar = udhaarList.reduce((sum, u) => sum + u.amount, 0);

  return (
    <div className="hotel-saathi-modern">
      <div className="hs-layout">
        <header className="hs-header">
          <div className="header-info">
            <div className="header-icon-box"><Hotel size={24} color="#6366f1" /></div>
            <div><h1>Hotel Saathi</h1><p>Management Suite</p></div>
          </div>
          <div className="header-stats">
            <div className="stat-pill success"><TrendingUp size={14} /> <span>₹{todayRevenue}</span></div>
            <div className="stat-pill danger"><Wallet size={14} /> <span>₹{totalPendingUdhaar}</span></div>
          </div>
        </header>

        <nav className="hs-tabs-container">
          <div className="hs-tabs">
            {[
              { id: 'orders', label: 'Billing', icon: <Receipt size={18} /> },
              { id: 'udhaar', label: 'Udhaar', icon: <History size={18} /> },
              { id: 'menu', label: 'Menu', icon: <ChefHat size={18} /> }
            ].map(tab => (
              <button key={tab.id} className={`hs-tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                {tab.icon} <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {loading ? (
          <div className="hs-loading">Loading...</div>
        ) : (
          <div className="hs-main-content animate-fadeIn">
            {activeTab === 'orders' && (
              <div className="hs-grid">
                <div className="hs-card">
                  <div className="hs-card-header"><Plus size={20} /> <h2>Order Entry</h2></div>
                  <div className="hs-card-body">
                    <div className="hs-input-group">
                      <label>Table / Guest</label>
                      <input type="text" placeholder="Table 01" value={selTable} onChange={e => setSelTable(e.target.value)} />
                    </div>
                    <div className="hs-input-group">
                      <label>Select Dish</label>
                      <div className="hs-combo">
                        <select value={itemName} onChange={e => {
                          const selected = menu.find(m => m.name === e.target.value);
                          setItemName(e.target.value);
                          if (selected) setItemPrice(selected.price);
                        }}>
                          <option value="" disabled>Choose</option>
                          {menu.map((m, i) => <option key={i} value={m.name} style={{color: '#000'}}>{m.name} (₹{m.price})</option>)}
                        </select>
                        <input type="number" className="hs-qty" value={itemQty} onChange={e => setItemQty(e.target.value)} />
                        <button className="hs-add-item" onClick={handleAddItemToOrder}><Plus size={18} /></button>
                      </div>
                    </div>
                    {currentItems.length > 0 && (
                      <div className="hs-bill-preview">
                        {currentItems.map(item => (
                          <div key={item.id} className="hs-bill-item">
                            <span className="item-name">{item.name} x{item.qty}</span>
                            <div className="item-right"><b>₹{item.price * item.qty}</b><button onClick={() => handleRemoveItem(item.id)}><X size={14}/></button></div>
                          </div>
                        ))}
                        <div className="hs-bill-total">Total: <span>₹{currentItems.reduce((sum, item) => sum + (item.price * item.qty), 0)}</span></div>
                      </div>
                    )}
                    <button className="hs-btn-primary" onClick={handleSaveOrder} disabled={!selTable || currentItems.length === 0 || actionLoading}>
                      {actionLoading ? 'Saving...' : 'Confirm Order'}
                    </button>
                  </div>
                </div>

                <div className="hs-card">
                  <div className="hs-card-header hs-between">
                    <div className="hs-flex-gap"><History size={20} /> <h2>Today's List</h2></div>
                    <button className="hs-report-btn" onClick={downloadDailyReport} title="Daily Report"><FileText size={16} /> Report</button>
                  </div>
                  <div className="hs-order-list">
                    {todayOrders.length === 0 ? (<p className="empty-msg">No orders today.</p>) : (
                      todayOrders.map(o => (
                        <div key={o._id} className="hs-order-row">
                          <div className="row-info">
                            <h4>{o.tableName}</h4>
                            <p>{new Date(o.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <div className="row-right">
                            <span className="row-price">₹{o.totalAmount}</span>
                            <div className="row-btns">
                              <button className="hs-icon-btn" onClick={() => downloadReceipt(o)}><Download size={14}/></button>
                              <button className="hs-icon-btn delete" onClick={() => handleDeleteOrder(o._id)}><Trash2 size={14}/></button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'udhaar' && (
              <div className="hs-grid">
                <div className="hs-card">
                  <div className="hs-card-header"><IndianRupee size={20} /> <h2>Record Credit</h2></div>
                  <form onSubmit={handleAddUdhaar} className="hs-card-body">
                    <div className="hs-input-group"><label>Customer Name</label><input type="text" placeholder="Name" value={uName} onChange={e => setUName(e.target.value)} required /></div>
                    <div className="hs-input-group"><label>Phone</label><input type="tel" placeholder="Mobile" value={uPhone} onChange={e => setUPhone(e.target.value)} /></div>
                    <div className="hs-input-group"><label>Amount (₹)</label><input type="number" placeholder="0.00" value={uAmount} onChange={e => setUAmount(e.target.value)} required /></div>
                    <button type="submit" disabled={actionLoading} className="hs-btn-primary danger">Save Credit</button>
                  </form>
                </div>
                <div className="hs-card">
                  <div className="hs-card-header hs-between"><div className="hs-flex-gap"><Users size={20} /> <h2>Udhaar Ledger</h2></div></div>
                  <div className="hs-ledger-list">
                    {udhaarList.length === 0 ? (<p className="empty-msg">Cleared!</p>) : (
                      udhaarList.map(u => (
                        <div key={u._id} className="hs-ledger-row">
                          <div className="l-info">
                            <h4>{u.customerName}</h4>
                            <p>{u.phoneNumber || 'N/A'}</p>
                          </div>
                          <div className="l-right-box">
                            <span className="l-amt">₹{u.amount}</span>
                            <div className="l-btns">
                              <button className="hs-icon-btn info" onClick={() => downloadCreditReceipt(u)}><Download size={16}/></button>
                              <button className="hs-icon-btn success" onClick={() => handleSettleUdhaar(u._id)}><CheckCircle2 size={18}/></button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'menu' && (
              <div className="hs-card full">
                <div className="hs-card-header"><ChefHat size={20} /> <h2>Menu Management</h2></div>
                <div className="hs-menu-flex">
                  <div className="menu-list">
                    {menu.map((m, i) => (
                      <div key={i} className="menu-item-pill">
                        <div className="item-txt"><span className="m-name">{m.name}</span><span className="m-price">₹{m.price}</span></div>
                        <button onClick={() => setMenu(menu.filter((_, idx) => idx !== i))}><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
                  <div className="menu-add-box">
                    <h3>New Dish</h3>
                    <input type="text" placeholder="Name" id="mName" /><input type="number" placeholder="Price" id="mPrice" />
                    <button onClick={() => {
                      const n = document.getElementById('mName').value;
                      const p = document.getElementById('mPrice').value;
                      if (n && p) { setMenu([...menu, { name: n, price: Number(p) }]); document.getElementById('mName').value=''; document.getElementById('mPrice').value=''; }
                    }}>Add</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hotel-saathi-modern { min-height: 100vh; background: #0f172a; color: #f8fafc; font-family: 'Inter', sans-serif; padding: 1rem; }
        .hs-layout { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; }
        .hs-header { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); flex-wrap: wrap; gap: 10px; }
        .header-info { display: flex; align-items: center; gap: 0.75rem; }
        .header-icon-box { width: 40px; height: 40px; background: rgba(99, 102, 241, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .header-info h1 { font-size: 1.25rem; margin: 0; }
        .header-info p { font-size: 0.7rem; color: #94a3b8; margin: 0; }
        .header-stats { display: flex; gap: 0.5rem; }
        .stat-pill { padding: 0.4rem 0.8rem; border-radius: 100px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 5px; }
        .stat-pill.success { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
        .stat-pill.danger { background: rgba(239, 68, 68, 0.1); color: #f87171; }

        .hs-tabs-container { width: 100%; overflow-x: auto; padding-bottom: 5px; -webkit-overflow-scrolling: touch; }
        .hs-tabs { display: flex; gap: 6px; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 10px; width: max-content; }
        .hs-tab-btn { background: transparent; border: none; color: #94a3b8; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.85rem; }
        .hs-tab-btn.active { background: #6366f1; color: #fff; }

        .hs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .hs-card { background: #1e293b; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
        .hs-card.full { grid-column: 1 / -1; }
        .hs-card-header { padding: 1rem; background: rgba(0,0,0,0.1); display: flex; align-items: center; gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .hs-card-header h2 { font-size: 0.95rem; margin: 0; font-weight: 600; }
        .hs-card-body { padding: 1rem; }
        .hs-input-group { margin-bottom: 1rem; }
        .hs-input-group label { font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px; display: block; }
        .hs-input-group input, .hs-combo select { width: 100%; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.1); padding: 0.7rem; border-radius: 8px; color: #fff; font-size: 0.9rem; }
        .hs-combo { display: flex; gap: 6px; }
        .hs-qty { width: 55px !important; text-align: center; }
        .hs-add-item { background: #6366f1; border: none; color: #fff; padding: 0 0.75rem; border-radius: 8px; cursor: pointer; }

        .hs-bill-preview { background: rgba(0,0,0,0.2); padding: 0.75rem; border-radius: 10px; margin-bottom: 1rem; }
        .hs-bill-item { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.85rem; }
        .item-name { flex: 1; margin-right: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hs-bill-total { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; text-align: right; font-weight: 700; font-size: 1.1rem; }
        .hs-bill-total span { color: #818cf8; }

        .hs-btn-primary { width: 100%; padding: 0.75rem; border: none; border-radius: 8px; background: #6366f1; color: #fff; font-weight: 700; cursor: pointer; }
        .hs-btn-primary.danger { background: #ef4444; }

        .hs-order-list, .hs-ledger-list { padding: 0.75rem; display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto; }
        .hs-order-row, .hs-ledger-row { background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.03); }
        .row-info h4, .l-info h4 { margin: 0; font-size: 0.9rem; }
        .row-info p, .l-info p { margin: 0; font-size: 0.7rem; color: #64748b; }
        .row-right, .l-right-box { display: flex; align-items: center; gap: 10px; }
        .row-btns, .l-btns { display: flex; gap: 5px; }
        .row-price, .l-amt { font-weight: 700; font-size: 0.9rem; }
        .l-amt { color: #f87171; }
        .hs-icon-btn { width: 28px; height: 28px; border-radius: 6px; background: rgba(255,255,255,0.05); border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .hs-icon-btn.delete { color: #f87171; }
        .hs-icon-btn.success { color: #4ade80; }
        .hs-report-btn { background: #6366f1; border: none; color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; gap: 4px; }

        .hs-menu-flex { display: flex; gap: 1.5rem; padding: 1rem; }
        .menu-list { flex: 1; display: flex; flex-wrap: wrap; gap: 8px; }
        .menu-item-pill { background: rgba(255,255,255,0.05); padding: 0.5rem 0.8rem; border-radius: 8px; display: flex; align-items: center; gap: 10px; font-size: 0.85rem; }
        .menu-add-box { width: 220px; background: rgba(0,0,0,0.1); padding: 1rem; border-radius: 10px; }
        .menu-add-box input { width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 6px; color: #fff; margin-bottom: 8px; font-size: 0.85rem; }
        .menu-add-box button { width: 100%; padding: 0.5rem; background: #fff; color: #000; border: none; border-radius: 6px; font-weight: 700; }

        @media (max-width: 768px) {
          .hs-grid, .hs-menu-flex { grid-template-columns: 1fr; flex-direction: column; }
          .menu-add-box { width: 100%; }
          .hs-layout { gap: 0.75rem; }
          .hs-header { flex-direction: row; }
          .stat-pill span { display: none; }
          .stat-pill { width: 32px; height: 32px; padding: 0; justify-content: center; }
        }
        @media (max-width: 480px) {
          .row-right { flex-direction: column; align-items: flex-end; gap: 5px; }
          .l-right-box { flex-direction: column; align-items: flex-end; gap: 5px; }
          .hs-tab-btn span { display: none; }
          .hs-tab-btn { padding: 0.6rem; }
          .hs-tabs { width: 100%; justify-content: space-around; }
          .hs-header h1 { font-size: 1.1rem; }
        }
      `}} />
    </div>
  );
};

export default HotelSaathi;
