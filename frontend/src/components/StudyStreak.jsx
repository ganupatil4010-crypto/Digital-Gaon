import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import API_BASE_URL from '../config/api';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function toMidnight(date) { const d = new Date(date); d.setHours(0,0,0,0); return d; }
function dateKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function computeStreaks(entryMap) {
  const today = toMidnight(new Date());
  let current = 0, longest = 0, tempStreak = 0, consecutiveMissed = 0;
  const days = Array.from({length:365},(_,i)=>{ const d=new Date(today); d.setDate(today.getDate()-i); return d; });
  for(let i=0;i<days.length;i++){
    const e=entryMap[dateKey(days[i])];
    if(e&&(e.status==='completed'||e.status==='partial')) current++;
    else if(i===0) continue;
    else break;
  }
  for(let i=days.length-1;i>=0;i--){
    const e=entryMap[dateKey(days[i])];
    if(e&&(e.status==='completed'||e.status==='partial')){ tempStreak++; longest=Math.max(longest,tempStreak); }
    else tempStreak=0;
  }
  for(let i=1;i<days.length;i++){
    const e=entryMap[dateKey(days[i])];
    if(!e||e.status==='missed') consecutiveMissed++;
    else break;
  }
  return {current,longest,consecutiveMissed};
}
function computeWeekly(entryMap){
  const today=toMidnight(new Date()); let s=0,m=0;
  for(let i=0;i<7;i++){
    const d=new Date(today); d.setDate(today.getDate()-i);
    const e=entryMap[dateKey(d)];
    if(e&&(e.status==='completed'||e.status==='partial')) s++;
    else if(i>0) m++;
  }
  return {studyDays:s,missedDays:m};
}
function getBadges(longest){
  const b=[];
  if(longest>=7)  b.push({id:'w',icon:'🏅',label:'Weekly Streak',desc:'7-day streak!'});
  if(longest>=15) b.push({id:'c',icon:'🎓',label:'Consistent Learner',desc:'15-day streak!'});
  if(longest>=30) b.push({id:'m',icon:'👑',label:'Master Habit',desc:'30-day streak!'});
  return b;
}
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ─── COMPONENT ───────────────────────────────────────────────────────────────
const StudyStreak = ({ userEmail }) => {
  const [entryMap, setEntryMap] = useState({});
  const [loading,   setLoading]   = useState(true);
  const [submitting,setSubmitting]= useState(false);
  const [topic,     setTopic]     = useState('');
  const [duration,  setDuration]  = useState('');
  const [msg,       setMsg]       = useState({text:'',type:''});
  const [calMonth,  setCalMonth]  = useState(new Date().getMonth());
  const [calYear,   setCalYear]   = useState(new Date().getFullYear());
  const [downloading, setDownloading] = useState(false);
  const email = userEmail || localStorage.getItem('userEmail');

  const fetchEntries = useCallback(async()=>{
    if(!email) return;
    try{
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/study/entries?email=${encodeURIComponent(email)}`);
      const map={};
      res.data.forEach(e=>{ map[dateKey(e.date)]=e; });
      setEntryMap(map);
    }catch(e){ console.error(e); }
    finally{ setLoading(false); }
  },[email]);

  useEffect(()=>{ fetchEntries(); },[fetchEntries]);

  const handleSubmit = async(e)=>{
    e.preventDefault();
    if(!topic.trim()){ setMsg({text:'Please write what you studied.',type:'err'}); return; }
    const dur=parseInt(duration,10);
    if(isNaN(dur)||dur<0){ setMsg({text:'Enter a valid duration.',type:'err'}); return; }
    setSubmitting(true); setMsg({text:'',type:''});
    try{
      await axios.post(`${API_BASE_URL}/api/study/log`,{userEmail:email,topic:topic.trim(),duration:dur});
      setTopic(''); setDuration('');
      setMsg({text: dur>=20?'✅ Completed! Great work!':dur>0?'⚠️ Partial. Aim for 20+ min tomorrow!':'Logged.', type:'ok'});
      fetchEntries();
    }catch{ setMsg({text:'Failed to save. Check if backend is running.',type:'err'}); }
    finally{ setSubmitting(false); }
  };

  // ── Monthly Report Download (PDF) ──
  const handleDownload = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const today = new Date().toLocaleDateString('en-IN');
      const monthName = MONTHS[calMonth];

      // Compute month stats
      let completed = 0, partial = 0, missed = 0;
      for (let i = 1; i <= daysInMonth; i++) {
        const s = getDayStatus(i);
        if (s === 'completed') completed++;
        else if (s === 'partial') partial++;
        else if (s === 'missed') missed++;
      }

      // Header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 48, 'F');
      doc.setFontSize(22);
      doc.setTextColor(139, 92, 246);
      doc.text('Study Streak', 14, 17);
      doc.setFontSize(12);
      doc.setTextColor(156, 163, 175);
      doc.text(`Monthly Report — ${monthName} ${calYear}`, 14, 27);
      doc.text(`Generated: ${today}`, pageWidth - 14, 27, { align: 'right' });

      // Stats bar
      doc.setFontSize(11);
      doc.setTextColor(52, 211, 153);
      doc.text(`Completed: ${completed}`, 14, 40);
      doc.setTextColor(251, 191, 36);
      doc.text(`Partial: ${partial}`, 70, 40);
      doc.setTextColor(248, 113, 113);
      doc.text(`Missed: ${missed}`, 110, 40);
      doc.setTextColor(251, 146, 60);
      doc.text(`Current Streak: ${current} days`, 148, 40);

      // Table Header
      let y = 58;
      doc.setFillColor(30, 41, 59);
      doc.rect(10, y - 6, pageWidth - 20, 10, 'F');
      doc.setFontSize(10);
      doc.setTextColor(167, 139, 250);
      doc.text('Date', 14, y);
      doc.text('Day', 55, y);
      doc.text('Topic Studied', 80, y);
      doc.text('Duration', 155, y);
      doc.text('Status', 182, y);

      // Rows for each day in month
      y += 8;
      for (let i = 1; i <= daysInMonth; i++) {
        if (y > 272) { doc.addPage(); y = 20; }
        const d = new Date(calYear, calMonth, i);
        const key = dateKey(d);
        const entry = entryMap[key];
        const status = getDayStatus(i);
        const dayName = DAYS[d.getDay()];

        doc.setFillColor(...(i % 2 === 0 ? [17, 24, 39] : [22, 33, 55]));
        doc.rect(10, y - 5, pageWidth - 20, 9, 'F');
        doc.setFontSize(8.5);
        doc.setTextColor(249, 250, 251);
        doc.text(`${String(i).padStart(2,'0')} ${monthName.substring(0,3)}`, 14, y);
        doc.setTextColor(156, 163, 175);
        doc.text(dayName, 55, y);
        doc.setTextColor(249, 250, 251);
        if (entry) {
          const topic = entry.topic.length > 32 ? entry.topic.substring(0, 32) + '...' : entry.topic;
          doc.text(topic, 80, y);
          doc.text(`${entry.duration} min`, 155, y);
        } else {
          doc.setTextColor(100, 116, 139);
          doc.text('—', 80, y);
          doc.text('—', 155, y);
        }
        if (status === 'completed') { doc.setTextColor(52, 211, 153); doc.text('Completed', 182, y); }
        else if (status === 'partial') { doc.setTextColor(251, 191, 36); doc.text('Partial', 182, y); }
        else if (status === 'missed') { doc.setTextColor(248, 113, 113); doc.text('Missed', 182, y); }
        else { doc.setTextColor(100, 116, 139); doc.text('—', 182, y); }
        y += 9;
      }

      // Badges section
      if (badges.length > 0) {
        if (y > 250) { doc.addPage(); y = 20; }
        y += 6;
        doc.setFontSize(11);
        doc.setTextColor(251, 191, 36);
        doc.text('Badges Earned:', 14, y);
        y += 8;
        badges.forEach(b => {
          doc.setFontSize(9);
          doc.setTextColor(249, 250, 251);
          doc.text(`${b.icon}  ${b.label} — ${b.desc}`, 18, y);
          y += 8;
        });
      }

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Digital Gaon — Study Streak', 14, 290);
        doc.text(`Page ${p} of ${totalPages}`, pageWidth - 14, 290, { align: 'right' });
      }

      doc.save(`study-report-${monthName}-${calYear}.pdf`);
    } catch (e) {
      console.error(e);
      alert('PDF generation failed.');
    } finally {
      setDownloading(false);
    }
  };

  const {current,longest,consecutiveMissed}=computeStreaks(entryMap);
  const {studyDays,missedDays}=computeWeekly(entryMap);
  const badges=getBadges(longest);
  const todayKey=dateKey(new Date());
  const todayEntry=entryMap[todayKey];
  const today=toMidnight(new Date());
  const firstDay=new Date(calYear,calMonth,1).getDay();
  const daysInMonth=new Date(calYear,calMonth+1,0).getDate();

  const getDayStatus=(day)=>{
    const d=new Date(calYear,calMonth,day);
    const e=entryMap[dateKey(d)];
    if(e) return e.status;
    if(d<today) return 'missed';
    return 'future';
  };

  const ss={
    wrap:{ padding:'0 0 3rem', maxWidth:1100, margin:'0 auto', fontFamily:"'Outfit',sans-serif" },
    // Header
    hdr:{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem', marginBottom:'1.5rem' },
    h1:{ fontSize:'2rem', fontWeight:800, margin:0, background:'linear-gradient(135deg,#fff 30%,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' },
    sub:{ color:'rgba(255,255,255,0.5)', fontSize:'0.9rem', marginTop:4 },
    fireBadge:{ display:'flex', alignItems:'center', gap:6, background:'linear-gradient(135deg,rgba(251,146,60,0.15),rgba(239,68,68,0.08))', border:'1px solid rgba(251,146,60,0.3)', borderRadius:999, padding:'0.5rem 1.2rem', whiteSpace:'nowrap' },
    fireNum:{ fontSize:'1.6rem', fontWeight:900, color:'#fb923c' },
    fireLbl:{ fontSize:'0.78rem', color:'rgba(255,255,255,0.5)' },
    // Warning
    warn:{ display:'flex', alignItems:'center', gap:10, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:12, padding:'0.875rem 1.25rem', color:'#fca5a5', marginBottom:'1.25rem', fontSize:'0.9rem' },
    // Stats
    statsRow:{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' },
    statCard:(accent)=>({ background:'rgba(17,24,39,0.75)', border:`1px solid ${accent}`, borderRadius:16, padding:'1.25rem 0.75rem', textAlign:'center', backdropFilter:'blur(16px)', transition:'transform 0.2s' }),
    statIcon:{ fontSize:'1.5rem', marginBottom:4 },
    statVal:(color)=>({ fontSize:'2rem', fontWeight:900, color, lineHeight:1 }),
    statLbl:{ fontSize:'0.72rem', color:'rgba(255,255,255,0.45)', marginTop:6, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase' },
    // Grid
    mainGrid:{ display:'grid', gridTemplateColumns:'1fr 370px', gap:'1.5rem', alignItems:'start', width:'100%' },
    // Cards
    card:{ background:'rgba(17,24,39,0.75)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:24, padding:'1.5rem', backdropFilter:'blur(20px)' },
    // Calendar
    calHdr:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' },
    calMonth:{ fontSize:'1.1rem', fontWeight:700 },
    navBtn:{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', width:34, height:34, borderRadius:10, cursor:'pointer', fontSize:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.2s' },
    calDayNames:{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:3 },
    calDayName:{ textAlign:'center', fontSize:'0.65rem', fontWeight:700, color:'rgba(255,255,255,0.35)', padding:'4px 0', textTransform:'uppercase', letterSpacing:'0.04em' },
    calGrid:{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 },
    calDayBase:{ aspectRatio:'1', borderRadius:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'1px solid transparent', minHeight:40, transition:'transform 0.15s' },
    calDayNum:{ fontSize:'0.72rem', fontWeight:700, lineHeight:1 },
    calIcon:{ fontSize:'0.6rem', lineHeight:1 },
    // Legend
    legend:{ display:'flex', gap:'1rem', marginTop:'1.25rem', justifyContent:'center', flexWrap:'wrap' },
    legendItem:{ display:'flex', alignItems:'center', gap:5, fontSize:'0.75rem', color:'rgba(255,255,255,0.45)' },
    dot:(c)=>({ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block' }),
    // Right panel
    rPanel:{ display:'flex', flexDirection:'column', gap:'1.25rem' },
    // Form
    formTitle:{ fontSize:'1rem', fontWeight:700, marginBottom:'1rem' },
    todayNotice:{ background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.2)', borderRadius:10, padding:'0.65rem 0.9rem', fontSize:'0.82rem', color:'rgba(255,255,255,0.6)', marginBottom:'0.9rem', display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' },
    label:{ display:'block', fontSize:'0.82rem', fontWeight:600, color:'rgba(255,255,255,0.55)', marginBottom:6 },
    textarea:{ width:'100%', padding:'0.75rem 1rem', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, color:'#fff', fontFamily:"'Outfit',sans-serif", fontSize:'0.95rem', resize:'vertical', minHeight:60, maxHeight:100, outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' },
    numInput:{ width:110, padding:'0.75rem 1rem', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, color:'#fff', fontFamily:"'Outfit',sans-serif", fontSize:'0.95rem', outline:'none', transition:'border-color 0.2s' },
    durRow:{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' },
    hint:{ fontSize:'0.78rem', fontWeight:700, color:'rgba(255,255,255,0.5)' },
    goalNote:{ fontSize:'0.72rem', color:'rgba(255,255,255,0.35)', marginTop:4 },
    formErr:{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#fca5a5', borderRadius:10, padding:'0.55rem 0.85rem', fontSize:'0.83rem', marginBottom:'0.75rem' },
    formOk:{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', color:'#6ee7b7', borderRadius:10, padding:'0.55rem 0.85rem', fontSize:'0.83rem', marginBottom:'0.75rem' },
    submitBtn:(dis)=>({ width:'100%', padding:'0.9rem', background: dis?'rgba(139,92,246,0.4)':'linear-gradient(135deg,#8b5cf6,#6366f1)', color:'#fff', border:'none', borderRadius:14, fontSize:'1rem', fontWeight:700, cursor: dis?'not-allowed':'pointer', transition:'all 0.25s', fontFamily:"'Outfit',sans-serif", marginTop:8, letterSpacing:'0.01em', boxShadow: dis?'none':'0 4px 20px -4px rgba(139,92,246,0.5)' }),
    // Badges
    noBadge:{ textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:'0.88rem', padding:'0.5rem 0 1rem' },
    badgePreviews:{ display:'flex', gap:8, justifyContent:'center' },
    badgePreview:{ background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.08)', borderRadius:12, padding:'0.65rem 0.9rem', textAlign:'center', fontSize:'1.4rem', minWidth:60, filter:'grayscale(1)', opacity:0.4 },
    badgeList:{ display:'flex', flexDirection:'column', gap:'0.65rem' },
    badgeItem:{ display:'flex', alignItems:'center', gap:12, padding:'0.8rem 0.9rem', background:'linear-gradient(135deg,rgba(251,191,36,0.07),rgba(251,146,60,0.04))', border:'1px solid rgba(251,191,36,0.2)', borderRadius:14 },
    badgeIconBig:{ fontSize:'1.8rem', flexShrink:0 },
    badgeName:{ fontWeight:700, fontSize:'0.9rem' },
    badgeDesc:{ fontSize:'0.73rem', color:'rgba(255,255,255,0.45)', marginTop:2 },
    nextHint:{ textAlign:'center', fontSize:'0.75rem', color:'rgba(255,255,255,0.35)', paddingTop:'0.75rem', borderTop:'1px solid rgba(255,255,255,0.06)', marginTop:4 },
    // Spinner
    spinnerWrap:{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(3,7,18,0.5)', backdropFilter:'blur(4px)', borderRadius:24, gap:12, zIndex:10, color:'rgba(255,255,255,0.5)', fontSize:'0.9rem' },
    pill:(color,bg)=>({ borderRadius:999, padding:'0.15rem 0.55rem', fontSize:'0.72rem', fontWeight:700, color, background:bg }),
  };

  const calDayStyle=(status,isToday)=>{
    const base={...ss.calDayBase};
    if(status==='completed') { base.background='rgba(16,185,129,0.13)'; base.borderColor='rgba(16,185,129,0.3)'; }
    else if(status==='partial') { base.background='rgba(251,191,36,0.1)'; base.borderColor='rgba(251,191,36,0.28)'; }
    else if(status==='missed') { base.background='rgba(239,68,68,0.07)'; base.borderColor='rgba(239,68,68,0.18)'; }
    else { base.background='rgba(255,255,255,0.02)'; base.borderColor='rgba(255,255,255,0.04)'; }
    if(isToday) { base.borderColor='#8b5cf6'; base.boxShadow='0 0 0 1px #8b5cf6'; }
    return base;
  };

  const numColor={completed:'#34d399',partial:'#fbbf24',missed:'#f87171',future:'rgba(255,255,255,0.35)'};

  const prevMonth=()=>{ if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1); };
  const nextMonth=()=>{ if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1); };

  return (
    <div style={ss.wrap}>
      {/* ── Header ── */}
      <div style={ss.hdr}>
        <div>
          <h1 style={ss.h1}>📚 Study Streak</h1>
          <p style={ss.sub}>Build the habit of daily learning</p>
        </div>
        <div style={ss.fireBadge}>
          <span style={{fontSize:'1.4rem'}}>🔥</span>
          <span style={ss.fireNum}>{current}</span>
          <span style={ss.fireLbl}>day streak</span>
        </div>
      </div>

      {/* ── Warning ── */}
      {consecutiveMissed>=2&&(
        <div style={ss.warn}>
          <span style={{fontSize:'1.2rem',flexShrink:0}}>⚠️</span>
          <span>You've missed <strong style={{color:'#fca5a5'}}>{consecutiveMissed} days</strong> in a row. Start again today to keep learning!</span>
        </div>
      )}

      {/* ── Stats Row ── */}
      <div className="ss-stats-row" style={ss.statsRow}>
        {[
          {icon:'🔥',val:current, color:'#34d399',accent:'rgba(16,185,129,0.2)',lbl:'Current Streak'},
          {icon:'🏆',val:longest, color:'#fbbf24',accent:'rgba(251,191,36,0.2)',lbl:'Best Streak'},
          {icon:'📅',val:studyDays,color:'#818cf8',accent:'rgba(99,102,241,0.2)',lbl:'Study Days (7d)'},
          {icon:'❌',val:missedDays,color:'#f87171',accent:'rgba(239,68,68,0.2)',lbl:'Missed (7d)'},
        ].map((s,i)=>(
          <div key={i} style={ss.statCard(s.accent)}>
            <div style={ss.statIcon}>{s.icon}</div>
            <div style={ss.statVal(s.color)}>{s.val}</div>
            <div style={ss.statLbl}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="ss-main-grid" style={ss.mainGrid}>

        {/* ── Calendar ── */}
        <div style={{...ss.card, position:'relative'}}>
          <div style={ss.calHdr}>
            <button style={ss.navBtn} onClick={prevMonth}>‹</button>
            <span style={ss.calMonth}>{MONTHS[calMonth]} {calYear}</span>
            <button style={ss.navBtn} onClick={nextMonth}>›</button>
          </div>
          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{width:'100%',marginBottom:'1rem',padding:'0.6rem',background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#a78bfa',fontWeight:600,fontSize:'0.85rem',cursor:downloading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontFamily:"'Outfit',sans-serif",transition:'all 0.2s'}}
            onMouseEnter={e=>{if(!downloading){e.currentTarget.style.background='rgba(139,92,246,0.2)'}}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(139,92,246,0.1)'}}
          >
            {downloading ? '⏳ Generating PDF...' : '📄 Download Monthly Report (PDF)'}
          </button>

          <div style={ss.calDayNames}>
            {DAYS.map(d=><div key={d} style={ss.calDayName}>{d}</div>)}
          </div>

          <div style={ss.calGrid}>
            {Array.from({length:firstDay},(_,i)=>(
              <div key={`e${i}`} />
            ))}
            {Array.from({length:daysInMonth},(_,i)=>{
              const day=i+1;
              const status=getDayStatus(day);
              const isToday=new Date(calYear,calMonth,day).toDateString()===new Date().toDateString();
              return (
                <div key={day} style={calDayStyle(status,isToday)} title={status}>
                  <span style={{...ss.calDayNum, color:numColor[status]||'#fff'}}>{day}</span>
                  <span style={ss.calIcon}>
                    {status==='completed'?'✅':status==='partial'?'⚠️':status==='missed'?'❌':''}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={ss.legend}>
            {[['#34d399','Completed'],['#fbbf24','Partial'],['#f87171','Missed']].map(([c,l])=>(
              <span key={l} style={ss.legendItem}><span style={ss.dot(c)}/>{l}</span>
            ))}
          </div>

          {loading&&(
            <div style={ss.spinnerWrap}>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <div style={{width:32,height:32,border:'3px solid rgba(139,92,246,0.2)',borderTopColor:'#8b5cf6',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/>
              <span>Loading...</span>
            </div>
          )}
        </div>

        {/* ── Right Panel ── */}
        <div style={ss.rPanel}>

          {/* Form Card */}
          <div style={ss.card}>
            <div style={ss.formTitle}>{todayEntry?'✏️ Update Today\'s Entry':'📝 Log Today\'s Study'}</div>

            {todayEntry&&(
              <div style={ss.todayNotice}>
                <strong style={{color:'#fff'}}>{todayEntry.topic}</strong> — {todayEntry.duration} min
                <span style={todayEntry.status==='completed'?ss.pill('#34d399','rgba(16,185,129,0.15)'):ss.pill('#fbbf24','rgba(251,191,36,0.15)')}>
                  {todayEntry.status==='completed'?'✅ Completed':'⚠️ Partial'}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:0}}>
              <div style={{marginBottom:'1rem'}}>
                <label style={ss.label}>📖 What did you study today?</label>
                <textarea
                  style={ss.textarea}
                  placeholder="e.g. Mathematics – Fractions, Hindi Grammar..."
                  value={topic}
                  onChange={e=>setTopic(e.target.value)}
                  rows={2}
                  maxLength={200}
                  onFocus={e=>e.target.style.borderColor='#8b5cf6'}
                  onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.08)'}
                  required
                />
              </div>

              <div style={{marginBottom:'1rem'}}>
                <label style={ss.label}>⏱️ Study duration (minutes)</label>
                <div style={ss.durRow}>
                  <input
                    type="number"
                    style={ss.numInput}
                    placeholder="e.g. 30"
                    value={duration}
                    onChange={e=>setDuration(e.target.value)}
                    min={0} max={480}
                    onFocus={e=>e.target.style.borderColor='#8b5cf6'}
                    onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.08)'}
                    required
                  />
                  <span style={ss.hint}>
                    {duration>=20?'✅ Will mark Completed':duration>0?'⚠️ Will mark Partial':''}
                  </span>
                </div>
                <p style={ss.goalNote}>🎯 Minimum goal: 10 min/day · 20+ min = Completed</p>
              </div>

              {msg.text&&<div style={msg.type==='err'?ss.formErr:ss.formOk}>{msg.text}</div>}

              <button
                type="submit"
                style={ss.submitBtn(submitting)}
                disabled={submitting}
                onMouseEnter={e=>{ if(!submitting){ e.target.style.transform='translateY(-2px)'; e.target.style.filter='brightness(1.1)'; }}}
                onMouseLeave={e=>{ e.target.style.transform=''; e.target.style.filter=''; }}
              >
                {submitting?'⏳ Saving...':todayEntry?'🔄 Update Entry':'✅ Log Study'}
              </button>
            </form>
          </div>

          {/* Badges Card */}
          <div style={ss.card}>
            <div style={ss.formTitle}>🏆 Your Badges</div>
            {badges.length===0?(
              <>
                <p style={ss.noBadge}>Study daily to earn badges!</p>
                <div style={ss.badgePreviews}>
                  {[['🏅','7d'],['🎓','15d'],['👑','30d']].map(([ic,lb])=>(
                    <div key={lb} style={ss.badgePreview}>{ic}<br/><small style={{fontSize:'0.65rem'}}>{lb}</small></div>
                  ))}
                </div>
              </>
            ):(
              <>
                <div style={ss.badgeList}>
                  {badges.map(b=>(
                    <div key={b.id} style={ss.badgeItem}>
                      <span style={ss.badgeIconBig}>{b.icon}</span>
                      <div>
                        <div style={ss.badgeName}>{b.label}</div>
                        <div style={ss.badgeDesc}>{b.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {longest<30&&(
                  <div style={ss.nextHint}>
                    Next: {longest<7?`🏅 Weekly Streak in ${7-longest} days`:longest<15?`🎓 Consistent Learner in ${15-longest} days`:`👑 Master Habit in ${30-longest} days`}
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>


      {/* Responsive overrides */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
        @media(max-width:900px){
          .ss-main-grid{
            display: grid !important;
            grid-template-columns: 1fr !important;
          }
          .ss-stats-row{
            grid-template-columns: repeat(2,1fr) !important;
          }
        }
        @media(max-width:480px){
          .ss-stats-row{
            grid-template-columns: repeat(2,1fr) !important;
            gap: 0.6rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StudyStreak;
