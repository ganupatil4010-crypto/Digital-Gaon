import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Stars, PlusCircle } from 'lucide-react';
import API_BASE_URL from '../config/api';

const MyListings = () => {
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '', price: '', category: '', location: '', description: ''
  });

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem('userEmail') || 'guest@example.com';
      const response = await axios.get(`${API_BASE_URL}/api/products/my?email=${encodeURIComponent(email)}`);
      setUserProducts(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching my products:', err);
      setError('Failed to load your products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const email = localStorage.getItem('userEmail') || 'guest@example.com';
      await axios.delete(`${API_BASE_URL}/api/products/${productId}`, {
        data: { email }
      });
      setUserProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setEditFormData({
      title: product.title,
      price: product.price,
      category: product.category,
      location: product.location,
      description: product.description || ''
    });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const email = localStorage.getItem('userEmail') || 'guest@example.com';
      const response = await axios.put(`${API_BASE_URL}/api/products/${editingProduct._id}`, {
        ...editFormData,
        email
      });
      
      setUserProducts(prev => prev.map(p => p._id === editingProduct._id ? response.data.product : p));
      setEditingProduct(null);
    } catch (err) {
      console.error('Error editing product:', err);
      alert('Failed to update product');
    }
  };

  if (loading) {
    return (
      <div className="listings-page">
        <h1 className="page-title">My Products</h1>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading your products...
        </div>
      </div>
    );
  }

  return (
    <div className="listings-page" style={{ position: 'relative' }}>
      <h1 className="page-title">My Products</h1>
      
      {error && (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--error)', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="auth-card" style={{ width: '100%', maxWidth: '500px', margin: '1rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <Pencil size={24} color="var(--primary)" />
              Edit "{editingProduct.title}"
            </h2>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input className="form-input" name="title" value={editFormData.title} onChange={handleEditChange} placeholder="Title" required />
              <input className="form-input" name="price" value={editFormData.price} onChange={handleEditChange} placeholder="Price" required />
              <input className="form-input" name="category" value={editFormData.category} onChange={handleEditChange} placeholder="Category" required />
              <input className="form-input" name="location" value={editFormData.location} onChange={handleEditChange} placeholder="Location" required />
              <textarea className="form-textarea" name="description" value={editFormData.description} onChange={handleEditChange} placeholder="Description" rows="3"></textarea>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                <button type="button" className="btn" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} onClick={() => setEditingProduct(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card-grid">
        {userProducts.map(product => (
          <div key={product._id} className="product-card">
            <div style={{ position: 'relative' }}>
              <img src={product.img || 'https://images.unsplash.com/photo-1592982537447-6f23b3793f77?auto=format&fit=crop&q=80&w=400'} alt={product.title} className="product-img" />
              <span className={`badge badge-active`} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                Active
              </span>
            </div>
            <div className="product-info">
              <div className="product-price">₹{product.price}</div>
              <div className="product-title">{product.title}</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  onClick={() => handleEditClick(product)}
                >
                  <Pencil size={14} /> Edit
                </button>
                <button 
                  className="btn btn-danger" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  onClick={() => handleDelete(product._id)}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        <div style={{ 
          border: '2px dashed var(--glass-border)', 
          borderRadius: 'var(--radius-md)', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem',
          minHeight: '300px',
          cursor: 'pointer',
          transition: 'var(--transition)'
        }} className="add-card-placeholder">
           <div style={{ 
             width: '60px', 
             height: '60px', 
             borderRadius: '50%', 
             background: 'rgba(255, 255, 255, 0.05)', 
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center',
             marginBottom: '1rem'
           }}>
             <Stars size={30} color="var(--primary)" />
           </div>
           <div style={{ fontWeight: '600' }}>Add New Item</div>
           <p style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem' }}>Ready to sell something else?</p>
        </div>
      </div>
    </div>
  );
};

export default MyListings;
