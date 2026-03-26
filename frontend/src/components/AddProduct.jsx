import React, { useState } from 'react';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    description: '',
    location: '',
  });

  return (
    <div className="add-product-page">
      <h1 className="page-title">Sell Your Product</h1>
      
      <div className="auth-card" style={{ maxWidth: '800px', margin: '0' }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <div className="form-group">
                <label>Product Title</label>
                <input className="form-input" placeholder="What are you selling?" />
              </div>
              
              <div className="form-group">
                <label>Price (₹)</label>
                <input className="form-input" placeholder="e.g. 500" />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select className="form-select">
                  <option>Select Category</option>
                  <option>Farming Equipment</option>
                  <option>Crops / Seeds</option>
                  <option>Electronics</option>
                  <option>Vehicles</option>
                  <option>Furniture</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <div className="form-group">
                <label>Village / Location</label>
                <input className="form-input" placeholder="e.g. Pune, Warud" />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea className="form-textarea" rows="5" placeholder="Tell buyers more about your item..."></textarea>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Upload Images (Max 5)</label>
            <div style={{ 
              border: '2px dashed var(--glass-border)', 
              borderRadius: 'var(--radius-md)', 
              padding: '2.5rem', 
              textAlign: 'center',
              backgroundColor: 'rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📸</div>
              <div style={{ fontWeight: '500' }}>Click to Upload or Drag & Drop</div>
              <p style={{ fontSize: '0.75rem', marginBottom: 0 }}>Supported: JPG, PNG, WEBP</p>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}>
            Submit Listing
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
