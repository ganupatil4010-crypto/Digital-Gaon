import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, ShoppingBag } from 'lucide-react';
import API_BASE_URL from '../config/api';

const Wishlist = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const email = localStorage.getItem('userEmail') || 'guest@example.com';

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/user/wishlist?email=${encodeURIComponent(email)}`);
      setSavedItems(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/user/wishlist`, {
        data: { email, productId }
      });
      setSavedItems(prev => prev.filter(item => item._id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="wishlist-page">
        <h1 className="page-title">My Wishlist</h1>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading your wishlist...
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <h1 className="page-title">My Wishlist</h1>
      
      {savedItems.length > 0 ? (
        <div className="card-grid">
          {savedItems.map(item => (
            <div key={item._id} className="product-card">
              <img src={item.img || 'https://images.unsplash.com/photo-1592982537447-6f23b3793f77?auto=format&fit=crop&q=80&w=400'} alt={item.title} className="product-img" />
              <div className="product-info">
                <div className="product-price">₹{item.price}</div>
                <div className="product-title">{item.title}</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                   <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem' }}>View Details</button>
                   <button 
                     className="btn btn-danger" 
                     style={{ padding: '0.5rem', borderRadius: '50%', flex: '0 0 40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                     onClick={() => handleRemove(item._id)}
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="auth-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'rgba(255, 255, 255, 0.05)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <ShoppingBag size={40} color="var(--primary)" />
          </div>
          <h3>Your wishlist is empty</h3>
          <p>Explore the market and save items you like!</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Start Shopping</button>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
