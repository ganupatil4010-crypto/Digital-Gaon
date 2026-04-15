import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Camera, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import API_BASE_URL from '../config/api';

const AddProduct = () => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    description: '',
    location: '',
    img: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData({ ...formData, img: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange({ target: { files: [file] } });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const email = localStorage.getItem('userEmail') || 'guest@example.com';
      const payload = { ...formData, sellerEmail: email };
      
      const response = await axios.post(`${API_BASE_URL}/api/products`, payload);
      setMessage('Product added successfully!');
      
      // Reset form
      setFormData({
        title: '',
        price: '',
        category: '',
        description: '',
        location: '',
        img: '',
      });
      setPreview(null);
    } catch (error) {
      console.error('Error adding product', error);
      setMessage('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <h1 className="page-title">Sell Your Product</h1>
      
      <div className="auth-card" style={{ maxWidth: '800px', margin: '0' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <div className="form-group">
                <label>Product Title</label>
                <input 
                  className="form-input" 
                  placeholder="What are you selling?" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Price (₹)</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. 500" 
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select 
                  className="form-select"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Farming Equipment">Farming Equipment</option>
                  <option value="Crops / Seeds">Crops / Seeds</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <div className="form-group">
                <label>Village / Location</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. Pune, Warud" 
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="form-textarea" 
                  rows="5" 
                  placeholder="Tell buyers more about your item..."
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Upload Images</label>
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div 
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              style={{ 
                border: '2px dashed var(--glass-border)', 
                borderRadius: 'var(--radius-md)', 
                padding: preview ? '1rem' : '2.5rem', 
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
            >
              {preview ? (
                <div style={{ position: 'relative', width: '100%', maxWidth: '200px' }}>
                  <img 
                    src={preview} 
                    alt="Preview" 
                    style={{ width: '100%', borderRadius: 'var(--radius-sm)', objectFit: 'cover', maxHeight: '150px' }} 
                  />
                  <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Click to change image</div>
                </div>
              ) : (
                <>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '50%', 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <Camera size={24} color="var(--primary)" />
                  </div>
                  <div style={{ fontWeight: '500' }}>Click to Upload or Drag & Drop</div>
                  <p style={{ fontSize: '0.75rem', marginBottom: 0 }}>Supported: JPG, PNG, WEBP (Max 2MB)</p>
                </>
              )}
            </div>
          </div>

          {message && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: message.includes('successfully') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${message.includes('successfully') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: message.includes('successfully') ? 'var(--success)' : 'var(--error)' 
            }}>
              {message.includes('successfully') ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {message}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem', gap: '0.5rem' }}>
            {loading ? (
              'Submitting...'
            ) : (
              <>
                <Upload size={20} />
                Submit Listing
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
