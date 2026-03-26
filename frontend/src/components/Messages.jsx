import React from 'react';

const Messages = () => {
  const chats = [
    { id: 301, name: 'Rahul Patil', lastMsg: 'Is the tractor still available?', time: '10:30 AM', avatar: 'RP' },
    { id: 302, name: 'Sanjay Deshmukh', lastMsg: 'I can offer ₹5,000 for the pump.', time: 'Yesterday', avatar: 'SD' },
    { id: 303, name: 'Sunita Maushi', lastMsg: 'Sent you 5 photos of the harvest.', time: 'Monday', avatar: 'SM' },
  ];

  return (
    <div className="messages-page">
      <h1 className="page-title">Inquiries & Messages</h1>
      
      <div className="auth-card" style={{ maxWidth: '700px', margin: '0', padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {chats.map(chat => (
            <div key={chat.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.25rem', 
              padding: '1.25rem', 
              borderRadius: 'var(--radius-md)', 
              cursor: 'pointer',
              borderBottom: '1px solid var(--glass-border)',
              transition: 'var(--transition)'
            }} className="chat-item">
              <div style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: '700',
                color: 'var(--primary)'
              }}>
                {chat.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                   <strong style={{ fontSize: '1.05rem' }}>{chat.name}</strong>
                   <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{chat.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                  {chat.lastMsg}
                </p>
              </div>
              <button 
                onClick={() => window.open(`https://wa.me/919999999999?text=Hello%20${chat.name},%20I'm%20interested%20in%20the%20product`)}
                className="btn" 
                style={{ background: '#25D366', color: 'white', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                Chat on WhatsApp
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Messages;
