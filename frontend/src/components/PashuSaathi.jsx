import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { 
  Heart, PlusCircle, Trash2, Calendar, ClipboardList, 
  Stethoscope, Syringe, User, Tag, Info, Download, Search,
  CheckCircle2, AlertCircle, TrendingUp, IndianRupee, ArrowRight, Phone, Users
} from 'lucide-react';
import API_BASE_URL from '../config/api';

const PashuSaathi = ({ userEmail }) => {
  const [activeTab, setActiveTab] = useState('stats'); // stats | animals | treatments | reminders
  const [animals, setAnimals] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [udhaarList, setUdhaarList] = useState([]);
  const [stats, setStats] = useState({ totalAnimals: 0, monthlyTreatments: 0, upcomingTikas: 0, monthlyEarnings: 0, totalUdhaar: 0 });
  const [loading, setLoading] = useState(true);

  // Udhaar Form
  const [uName, setUName] = useState('');
  const [uPhone, setUPhone] = useState('');
  const [uAmount, setUAmount] = useState('');

  // Form States
  const [newAnimal, setNewAnimal] = useState({ ownerName: '', ownerPhone: '', animalType: 'Gaay', tagId: '', animalName: '' });
  const [newTreatment, setNewTreatment] = useState({ animalId: '', type: 'Ilaj', diagnosis: '', medicine: '', charge: '', nextDueDate: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const email = userEmail || localStorage.getItem('userEmail');

  useEffect(() => {
    if (email) {
      fetchData();
    }
  }, [email]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, tRes, rRes, sRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/pashu/animals?email=${encodeURIComponent(email)}`),
        axios.get(`${API_BASE_URL}/api/pashu/treatments?email=${encodeURIComponent(email)}`),
        axios.get(`${API_BASE_URL}/api/pashu/reminders?email=${encodeURIComponent(email)}`),
        axios.get(`${API_BASE_URL}/api/pashu/stats?email=${encodeURIComponent(email)}`)
      ]);
      setAnimals(aRes.data);
      setTreatments(tRes.data);
      setReminders(rRes.data);
      const uRes = await axios.get(`${API_BASE_URL}/api/pashu/udhaar?email=${encodeURIComponent(email)}`);
      setUdhaarList(uRes.data);
      const udhaarTotal = uRes.data.reduce((sum, u) => sum + u.amount, 0);
      setStats({ ...sRes.data, totalUdhaar: udhaarTotal });
    } catch (err) {
      console.error('Error fetching pashu data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnimal = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/pashu/animals`, { ...newAnimal, email });
      setNewAnimal({ ownerName: '', ownerPhone: '', animalType: 'Gaay', tagId: '', animalName: '' });
      fetchData();
    } catch (err) { alert('Animal add karne mein galti hui.'); }
  };

  const handleAddTreatment = async (e) => {
    e.preventDefault();
    const animal = animals.find(a => a._id === newTreatment.animalId);
    if (!animal) return alert('Pashu select karo.');
    try {
      await axios.post(`${API_BASE_URL}/api/pashu/treatments`, { 
        ...newTreatment, 
        email, 
        animalType: animal.animalType, 
        ownerName: animal.ownerName,
        animalName: animal.animalName
      });
      setNewTreatment({ animalId: '', type: 'Ilaj', diagnosis: '', medicine: '', charge: '', nextDueDate: '' });
      fetchData();
    } catch (err) { alert('Treatment save karne mein galti hui.'); }
  };

  const handleDeleteAnimal = async (id) => {
    if (!window.confirm('Kya aap is pashu aur iske saare records delete karna chahte hain?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/pashu/animals/${id}`);
      fetchData();
    } catch (err) { alert('Delete karne mein galti hui.'); }
  };

  const handleAddUdhaar = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/pashu/udhaar`, {
        email, ownerName: uName, ownerPhone: uPhone, amount: Number(uAmount)
      });
      setUName(''); setUPhone(''); setUAmount('');
      fetchData();
    } catch (err) { alert('Udhaar save karne mein galti hui.'); }
  };

  const handleSettleUdhaar = async (id, name) => {
    if (!window.confirm(`${name} ka udhaar settle ho gaya?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/pashu/udhaar/${id}`);
      fetchData();
    } catch (err) { console.error('Error settling udhaar:', err); }
  };

  const handleDownloadUdhaarPDF = () => {
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pw, 35, 'F');
    doc.setFontSize(22);
    doc.setTextColor(248, 113, 113);
    doc.text('Pashu Saathi — Udhaar Report', 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text(`Total Baaki: Rs.${stats.totalUdhaar}`, 14, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString('hi-IN')}`, pw - 14, 30, { align: 'right' });

    let y = 45;
    doc.setFillColor(30, 41, 59);
    doc.rect(10, y - 6, pw - 20, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Owner Naam', 14, y);
    doc.text('Mobile', 80, y);
    doc.text('Udhaar (Rs.)', 140, y);
    doc.text('Date', 175, y);

    y += 10;
    doc.setTextColor(0, 0, 0);
    udhaarList.forEach((u, i) => {
      doc.text(u.ownerName, 14, y);
      doc.text(u.ownerPhone || '-', 80, y);
      doc.setTextColor(220, 38, 38);
      doc.text(`Rs.${u.amount}`, 140, y);
      doc.setTextColor(0, 0, 0);
      doc.text(new Date(u.date).toLocaleDateString('hi-IN'), 175, y);
      y += 8;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    doc.save(`pashu-udhaar-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Pashu Chikitsa Saathi - Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    
    let y = 40;
    doc.text('Recent Treatments:', 14, y);
    y += 10;
    
    treatments.slice(0, 20).forEach((t, i) => {
      doc.text(`${i+1}. ${t.ownerName} - ${t.animalType} (${t.type}): Rs.${t.charge}`, 14, y);
      y += 7;
      if (y > 280) { doc.addPage(); y = 20; }
    });
    
    doc.save('pashu-report.pdf');
  };

  const filteredAnimals = animals.filter(a => 
    a.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (a.animalName && a.animalName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (a.tagId && a.tagId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="pashu-container animate-fadeIn">
      {/* Premium Header */}
      <div className="pashu-hero">
        <div className="hero-content">
          <div className="hero-badge">Digital Vet Assistant</div>
          <h1>Pashu Chikitsa Saathi</h1>
          <p>Village doctors aur pashu-paalakon ke liye ek naya digital anubhav. Pashuon ka register, ilaj history, aur samay par tika-karan reminders — ab sab kuch ek jagah.</p>
          <div className="hero-actions">
            <button className="pashu-btn-premium primary" onClick={() => setActiveTab('animals')}>
              <PlusCircle size={18} /> Naya Pashu Register Karo
            </button>
            <button className="pashu-btn-premium outline" onClick={downloadReport}>
              <Download size={18} /> Report Download Karein
            </button>
          </div>
        </div>
        <div className="hero-icon-blob">
          <Stethoscope size={120} strokeWidth={1} />
        </div>
      </div>

      {/* Stats Section */}
      <div className="pashu-stats-container">
        <div className="stat-card-glass p-animals">
          <div className="stat-icon-wrapper"><ClipboardList size={22} /></div>
          <div className="stat-info">
            <span className="stat-val">{stats.totalAnimals}</span>
            <span className="stat-lbl">Total Pashu</span>
          </div>
          <div className="stat-progress" style={{ width: '65%' }}></div>
        </div>
        <div className="stat-card-glass p-treatments">
          <div className="stat-icon-wrapper"><Stethoscope size={22} /></div>
          <div className="stat-info">
            <span className="stat-val">{stats.monthlyTreatments}</span>
            <span className="stat-lbl">Monthly Ilaj</span>
          </div>
          <div className="stat-progress" style={{ width: '40%' }}></div>
        </div>
        <div className="stat-card-glass p-reminders">
          <div className="stat-icon-wrapper"><Calendar size={22} /></div>
          <div className="stat-info">
            <span className="stat-val">{stats.upcomingTikas}</span>
            <span className="stat-lbl">Reminders</span>
          </div>
          <div className="stat-progress" style={{ width: '80%' }}></div>
        </div>
        <div className="stat-card-glass p-earnings">
          <div className="stat-icon-wrapper"><TrendingUp size={22} /></div>
          <div className="stat-info">
            <span className="stat-val">₹{stats.monthlyEarnings}</span>
            <span className="stat-lbl">Total Kamai</span>
          </div>
          <div className="stat-progress" style={{ width: '55%' }}></div>
        </div>
        <div className="stat-card-glass p-reminders">
          <div className="stat-icon-wrapper"><IndianRupee size={22} /></div>
          <div className="stat-info">
            <span className="stat-val">₹{stats.totalUdhaar}</span>
            <span className="stat-lbl">Baaki Udhaar</span>
          </div>
          <div className="stat-progress" style={{ width: '45%', color: '#f87171' }}></div>
        </div>
      </div>

      {/* Modern Tab System */}
      <div className="pashu-tab-bar">
        <button className={`pashu-tab-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
          <TrendingUp size={18} /> <span>Overview</span>
        </button>
        <button className={`pashu-tab-item ${activeTab === 'animals' ? 'active' : ''}`} onClick={() => setActiveTab('animals')}>
          <Tag size={18} /> <span>Pashu Register</span>
        </button>
        <button className={`pashu-tab-item ${activeTab === 'treatments' ? 'active' : ''}`} onClick={() => setActiveTab('treatments')}>
          <Syringe size={18} /> <span>Ilaj History</span>
        </button>
        <button className={`pashu-tab-item ${activeTab === 'reminders' ? 'active' : ''}`} onClick={() => setActiveTab('reminders')}>
          <Calendar size={18} /> <span>Reminders</span>
        </button>
        <button className={`pashu-tab-item ${activeTab === 'udhaar' ? 'active' : ''}`} onClick={() => setActiveTab('udhaar')}>
          <Users size={18} /> <span>Udhaar Khata</span>
        </button>
      </div>

      {/* Main Content View */}
      <div className="pashu-view-container">
        {loading ? (
          <div className="pashu-loader-wrapper">
            <div className="pashu-loader"></div>
            <p>Data fetch kar rahe hain...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'stats' && (
              <div className="pashu-grid-layout">
                <div className="glass-panel main-form-panel">
                  <div className="panel-header">
                    <Stethoscope size={20} color="var(--primary)" />
                    <h3>Quick Treatment Entry</h3>
                  </div>
                  <form onSubmit={handleAddTreatment} className="premium-form">
                    <div className="pashu-input-group">
                      <label>Pashu Select Karein</label>
                      <select value={newTreatment.animalId} onChange={e => setNewTreatment({...newTreatment, animalId: e.target.value})} required>
                        <option value="">-- Choose Animal --</option>
                        {animals.map(a => <option key={a._id} value={a._id}>{a.ownerName} - {a.animalType} {a.animalName && `(${a.animalName})`}</option>)}
                      </select>
                    </div>
                    <div className="pashu-form-row">
                      <div className="pashu-input-group">
                        <label>Entry Type</label>
                        <select value={newTreatment.type} onChange={e => setNewTreatment({...newTreatment, type: e.target.value})}>
                          <option value="Ilaj">Ilaj (Treatment)</option>
                          <option value="Tika">Tika (Vaccination)</option>
                          <option value="Check-up">Regular Check-up</option>
                        </select>
                      </div>
                      <div className="pashu-input-group">
                        <label>Fees / Charge (₹)</label>
                        <input type="number" placeholder="0" value={newTreatment.charge} onChange={e => setNewTreatment({...newTreatment, charge: e.target.value})} />
                      </div>
                    </div>
                    <div className="pashu-input-group">
                      <label>Diagnosis / Problem</label>
                      <input type="text" placeholder="Bimari ka naam..." value={newTreatment.diagnosis} onChange={e => setNewTreatment({...newTreatment, diagnosis: e.target.value})} />
                    </div>
                    <div className="pashu-input-group">
                      <label>Dawai (Medicine)</label>
                      <input type="text" placeholder="Dawai ki list..." value={newTreatment.medicine} onChange={e => setNewTreatment({...newTreatment, medicine: e.target.value})} />
                    </div>
                    <div className="pashu-input-group">
                      <label>Agli Tarikh (Reminder)</label>
                      <input type="date" value={newTreatment.nextDueDate} onChange={e => setNewTreatment({...newTreatment, nextDueDate: e.target.value})} />
                    </div>
                    <button type="submit" className="pashu-btn-submit">
                      Save Record <ArrowRight size={18} />
                    </button>
                  </form>
                </div>

                <div className="glass-panel reminder-panel">
                  <div className="panel-header">
                    <Calendar size={20} color="#f59e0b" />
                    <h3>Upcoming Tasks</h3>
                  </div>
                  <div className="pashu-scroll-list">
                    {reminders.length === 0 ? (
                      <div className="pashu-empty-state">
                        <CheckCircle2 size={40} />
                        <p>Koi upcoming reminder nahi hai.</p>
                      </div>
                    ) : reminders.map(r => (
                      <div key={r._id} className="pashu-list-item reminder">
                        <div className="item-date">
                          <span className="day">{new Date(r.nextDueDate).getDate()}</span>
                          <span className="month">{new Date(r.nextDueDate).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <div className="item-info">
                          <h4>{r.ownerName}</h4>
                          <p>{r.animalType} • {r.type}</p>
                        </div>
                        <div className="item-action">
                          <button className="done-btn"><CheckCircle2 size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ANIMALS TAB */}
            {activeTab === 'animals' && (
              <div className="animals-management">
                <div className="management-header">
                  <div className="pashu-search-box">
                    <Search size={20} />
                    <input type="text" placeholder="Owner, Animal Name ya Tag ID se search karein..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <button className="pashu-btn-premium small" onClick={() => setActiveTab('animals')}>
                    <PlusCircle size={18} /> New Registration
                  </button>
                </div>

                <div className="pashu-grid-layout reverse">
                  <div className="pashu-scroll-list animals-grid">
                    {filteredAnimals.length === 0 ? (
                      <div className="pashu-empty-state large">
                        <Tag size={60} />
                        <p>Koi pashu nahi mila. Naya register karein.</p>
                      </div>
                    ) : filteredAnimals.map(a => (
                      <div key={a._id} className="pashu-card animal">
                        <div className="animal-avatar-premium">
                          {a.animalType === 'Gaay' ? '🐄' : a.animalType === 'Bhains' ? '🐃' : a.animalType === 'Bakri' ? '🐐' : '🐾'}
                        </div>
                        <div className="animal-details">
                          <h3>{a.ownerName}</h3>
                          <div className="detail-tags">
                            <span className="tag-pill">{a.animalType}</span>
                            {a.animalName && <span className="tag-pill name">{a.animalName}</span>}
                            {a.tagId && <span className="tag-pill id">ID: {a.tagId}</span>}
                          </div>
                          {a.ownerPhone && <div className="detail-phone"><Phone size={12} /> {a.ownerPhone}</div>}
                        </div>
                        <button onClick={() => handleDeleteAnimal(a._id)} className="pashu-btn-icon danger">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="glass-panel side-form">
                    <div className="panel-header">
                      <Tag size={20} color="var(--primary)" />
                      <h3>Animal Registration</h3>
                    </div>
                    <form onSubmit={handleAddAnimal} className="premium-form">
                      <div className="pashu-input-group">
                        <label>Owner ka Naam</label>
                        <input type="text" placeholder="Full Name" value={newAnimal.ownerName} onChange={e => setNewAnimal({...newAnimal, ownerName: e.target.value})} required />
                      </div>
                      <div className="pashu-input-group">
                        <label>Mobile Number</label>
                        <input type="tel" placeholder="10 digit number" value={newAnimal.ownerPhone} onChange={e => setNewAnimal({...newAnimal, ownerPhone: e.target.value})} />
                      </div>
                      <div className="pashu-input-group">
                        <label>Pashu ka Prakar (Type)</label>
                        <select value={newAnimal.animalType} onChange={e => setNewAnimal({...newAnimal, animalType: e.target.value})}>
                          <option value="Gaay">Gaay (Cow)</option>
                          <option value="Bhains">Bhains (Buffalo)</option>
                          <option value="Bakri">Bakri (Goat)</option>
                          <option value="Bhed">Bhed (Sheep)</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="pashu-input-group">
                        <label>Animal Name (Optional)</label>
                        <input type="text" placeholder="e.g. Gauri, Nandini" value={newAnimal.animalName} onChange={e => setNewAnimal({...newAnimal, animalName: e.target.value})} />
                      </div>
                      <div className="pashu-input-group">
                        <label>Tag ID / Government ID</label>
                        <input type="text" placeholder="e.g. IN-102938" value={newAnimal.tagId} onChange={e => setNewAnimal({...newAnimal, tagId: e.target.value})} />
                      </div>
                      <button type="submit" className="pashu-btn-submit">
                        Register Pashu <CheckCircle2 size={18} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* TREATMENTS TAB */}
            {activeTab === 'treatments' && (
              <div className="treatments-history">
                <div className="glass-panel table-panel">
                  <div className="panel-header sticky">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Syringe size={20} color="var(--primary)" />
                      <h3>Detailed Treatment History</h3>
                    </div>
                    <button className="pashu-btn-premium tiny" onClick={downloadReport}>
                      <Download size={14} /> Export CSV/PDF
                    </button>
                  </div>
                  <div className="pashu-responsive-table">
                    <table className="pashu-modern-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Owner & Pashu</th>
                          <th>Type</th>
                          <th>Diagnosis</th>
                          <th>Medicine Given</th>
                          <th>Fees</th>
                        </tr>
                      </thead>
                      <tbody>
                        {treatments.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="empty-row">Koi history nahi mili.</td>
                          </tr>
                        ) : treatments.map(t => (
                          <tr key={t._id}>
                            <td className="date-cell">
                              <span className="main-date">{new Date(t.date).toLocaleDateString('hi-IN')}</span>
                              <span className="time-sub">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </td>
                            <td>
                              <div className="owner-pashu-cell">
                                <span className="owner">{t.ownerName}</span>
                                <span className="animal">{t.animalType} {t.animalName && `(${t.animalName})`}</span>
                              </div>
                            </td>
                            <td><span className={`pashu-badge-type ${t.type.toLowerCase()}`}>{t.type}</span></td>
                            <td><div className="diag-text">{t.diagnosis || '-'}</div></td>
                            <td><div className="med-text">{t.medicine || '-'}</div></td>
                            <td className="fee-cell">₹{t.charge}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* REMINDERS TAB */}
            {activeTab === 'reminders' && (
              <div className="reminders-view">
                <div className="pashu-grid-layout full">
                  {reminders.length === 0 ? (
                    <div className="pashu-empty-state large full-width">
                      <Calendar size={80} />
                      <h3>No Upcoming Tasks</h3>
                      <p>Agale 30 dino mein koi vaccination ya follow-up reminder nahi hai.</p>
                    </div>
                  ) : reminders.map(r => (
                    <div key={r._id} className={`pashu-reminder-card-premium ${new Date(r.nextDueDate) < new Date() ? 'overdue' : ''}`}>
                      <div className="card-top">
                        <div className="icon-box">
                          {r.type === 'Tika' ? <Syringe size={24} /> : <Stethoscope size={24} />}
                        </div>
                        <div className="card-status">
                          {new Date(r.nextDueDate) < new Date() ? 'OVERDUE' : 'UPCOMING'}
                        </div>
                      </div>
                      <div className="card-body">
                        <h3>{r.ownerName}</h3>
                        <p>{r.animalType} • {r.type}</p>
                        <div className="card-detail">
                          <Calendar size={14} /> 
                          <span>Due: <strong>{new Date(r.nextDueDate).toLocaleDateString('hi-IN')}</strong></span>
                        </div>
                        {r.medicine && (
                          <div className="card-detail">
                            <Info size={14} /> 
                            <span>Medicine: {r.medicine}</span>
                          </div>
                        )}
                      </div>
                      <div className="card-footer">
                        <button className="action-link">Settle Now <ArrowRight size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* UDHAAR KHATA TAB */}
            {activeTab === 'udhaar' && (
              <div className="udhaar-management">
                <div className="pashu-grid-layout reverse">
                  <div className="pashu-scroll-list">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 10px'}}>
                      <h3 style={{margin:0, fontSize:'0.9rem', color:'rgba(255,255,255,0.5)'}}>Pending Udhaar</h3>
                      <button onClick={handleDownloadUdhaarPDF} className="pashu-btn-premium tiny outline">
                        <Download size={14} /> Download PDF
                      </button>
                    </div>
                    {udhaarList.length === 0 ? (
                      <div className="pashu-empty-state large">
                        <CheckCircle2 size={60} style={{color: '#10b981'}}/>
                        <p>Koi udhaar baaki nahi hai. Badhaai!</p>
                      </div>
                    ) : udhaarList.map(u => (
                      <div key={u._id} className="pashu-card animal" style={{borderLeft: '4px solid #f87171'}}>
                         <div className="animal-details">
                          <h3 style={{marginBottom:'5px'}}>{u.ownerName}</h3>
                          <div className="detail-tags">
                            <span className="tag-pill" style={{color:'#f87171', background:'rgba(248,113,113,0.1)'}}>₹{u.amount} Udhaar</span>
                            <span className="tag-pill">{new Date(u.date).toLocaleDateString('hi-IN')}</span>
                          </div>
                          {u.ownerPhone && <div className="detail-phone"><Phone size={12} /> {u.ownerPhone}</div>}
                        </div>
                        <button onClick={() => handleSettleUdhaar(u._id, u.ownerName)} className="pashu-btn-icon" style={{color:'#10b981'}}>
                          <CheckCircle2 size={22} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="glass-panel side-form">
                    <div className="panel-header">
                      <PlusCircle size={20} color="#f87171" />
                      <h3>Naya Udhaar Likho</h3>
                    </div>
                    <form onSubmit={handleAddUdhaar} className="premium-form">
                      <div className="pashu-input-group">
                        <label>Pashu Maalik ka Naam</label>
                        <input type="text" placeholder="e.g. Rajesh Kumar" value={uName} onChange={e => setUName(e.target.value)} required />
                      </div>
                      <div className="pashu-input-group">
                        <label>Mobile Number (Optional)</label>
                        <input type="tel" placeholder="9876543210" value={uPhone} onChange={e => setUPhone(e.target.value)} />
                      </div>
                      <div className="pashu-input-group">
                        <label>Udhaar Rakam (₹)</label>
                        <input type="number" placeholder="0" value={uAmount} onChange={e => setUAmount(e.target.value)} required />
                      </div>
                      <button type="submit" className="pashu-btn-submit" style={{background: 'linear-gradient(135deg, #f87171, #ef4444)'}}>
                        Udhaar Darz Karo <PlusCircle size={18} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --pashu-primary: #10b981;
          --pashu-secondary: #059669;
          --pashu-accent: #f59e0b;
          --pashu-bg-glass: rgba(17, 24, 39, 0.6);
          --pashu-border-glass: rgba(255, 255, 255, 0.08);
          --pashu-text: #f9fafb;
          --pashu-text-muted: #9ca3af;
        }

        .pashu-container { padding: 2rem; max-width: 1300px; margin: 0 auto; color: var(--pashu-text); font-family: 'Outfit', sans-serif; }

        /* --- Hero Section --- */
        .pashu-hero {
          position: relative;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.05));
          border: 1px solid var(--pashu-border-glass);
          border-radius: 32px;
          padding: 3.5rem;
          margin-bottom: 2.5rem;
          overflow: hidden;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(10px);
        }

        .hero-content { max-width: 600px; position: relative; z-index: 2; }
        .hero-badge { display: inline-block; padding: 0.4rem 1rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 100px; color: var(--pashu-primary); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.5rem; }
        .pashu-hero h1 { font-size: 3.2rem; font-weight: 800; margin: 0 0 1rem; line-height: 1.1; background: linear-gradient(135deg, #fff, var(--pashu-primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .pashu-hero p { font-size: 1.1rem; color: var(--pashu-text-muted); line-height: 1.6; margin-bottom: 2.5rem; }
        
        .hero-actions { display: flex; gap: 1rem; }
        .pashu-btn-premium { display: flex; align-items: center; gap: 10px; padding: 0.9rem 1.8rem; border-radius: 16px; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1); border: none; font-family: inherit; }
        .pashu-btn-premium.primary { background: linear-gradient(135deg, var(--pashu-primary), var(--pashu-secondary)); color: white; box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4); }
        .pashu-btn-premium.outline { background: rgba(255,255,255,0.05); border: 1px solid var(--pashu-border-glass); color: white; }
        .pashu-btn-premium:hover { transform: translateY(-4px); filter: brightness(1.1); box-shadow: 0 15px 30px -10px rgba(16, 185, 129, 0.5); }
        .pashu-btn-premium.small { padding: 0.7rem 1.25rem; font-size: 0.85rem; border-radius: 12px; }
        .pashu-btn-premium.tiny { padding: 0.5rem 0.8rem; font-size: 0.75rem; border-radius: 8px; }

        .hero-icon-blob { position: absolute; right: -2rem; bottom: -2rem; color: var(--pashu-primary); opacity: 0.1; transform: rotate(-15deg); z-index: 1; pointer-events: none; }

        /* --- Stats Cards --- */
        .pashu-stats-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
        .stat-card-glass { background: var(--pashu-bg-glass); border: 1px solid var(--pashu-border-glass); padding: 1.75rem; border-radius: 24px; position: relative; overflow: hidden; display: flex; align-items: center; gap: 1.25rem; backdrop-filter: blur(20px); transition: transform 0.3s ease; }
        .stat-card-glass:hover { transform: translateY(-5px); border-color: var(--pashu-primary); }
        
        .stat-icon-wrapper { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .p-animals .stat-icon-wrapper { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .p-treatments .stat-icon-wrapper { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .p-reminders .stat-icon-wrapper { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .p-earnings .stat-icon-wrapper { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

        .stat-info { flex: 1; }
        .stat-val { display: block; font-size: 2rem; font-weight: 800; color: #fff; margin-bottom: 2px; }
        .stat-lbl { display: block; font-size: 0.75rem; color: var(--pashu-text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .stat-progress { position: absolute; bottom: 0; left: 0; height: 3px; background: currentColor; opacity: 0.3; }
        .p-animals .stat-progress { color: #3b82f6; }
        .p-treatments .stat-progress { color: #10b981; }
        .p-reminders .stat-progress { color: #f59e0b; }
        .p-earnings .stat-progress { color: #8b5cf6; }

        /* --- Tab Bar --- */
        .pashu-tab-bar { display: flex; gap: 0.5rem; background: rgba(0,0,0,0.2); padding: 0.4rem; border-radius: 20px; border: 1px solid var(--pashu-border-glass); margin-bottom: 2.5rem; width: fit-content; overflow-x: auto; scrollbar-width: none; }
        .pashu-tab-bar::-webkit-scrollbar { display: none; }
        
        .pashu-tab-item { background: transparent; border: none; padding: 0.8rem 1.5rem; border-radius: 16px; color: var(--pashu-text-muted); font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
        .pashu-tab-item.active { background: white; color: #000; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
        .pashu-tab-item:not(.active):hover { color: white; background: rgba(255,255,255,0.05); }

        /* --- Layout Grid --- */
        .pashu-grid-layout { display: grid; grid-template-columns: 1fr 400px; gap: 2rem; }
        .pashu-grid-layout.reverse { grid-template-columns: 400px 1fr; }
        .pashu-grid-layout.full { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }

        .glass-panel { background: var(--pashu-bg-glass); border: 1px solid var(--pashu-border-glass); border-radius: 28px; padding: 2rem; backdrop-filter: blur(30px); }
        .panel-header { display: flex; align-items: center; gap: 12px; margin-bottom: 2rem; }
        .panel-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #fff; }
        .panel-header.sticky { position: sticky; top: 0; background: rgba(17, 24, 39, 0.9); z-index: 10; margin: -2rem -2rem 2rem; padding: 1.5rem 2rem; border-bottom: 1px solid var(--pashu-border-glass); border-radius: 28px 28px 0 0; backdrop-filter: blur(20px); justify-content: space-between; }

        /* --- Form Styling --- */
        .premium-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .pashu-input-group { display: flex; flex-direction: column; gap: 0.6rem; }
        .pashu-input-group label { font-size: 0.85rem; color: var(--pashu-text-muted); font-weight: 500; padding-left: 4px; }
        .premium-form input, .premium-form select { 
          background: #0f172a; 
          border: 1px solid var(--pashu-border-glass); 
          padding: 1rem 1.25rem; 
          border-radius: 14px; 
          color: white; 
          width: 100%; 
          outline: none; 
          transition: all 0.2s; 
          font-family: inherit; 
          font-size: 0.95rem; 
          appearance: none;
          -webkit-appearance: none;
        }
        
        .premium-form select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.2rem;
          padding-right: 3rem;
        }

        .premium-form option {
          background-color: #1e293b;
          color: white;
          padding: 10px;
        }

        .premium-form input:focus, .premium-form select:focus { 
          border-color: var(--pashu-primary); 
          background: #1e293b; 
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); 
        }
        .pashu-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        
        .pashu-btn-submit { margin-top: 1rem; background: linear-gradient(135deg, var(--pashu-primary), var(--pashu-secondary)); color: white; border: none; padding: 1.1rem; border-radius: 16px; font-weight: 800; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.3s; box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4); }
        .pashu-btn-submit:hover { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 15px 30px -5px rgba(16, 185, 129, 0.5); }

        /* --- List & Cards --- */
        .pashu-scroll-list { display: flex; flex-direction: column; gap: 1rem; max-height: 600px; overflow-y: auto; padding-right: 0.5rem; }
        .pashu-scroll-list::-webkit-scrollbar { width: 5px; }
        .pashu-scroll-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

        .pashu-list-item { background: rgba(255,255,255,0.03); border: 1px solid var(--pashu-border-glass); border-radius: 20px; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 1.25rem; transition: all 0.2s; }
        .pashu-list-item:hover { background: rgba(255,255,255,0.06); border-color: var(--pashu-border-glass); }
        
        .item-date { width: 48px; height: 48px; background: rgba(245, 158, 11, 0.1); color: #f59e0b; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1; flex-shrink: 0; }
        .item-date .day { font-size: 1.1rem; font-weight: 800; }
        .item-date .month { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; margin-top: 2px; }
        
        .item-info { flex: 1; }
        .item-info h4 { margin: 0 0 2px; font-size: 1rem; color: #fff; }
        .item-info p { margin: 0; font-size: 0.75rem; color: var(--pashu-text-muted); }

        .done-btn { background: rgba(16, 185, 129, 0.1); color: #10b981; border: none; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .done-btn:hover { background: #10b981; color: #fff; }

        /* Animal Cards Grid */
        .animals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; max-height: 800px; }
        .pashu-card.animal { background: rgba(255,255,255,0.03); border: 1px solid var(--pashu-border-glass); border-radius: 24px; padding: 1.5rem; position: relative; transition: all 0.3s ease; }
        .pashu-card.animal:hover { background: rgba(255,255,255,0.05); transform: translateY(-5px); border-color: var(--pashu-primary); }
        
        .animal-avatar-premium { font-size: 2.5rem; margin-bottom: 1.25rem; }
        .animal-details h3 { margin: 0 0 0.75rem; font-size: 1.2rem; color: #fff; }
        .detail-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
        .tag-pill { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 0.25rem 0.6rem; border-radius: 6px; background: rgba(255,255,255,0.05); color: var(--pashu-text-muted); border: 1px solid rgba(255,255,255,0.05); }
        .tag-pill.name { color: var(--pashu-primary); background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.2); }
        .tag-pill.id { color: #8b5cf6; background: rgba(139, 92, 246, 0.1); border-color: rgba(139, 92, 246, 0.2); }
        .detail-phone { font-size: 0.8rem; color: var(--pashu-text-muted); display: flex; align-items: center; gap: 6px; }

        .pashu-btn-icon { background: none; border: none; color: var(--pashu-text-muted); cursor: pointer; padding: 8px; border-radius: 8px; transition: 0.2s; position: absolute; top: 1rem; right: 1rem; }
        .pashu-btn-icon.danger:hover { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

        /* --- Table Styling --- */
        .pashu-responsive-table { overflow-x: auto; margin: 0 -2rem; padding: 0 2rem; }
        .pashu-modern-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 800px; }
        .pashu-modern-table th { text-align: left; padding: 1.25rem 1rem; color: var(--pashu-text-muted); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--pashu-border-glass); }
        .pashu-modern-table td { padding: 1.25rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
        .pashu-modern-table tr:hover td { background: rgba(255,255,255,0.02); }
        
        .date-cell { display: flex; flex-direction: column; }
        .main-date { font-weight: 700; color: #fff; }
        .time-sub { font-size: 0.7rem; color: var(--pashu-text-muted); }
        
        .owner-pashu-cell { display: flex; flex-direction: column; }
        .owner-pashu-cell .owner { font-weight: 700; color: #fff; }
        .owner-pashu-cell .animal { font-size: 0.75rem; color: var(--pashu-primary); }
        
        .pashu-badge-type { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 8px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; }
        .pashu-badge-type.ilaj { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
        .pashu-badge-type.tika { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
        .pashu-badge-type.check-up { background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); }
        
        .diag-text, .med-text { font-size: 0.85rem; color: rgba(255,255,255,0.7); max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .fee-cell { font-weight: 800; color: var(--pashu-primary); font-size: 1rem; }

        /* --- Reminder Premium Cards --- */
        .pashu-reminder-card-premium { background: var(--pashu-bg-glass); border: 1px solid var(--pashu-border-glass); border-radius: 28px; padding: 2rem; position: relative; transition: all 0.3s; display: flex; flex-direction: column; gap: 1.5rem; }
        .pashu-reminder-card-premium:hover { transform: translateY(-5px); border-color: var(--pashu-accent); box-shadow: 0 15px 35px -10px rgba(245, 158, 11, 0.2); }
        .pashu-reminder-card-premium.overdue { border-color: #ef4444; }
        
        .card-top { display: flex; justify-content: space-between; align-items: center; }
        .icon-box { width: 50px; height: 50px; border-radius: 16px; background: rgba(245, 158, 11, 0.1); color: #f59e0b; display: flex; align-items: center; justify-content: center; }
        .pashu-reminder-card-premium.overdue .icon-box { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        
        .card-status { font-size: 0.65rem; font-weight: 900; letter-spacing: 1px; color: #f59e0b; padding: 4px 10px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; }
        .pashu-reminder-card-premium.overdue .card-status { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
        
        .card-body h3 { margin: 0 0 4px; font-size: 1.3rem; color: #fff; }
        .card-body p { margin: 0 0 1rem; font-size: 0.85rem; color: var(--pashu-text-muted); font-weight: 600; }
        .card-detail { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 8px; }
        .card-detail strong { color: #fff; }

        .card-footer { margin-top: auto; border-top: 1px solid var(--pashu-border-glass); padding-top: 1.25rem; }
        .action-link { background: none; border: none; color: var(--pashu-primary); font-weight: 700; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s; padding: 0; }
        .action-link:hover { gap: 10px; color: #fff; }

        /* --- Management Header --- */
        .management-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1.5rem; }
        .pashu-search-box { position: relative; flex: 1; max-width: 500px; }
        .pashu-search-box svg { position: absolute; left: 1.25rem; top: 50%; transform: translateY(-50%); color: var(--pashu-text-muted); pointer-events: none; }
        .pashu-search-box input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--pashu-border-glass); padding: 1rem 1rem 1rem 3.5rem; border-radius: 100px; color: white; outline: none; transition: 0.2s; font-family: inherit; }
        .pashu-search-box input:focus { border-color: var(--pashu-primary); background: rgba(255,255,255,0.08); }

        /* --- Empty States --- */
        .pashu-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; color: var(--pashu-text-muted); text-align: center; }
        .pashu-empty-state.large { padding: 5rem 2rem; background: rgba(255,255,255,0.01); border: 2px dashed var(--pashu-border-glass); border-radius: 32px; }
        .pashu-empty-state svg { opacity: 0.15; margin-bottom: 1.5rem; }
        .pashu-empty-state h3 { color: #fff; margin-bottom: 0.5rem; }

        .pashu-loader-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; color: var(--pashu-text-muted); }
        .pashu-loader { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.05); border-top-color: var(--pashu-primary); border-radius: 50%; animation: pashuRotate 1s linear infinite; margin-bottom: 1rem; }
        @keyframes pashuRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* --- Mobile Overrides --- */
        @media (max-width: 1024px) {
          .pashu-grid-layout { grid-template-columns: 1fr; }
          .pashu-grid-layout.reverse { grid-template-columns: 1fr; flex-direction: column-reverse; display: flex; }
          .pashu-grid-layout.full { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
          .side-form { order: -1; }
        }

        @media (max-width: 768px) {
          .pashu-container { padding: 1rem; }
          .pashu-hero { padding: 2rem; border-radius: 24px; text-align: center; flex-direction: column; }
          .hero-content { max-width: 100%; }
          .pashu-hero h1 { font-size: 2.2rem; }
          .hero-actions { flex-direction: column; }
          .pashu-stats-container { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
          .stat-card-glass { padding: 1.25rem; flex-direction: column; text-align: center; }
          .stat-val { font-size: 1.5rem; }
          .pashu-hero p { font-size: 0.95rem; margin-bottom: 1.5rem; }
          .management-header { flex-direction: column; align-items: stretch; }
          .pashu-modern-table th, .pashu-modern-table td { padding: 1rem 0.75rem; font-size: 0.8rem; }
        }

        @media (max-width: 480px) {
          .pashu-stats-container { grid-template-columns: 1fr; }
          .pashu-form-row { grid-template-columns: 1fr; }
          .pashu-tab-item { padding: 0.6rem 1rem; font-size: 0.8rem; }
          .pashu-tab-item span { display: none; }
          .pashu-tab-item svg { margin: 0; }
        }
      `}} />
    </div>

  );
};

export default PashuSaathi;
