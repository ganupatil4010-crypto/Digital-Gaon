import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, MapPin, Flame, ArrowRight, Megaphone } from 'lucide-react';
import API_BASE_URL from '../config/api';
import ProductDetailModal from './ProductDetailModal';

const Home = ({ userVillage }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const email = localStorage.getItem('userEmail') || 'guest@example.com';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, wishlistRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/products`),
          axios.get(`${API_BASE_URL}/api/user/wishlist?email=${encodeURIComponent(email)}`)
        ]);
        
        setProducts(productsRes.data);
        setWishlistIds(wishlistRes.data.map(item => item._id));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email]);

  const toggleWishlist = async (productId) => {
    const isInWishlist = wishlistIds.includes(productId);

    try {
      if (isInWishlist) {
        await axios.delete(`${API_BASE_URL}/api/user/wishlist`, {
          data: { email, productId }
        });
        setWishlistIds(prev => prev.filter(id => id !== productId));
      } else {
        await axios.post(`${API_BASE_URL}/api/user/wishlist`, { email, productId });
        setWishlistIds(prev => [...prev, productId]);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  // Logic to separate "Nearby" (matching village) and "Latest"
  const nearbyProducts = userVillage 
    ? products.filter(p => p.location?.toLowerCase().includes(userVillage.toLowerCase())).slice(0, 4)
    : products.slice(0, 4);

  const latestListings = products
    .filter(p => !nearbyProducts.find(n => n._id === p._id))
    .slice(0, 8); 

  const renderProductCard = (product) => (
    <div key={product._id} className="product-card" onClick={() => setSelectedProduct(product)} style={{ cursor: 'pointer' }}>
      <div style={{ position: 'relative' }}>
        <img src={product.img} alt={product.title} className="product-img" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product._id);
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition)',
            backdropFilter: 'blur(4px)',
            color: wishlistIds.includes(product._id) ? '#ef4444' : 'white'
          }}
          title={wishlistIds.includes(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={20} fill={wishlistIds.includes(product._id) ? "#ef4444" : "none"} />
        </button>
      </div>
      <div className="product-info">
        <div className="product-price">₹{product.price}</div>
        <div className="product-title">{product.title}</div>
        <div className="product-meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} />
            {product.location}
          </span>
          <span style={{ color: 'var(--success)', fontWeight: '600' }}>In Stock</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="home-page">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="page-title">Marketplace Overview</h1>
        <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} color="var(--primary)" /> 
          Showing active listings near <strong style={{ color: 'var(--primary)' }}>{userVillage || 'your village'}</strong>
        </p>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 0 }}>Nearby Products</h2>
          <span style={{ fontSize: '0.875rem', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View all <ArrowRight size={16} />
          </span>
        </div>
        
        {loading ? (
          <p>Loading products...</p>
        ) : nearbyProducts.length === 0 ? (
          <p>No products available right now.</p>
        ) : (
          <div className="card-grid">
            {nearbyProducts.map(product => renderProductCard(product))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Latest Listings</h2>
        {latestListings.length > 0 && (
          <div className="card-grid">
            {latestListings.map(product => renderProductCard(product))}
          </div>
        )}
      </div>


      <div className="marketplace-banner" style={{ 
        marginTop: '3rem', 
        padding: '2rem', 
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(0, 0, 0, 0.2))', 
        borderRadius: 'var(--radius-md)', 
        border: '1px solid rgba(239, 68, 68, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div className="banner-content" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: 'rgba(239, 68, 68, 0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Flame size={32} color="#ef4444" />
          </div>
          <div>
            <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Urgent Sales</h3>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Check out products that need to be sold today at high discounts!</p>
          </div>
        </div>
        <button className="btn" style={{ background: '#ef4444', color: 'white' }}>Check Now</button>
      </div>

      <ProductDetailModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  );
};

export default Home;
