import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { Trash2, Download, Plus, FileText, ShoppingCart, User as UserIcon, Package, AlertCircle, CheckCircle2, ChevronRight, X, Phone, FileDown } from 'lucide-react';

const KrishiKendra = ({ userEmail }) => {
  const [activeTab, setActiveTab] = useState('stock');
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [udhaar, setUdhaar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Form states
  const [itemForm, setItemForm] = useState({ id: '', itemName: '', category: 'Seeds', stock: 0, unit: 'kg', pricePerUnit: 0 });
  const [saleForm, setSaleForm] = useState({ farmerName: '', phoneNumber: '', items: [], paymentMode: 'Cash' });

  const email = userEmail || localStorage.getItem('userEmail');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (msg.text) {
      const timer = setTimeout(() => setMsg({ text: '', type: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stock') {
        const res = await axios.get(`${API_URL}/agri/inventory?email=${email}`);
        setInventory(res.data);
      } else if (activeTab === 'udhaar') {
        const res = await axios.get(`${API_URL}/agri/udhaar?email=${email}`);
        setUdhaar(res.data);
      } else if (activeTab === 'sales') {
        const res = await axios.get(`${API_URL}/agri/sales?email=${email}`);
        setSales(res.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/agri/inventory`, { ...itemForm, email });
      setMsg({ text: itemForm.id ? 'Stock updated successfully!' : 'New item added!', type: 'success' });
      setItemForm({ id: '', itemName: '', category: 'Seeds', stock: 0, unit: 'kg', pricePerUnit: 0 });
      fetchData();
    } catch (err) {
      setMsg({ text: 'Error saving item', type: 'error' });
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this item from inventory?')) return;
    try {
      await axios.delete(`${API_URL}/agri/inventory/${id}`);
      setMsg({ text: 'Item deleted', type: 'success' });
      fetchData();
    } catch (err) {
      setMsg({ text: 'Delete failed', type: 'error' });
    }
  };

  const handleDeleteSale = async (id) => {
    if (!window.confirm('Delete this bill?')) return;
    try {
      await axios.delete(`${API_URL}/agri/sales/${id}`);
      setMsg({ text: 'Bill deleted successfully', type: 'success' });
      fetchData();
    } catch (err) {
      setMsg({ text: 'Delete failed', type: 'error' });
    }
  };

  const handleLogSale = async (e) => {
    e.preventDefault();
    if (saleForm.items.length === 0) return setMsg({ text: 'Add at least one item to bill', type: 'error' });
    
    const totalAmount = saleForm.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    
    try {
      await axios.post(`${API_URL}/agri/sales`, { ...saleForm, totalAmount, email });
      setMsg({ text: 'Bill generated & record saved!', type: 'success' });
      setSaleForm({ farmerName: '', phoneNumber: '', items: [], paymentMode: 'Cash' });
      fetchData();
    } catch (err) {
      setMsg({ text: 'Error recording sale', type: 'error' });
    }
  };

  const addItemToSale = (item, qty) => {
    if (!item || !qty || qty <= 0) return;
    const newItem = {
      itemId: item._id,
      itemName: item.itemName,
      quantity: parseFloat(qty),
      price: item.pricePerUnit
    };
    setSaleForm({ ...saleForm, items: [...saleForm.items, newItem] });
  };

  const removeItemFromSale = (idx) => {
    const newItems = [...saleForm.items];
    newItems.splice(idx, 1);
    setSaleForm({ ...saleForm, items: newItems });
  };

  const generateBillPDF = (sale) => {
    const doc = new jsPDF();
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('AGRI SAATHI INVOICE', 105, 25, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Farmer Name: ${sale.farmerName.toUpperCase()}`, 20, 50);
    doc.text(`Mobile: ${sale.phoneNumber || 'N/A'}`, 20, 58);
    doc.text(`Date: ${new Date(sale.date).toLocaleString()}`, 130, 50);
    doc.text(`Payment Mode: ${sale.paymentMode}`, 130, 58);
    doc.line(20, 62, 190, 62);

    let y = 75;
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('ITEM DESCRIPTION', 20, y);
    doc.text('QTY', 100, y);
    doc.text('RATE', 130, y);
    doc.text('AMOUNT', 170, y);
    doc.line(20, y + 2, 190, y + 2);

    doc.setTextColor(0, 0, 0);
    sale.items.forEach(it => {
        y += 10;
        doc.text(it.itemName, 20, y);
        doc.text(it.quantity.toString(), 100, y);
        doc.text(`Rs.${it.price}`, 130, y);
        doc.text(`Rs.${it.quantity * it.price}`, 170, y);
    });

    doc.line(20, y + 5, 190, y + 5);
    doc.setFontSize(16);
    doc.text(`TOTAL AMOUNT: Rs. ${sale.totalAmount}`, 190, y + 15, { align: 'right' });

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a computer generated invoice by Digital Gaon Platform.', 105, 285, { align: 'center' });

    doc.save(`Bill_${sale.farmerName}_${new Date().getTime()}.pdf`);
  };

  const generateUdhaarReportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('AGRI SAATHI: UDHAAR REPORT', 105, 25, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 20, 50);
    doc.text(`Total Records: ${udhaar.length}`, 130, 50);
    doc.line(20, 55, 190, 55);

    let y = 65;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('FARMER NAME', 20, y);
    doc.text('MOBILE', 80, y);
    doc.text('DATE', 120, y);
    doc.text('AMOUNT', 170, y);
    doc.line(20, y + 2, 190, y + 2);

    doc.setTextColor(0, 0, 0);
    let totalUdhaar = 0;
    udhaar.forEach(u => {
        y += 10;
        doc.text(u.farmerName, 20, y);
        doc.text(u.phoneNumber || 'N/A', 80, y);
        doc.text(new Date(u.date).toLocaleDateString(), 120, y);
        doc.text(`Rs. ${u.amount}`, 170, y);
        totalUdhaar += u.amount;
    });

    doc.line(20, y + 5, 190, y + 5);
    doc.setFontSize(14);
    doc.text(`GRAND TOTAL UDHAAR: Rs. ${totalUdhaar}`, 190, y + 15, { align: 'right' });

    doc.save(`Agri_Udhaar_Report_${new Date().getTime()}.pdf`);
  };

  const generateSalesReportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('AGRI SAATHI: SALES SUMMARY', 105, 25, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 20, 50);
    doc.text(`Period: Last 50 Transactions`, 130, 50);
    doc.line(20, 55, 190, 55);

    let y = 65;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('FARMER', 20, y);
    doc.text('DATE', 80, y);
    doc.text('MODE', 120, y);
    doc.text('TOTAL', 170, y);
    doc.line(20, y + 2, 190, y + 2);

    doc.setTextColor(0, 0, 0);
    let totalSales = 0;
    sales.forEach(s => {
        y += 10;
        doc.text(s.farmerName, 20, y);
        doc.text(new Date(s.date).toLocaleDateString(), 80, y);
        doc.text(s.paymentMode, 120, y);
        doc.text(`Rs. ${s.totalAmount}`, 170, y);
        totalSales += s.totalAmount;
    });

    doc.line(20, y + 5, 190, y + 5);
    doc.setFontSize(14);
    doc.text(`TOTAL REVENUE: Rs. ${totalSales}`, 190, y + 15, { align: 'right' });

    doc.save(`Agri_Sales_Summary_${new Date().getTime()}.pdf`);
  };

  const ss = {
    container: { maxWidth: 1200, margin: '0 auto', padding: '1rem', fontFamily: "'Outfit', sans-serif", color: '#fff' },
    header: { marginBottom: '2rem', textAlign: 'center' },
    title: { fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 900, background: 'linear-gradient(135deg, #fff 20%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' },
    tabBar: { display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
    tab: (active) => ({ flex: 1, minWidth: '100px', padding: '0.8rem 0.5rem', borderRadius: '15px', textAlign: 'center', cursor: 'pointer', background: active ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: 800, transition: 'all 0.3s ease', fontSize: '0.9rem' }),
    card: { background: 'rgba(24,31,46,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '1.2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' },
    grid: { display: 'flex', flexWrap: 'wrap', gap: '1.5rem' },
    gridCol: { flex: '1 1 350px', minWidth: '300px' },
    inputGroup: { marginBottom: '1rem' },
    label: { display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem', fontWeight: 600, marginLeft: '0.3rem' },
    input: { width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#fff', fontSize: '1rem', transition: 'all 0.3s', boxSizing: 'border-box' },
    btn: (color) => ({ width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none', background: color || 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem' }),
    tableContainer: { overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px', minWidth: '400px' },
    th: { textAlign: 'left', padding: '0.8rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' },
    tr: { background: 'rgba(255,255,255,0.02)', borderRadius: '12px' },
    td: { padding: '1rem 0.8rem', color: '#fff', fontSize: '0.9rem' },
    badge: (cat) => ({ padding: '0.3rem 0.7rem', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 800, background: cat==='Seeds'?'rgba(16,185,129,0.15)':cat==='Fertilizer'?'rgba(59,130,246,0.15)':'rgba(245,158,11,0.15)', color: cat==='Seeds'?'#10b981':cat==='Fertilizer'?'#3b82f6':'#f59e0b' })
  };

  return (
    <div style={ss.container}>
      <div style={ss.header}>
        <h1 style={ss.title}>Agri Saathi</h1>
        <p style={{color:'rgba(255,255,255,0.4)', fontWeight: 600, fontSize:'0.9rem'}}>Agri-Business Management Dashboard</p>
      </div>

      <div style={ss.tabBar} className="no-scrollbar">
        <div style={ss.tab(activeTab === 'stock')} onClick={() => setActiveTab('stock')}>
          <Package size={18}/><div style={{marginTop:4}}>Stock</div>
        </div>
        <div style={ss.tab(activeTab === 'sales')} onClick={() => setActiveTab('sales')}>
          <FileText size={18}/><div style={{marginTop:4}}>Billing</div>
        </div>
        <div style={ss.tab(activeTab === 'udhaar')} onClick={() => setActiveTab('udhaar')}>
          <UserIcon size={18}/><div style={{marginTop:4}}>Udhaar</div>
        </div>
      </div>

      {msg.text && (
        <div style={{
          padding:'1rem', borderRadius:'15px', marginBottom:'1.5rem', 
          background: msg.type==='success'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', 
          border:`1px solid ${msg.type==='success'?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.2)'}`, 
          color: msg.type==='success'?'#10b981':'#ef4444',
          display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600, fontSize:'0.9rem'
        }}>
          {msg.type==='success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
          {msg.text}
        </div>
      )}

      {activeTab === 'stock' && (
        <div style={ss.grid}>
          <div style={ss.gridCol}>
            <div style={ss.card}>
              <h3 style={{fontSize:'1.1rem', marginBottom:'1.2rem', display:'flex', alignItems:'center', gap:'0.6rem'}}>
                <Plus size={18} style={{color:'#10b981'}}/> {itemForm.id ? 'Edit Item' : 'Add Item'}
              </h3>
              <form onSubmit={handleSaveItem}>
                <div style={ss.inputGroup}>
                  <label style={ss.label}>Item Name</label>
                  <input style={ss.input} placeholder="e.g. Urea 45kg" value={itemForm.itemName} onChange={e=>setItemForm({...itemForm, itemName:e.target.value})} required />
                </div>
                
                <div style={ss.inputGroup}>
                  <label style={ss.label}>Category</label>
                  <select style={ss.input} value={itemForm.category} onChange={e=>setItemForm({...itemForm, category:e.target.value})}>
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Pesticides">Pesticides</option>
                    <option value="Tools">Tools</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={{display:'flex', gap:'0.8rem', marginBottom:'1rem'}}>
                  <div style={{flex:1}}>
                    <label style={ss.label}>Stock</label>
                    <input type="number" style={ss.input} value={itemForm.stock} onChange={e=>setItemForm({...itemForm, stock:e.target.value})} />
                  </div>
                  <div style={{flex:1}}>
                    <label style={ss.label}>Unit</label>
                    <input style={ss.input} placeholder="kg/bags" value={itemForm.unit} onChange={e=>setItemForm({...itemForm, unit:e.target.value})} />
                  </div>
                </div>

                <div style={ss.inputGroup}>
                  <label style={ss.label}>Price (per unit)</label>
                  <input type="number" style={ss.input} value={itemForm.pricePerUnit} onChange={e=>setItemForm({...itemForm, pricePerUnit:e.target.value})} required />
                </div>

                <button type="submit" style={ss.btn()}>{itemForm.id ? 'Update' : 'Add'}</button>
                {itemForm.id && <button type="button" onClick={()=>setItemForm({id:'', itemName:'', category:'Seeds', stock:0, unit:'kg', pricePerUnit:0})} style={{...ss.btn('transparent'), marginTop:'0.5rem', border:'1px solid rgba(255,255,255,0.1)', fontSize:'0.8rem'}}>Cancel</button>}
              </form>
            </div>
          </div>

          <div style={ss.gridCol}>
            <div style={ss.card}>
              <h3 style={{fontSize:'1.1rem', marginBottom:'1.2rem'}}>Inventory Stock</h3>
              <div style={{maxHeight:500, overflowY:'auto'}} className="no-scrollbar">
                <div style={ss.tableContainer}>
                  <table style={ss.table}>
                    <thead>
                      <tr>
                        <th style={ss.th}>Product</th>
                        <th style={ss.th}>Stock</th>
                        <th style={ss.th}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map(it => (
                        <tr key={it._id} style={ss.tr}>
                          <td style={{...ss.td, cursor:'pointer'}} onClick={() => setItemForm({id:it._id, itemName:it.itemName, category:it.category, stock:it.stock, unit:it.unit, pricePerUnit:it.pricePerUnit})}>
                            <div style={{fontWeight:700}}>{it.itemName}</div>
                            <span style={ss.badge(it.category)}>{it.category}</span>
                          </td>
                          <td style={ss.td}>
                            <div style={{fontWeight:800, color: it.stock < 10 ? '#ef4444' : '#10b981'}}>{it.stock}</div>
                            <div style={{fontSize:'0.6rem', color:'rgba(255,255,255,0.3)'}}>{it.unit}</div>
                          </td>
                          <td style={{textAlign:'right', paddingRight:'0.5rem'}}>
                            <button onClick={() => handleDeleteItem(it._id)} style={{background:'none', border:'none', color:'rgba(239,68,68,0.3)', cursor:'pointer'}}><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div style={ss.grid}>
          <div style={ss.gridCol}>
            <div style={ss.card}>
              <h3 style={{fontSize:'1.1rem', marginBottom:'1.2rem', display:'flex', alignItems:'center', gap:'0.6rem'}}>
                 <ShoppingCart size={18} style={{color:'#3b82f6'}}/> New Bill
              </h3>
              <form onSubmit={handleLogSale}>
                <div style={ss.inputGroup}>
                  <label style={ss.label}>Farmer Name</label>
                  <input style={ss.input} placeholder="Farmer Full Name" value={saleForm.farmerName} onChange={e=>setSaleForm({...saleForm, farmerName:e.target.value})} required />
                </div>

                <div style={ss.inputGroup}>
                  <label style={ss.label}>Mobile Number</label>
                  <div style={{position:'relative'}}>
                    <Phone size={16} style={{position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.2)'}}/>
                    <input style={{...ss.input, paddingLeft:'2.8rem'}} placeholder="10-digit number" value={saleForm.phoneNumber} onChange={e=>setSaleForm({...saleForm, phoneNumber:e.target.value})} />
                  </div>
                </div>

                <div style={{background:'rgba(255,255,255,0.02)', padding:'1rem', borderRadius:'15px', border:'1px solid rgba(255,255,255,0.05)', marginBottom:'1rem'}}>
                  <label style={ss.label}>Add Product</label>
                  <div style={{display:'flex', gap:'0.4rem', marginBottom:'0.8rem'}}>
                    <select id="itemSel" style={{...ss.input, flex:2, fontSize:'0.9rem'}}>
                      <option value="">Select...</option>
                      {inventory.map(it => <option key={it._id} value={it._id}>{it.itemName}</option>)}
                    </select>
                    <input id="itemQty" type="number" style={{...ss.input, flex:1}} placeholder="Qty" />
                    <button type="button" style={{...ss.btn(), width:'auto', marginTop:0}} onClick={() => {
                      const id = document.getElementById('itemSel').value;
                      const qty = document.getElementById('itemQty').value;
                      const item = inventory.find(i => i._id === id);
                      addItemToSale(item, qty);
                    }}><Plus size={18}/></button>
                  </div>

                  <div>
                    {saleForm.items.map((it, idx) => (
                      <div key={idx} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.6rem', background:'rgba(255,255,255,0.02)', borderRadius:'10px', marginBottom:'0.4rem', fontSize:'0.85rem'}}>
                        <div>{it.itemName} (x{it.quantity})</div>
                        <div style={{display:'flex', gap:'0.6rem', alignItems:'center'}}>
                          <div style={{fontWeight:800}}>₹{it.quantity * it.price}</div>
                          <button type="button" onClick={()=>removeItemFromSale(idx)} style={{background:'none', border:'none', color:'rgba(239,68,68,0.4)', cursor:'pointer'}}><X size={14}/></button>
                        </div>
                      </div>
                    ))}
                    {saleForm.items.length > 0 && (
                      <div style={{marginTop:'0.8rem', paddingTop:'0.8rem', borderTop:'1px solid rgba(255,255,255,0.05)', textAlign:'right'}}>
                        <span style={{fontSize:'0.8rem', opacity:0.5}}>Total: </span>
                        <span style={{fontWeight:900, fontSize:'1.2rem', color:'#10b981'}}>₹{saleForm.items.reduce((sum, it) => sum + (it.price * it.quantity), 0)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={ss.inputGroup}>
                  <label style={ss.label}>Payment</label>
                  <select style={ss.input} value={saleForm.paymentMode} onChange={e=>setSaleForm({...saleForm, paymentMode:e.target.value})}>
                    <option value="Cash">Cash</option>
                    <option value="Online">Online / UPI</option>
                    <option value="Credit">Udhaar (Credit)</option>
                  </select>
                </div>

                <button type="submit" style={ss.btn()}><CheckCircle2 size={18}/> Save & Bill</button>
              </form>
            </div>
          </div>

          <div style={ss.gridCol}>
            <div style={ss.card}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.2rem'}}>
                <h3 style={{fontSize:'1.1rem', margin:0}}>Recent Bills</h3>
                <button onClick={generateSalesReportPDF} style={{background:'rgba(59,130,246,0.1)', border:'none', color:'#60a5fa', padding:'0.4rem 0.8rem', borderRadius:'10px', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', fontSize:'0.75rem', fontWeight:700}}>
                  <FileDown size={14}/> Report
                </button>
              </div>
              <div style={{maxHeight:500, overflowY:'auto'}} className="no-scrollbar">
                {sales.map(s => (
                  <div key={s._id} style={{
                    padding:'1rem', background:'rgba(255,255,255,0.02)', borderRadius:'15px', 
                    marginBottom:'0.6rem', display:'flex', justifyContent:'space-between', alignItems:'center',
                    border: '1px solid rgba(255,255,255,0.03)'
                  }}>
                    <div style={{overflow:'hidden'}}>
                      <div style={{fontWeight:800, fontSize:'0.9rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{s.farmerName}</div>
                      <div style={{fontSize:'0.65rem', color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center', gap:'4px'}}><Phone size={10}/> {s.phoneNumber || 'N/A'}</div>
                      <div style={{fontSize:'0.6rem', color:'rgba(255,255,255,0.2)', marginTop:'2px'}}>{new Date(s.date).toLocaleDateString()} • {s.paymentMode}</div>
                    </div>
                    <div style={{display:'flex', gap:'0.6rem', alignItems:'center'}}>
                      <div style={{fontWeight:900, color:'#10b981', fontSize:'0.95rem'}}>₹{s.totalAmount}</div>
                      <button onClick={() => generateBillPDF(s)} style={{background:'none', border:'none', color:'#60a5fa', cursor:'pointer'}}><Download size={18}/></button>
                      <button onClick={() => handleDeleteSale(s._id)} style={{background:'none', border:'none', color:'rgba(239,68,68,0.2)', cursor:'pointer'}}><Trash2 size={15}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'udhaar' && (
        <div style={ss.card}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
            <h3 style={{fontSize:'1.2rem', margin:0, display:'flex', alignItems:'center', gap:'0.8rem'}}>
               <UserIcon size={20} style={{color:'#f59e0b'}}/> Farmer Credit (Udhaar)
            </h3>
            <button onClick={generateUdhaarReportPDF} style={{background:'rgba(245,158,11,0.1)', border:'none', color:'#f59e0b', padding:'0.5rem 1rem', borderRadius:'12px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', fontSize:'0.85rem', fontWeight:700}}>
              <FileDown size={16}/> Download Report
            </button>
          </div>
          <div style={ss.tableContainer}>
            <table style={ss.table}>
              <thead>
                <tr>
                  <th style={ss.th}>Farmer</th>
                  <th style={ss.th}>Amount</th>
                  <th style={ss.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {udhaar.map(u => (
                  <tr key={u._id} style={ss.tr}>
                    <td style={ss.td}>
                        <div style={{fontWeight:700}}>{u.farmerName}</div>
                        <div style={{fontSize:'0.75rem', opacity:0.5, display:'flex', alignItems:'center', gap:'5px'}}><Phone size={12}/> {u.phoneNumber || 'N/A'}</div>
                    </td>
                    <td style={ss.td}><span style={{color:'#ef4444', fontWeight:900}}>₹{u.amount}</span></td>
                    <td style={ss.td}>
                      <button onClick={async () => {
                        if(!window.confirm('Settle this amount?')) return;
                        await axios.put(`${API_URL}/agri/udhaar/${u._id}/settle`);
                        fetchData();
                        setMsg({ text: 'Udhaar settled!', type: 'success' });
                      }} style={{...ss.btn('#10b981'), marginTop:0, padding:'0.5rem 0.8rem', width:'auto', fontSize:'0.75rem'}}>Settle</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {udhaar.length === 0 && <div style={{textAlign:'center', padding:'2rem', opacity:0.3, fontSize:'0.9rem'}}>No pending udhaar. ✅</div>}
        </div>
      )}
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 600px) {
          body { font-size: 14px; }
        }
        select option {
          background-color: #1a2233 !important;
          color: #ffffff !important;
          padding: 10px;
        }
      `}</style>
    </div>
  );
};

export default KrishiKendra;
