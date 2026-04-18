import React from 'react';
import { X, MapPin, Phone, User, Tag, ShieldCheck } from 'lucide-react';

const ProductDetailModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '1rem', backdropFilter: 'blur(10px)'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        backgroundColor: 'var(--card-bg)', 
        borderRadius: 'var(--radius-lg)',
        width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        border: '1px solid var(--glass-border)',
        animation: 'cardEnter 0.4s ease-out',
        display: 'flex', flexDirection: 'column',
        position: 'relative' // Added for absolute positioning of child close button
      }}>
        {/* Close Button - Moved to top level of container with high z-index */}
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute', 
            top: '15px', 
            right: '15px', 
            background: 'rgba(0,0,0,0.5)', 
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--glass-border)', 
            borderRadius: '50%', 
            width: '40px', 
            height: '40px',
            color: 'white', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 100, // Ensure it's above the image and gradient
            transition: 'var(--transition)',
            pointerEvents: 'auto'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--error)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Image Section */}
        <div style={{ position: 'relative' }}>
          <img src={product.img} alt={product.title} style={{ 
            width: '100%', height: '320px', objectFit: 'cover', 
            borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)'
          }} />
          <div style={{ 
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 40%, var(--bg) 105%)',
            pointerEvents: 'none'
          }}></div>
          
          {/* Title overlaying image */}
          <div style={{ position: 'absolute', bottom: '20px', left: '25px', right: '25px' }}>
            <div style={{ display: 'inline-flex', padding: '4px 10px', background: 'rgba(139, 92, 246, 0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '99px', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '8px', alignItems: 'center', gap: '4px' }}>
              <Tag size={12} /> {product.category}
            </div>
            <h2 className="modal-title" style={{ fontSize: '2rem', fontWeight: '700', color: '#fff', margin: '0 0 5px 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{product.title}</h2>
          </div>
        </div>
        
        {/* Details Section */}
        <div className="modal-content-inner" style={{ padding: '25px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>
                <MapPin size={16} color="var(--primary)" /> {product.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)' }}>
                <ShieldCheck size={16} /> Verified Listing
              </span>
            </div>
            <div className="modal-price" style={{ fontSize: '2.2rem', fontWeight: '800', background: 'linear-gradient(135deg, #fff, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ₹{product.price}
            </div>
          </div>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text)', fontWeight: '600' }}>Description</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1.05rem' }}>{product.description || 'No description provided by the seller.'}</p>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.02)', 
            padding: '1.5rem', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--glass-border)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Glow effect inside seller card */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '100px', height: '100px', background: 'var(--primary)', filter: 'blur(60px)', opacity: '0.2', pointerEvents: 'none' }}></div>
            
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="var(--primary)" /> Seller Identity
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.1))', border: '1px solid rgba(139, 92, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Name</div>
                  <div style={{ fontWeight: '600', color: 'var(--text)', fontSize: '1.1rem' }}>{product.sellerName || 'Anonymous'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.1))', border: '1px solid rgba(139, 92, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={20} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Village / City</div>
                  <div style={{ fontWeight: '600', color: 'var(--text)', fontSize: '1.1rem' }}>{product.sellerVillage || product.location || 'Not specified'}</div>
                </div>
              </div>

              <div style={{ 
                display: 'flex', gap: '12px', alignItems: 'center', gridColumn: '1 / -1', 
                background: 'rgba(16, 185, 129, 0.05)', padding: '15px', 
                borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.15)',
                marginTop: '0.5rem'
              }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={20} color="var(--success)" />
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Mobile Number</div>
                    <div style={{ fontWeight: '600', color: 'var(--text)', fontSize: '1.3rem', letterSpacing: '1px' }}>{product.sellerPhone || 'Not provided'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn" 
                      style={{ padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }} 
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    {product.sellerPhone && (
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.6rem 1.2rem', gap: '8px', background: 'var(--success)' }} 
                        onClick={() => window.open(`tel:${product.sellerPhone}`)}
                      >
                        <Phone size={16} fill="currentColor" /> Call Seller
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
