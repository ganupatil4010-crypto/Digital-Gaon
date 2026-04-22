import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, MapPin, Flame, ArrowRight, Tractor, Wheat, Smartphone, Car, Sofa, Grid, PackageSearch, Search, X, Repeat } from 'lucide-react';
import API_BASE_URL from '../config/api';
import ProductDetailModal from './ProductDetailModal';

const CATEGORIES = [
  { label: 'All', value: 'all', icon: Grid },
  { label: 'Gaon Rental Hub', value: 'Gaon Rental Hub', icon: Repeat },
  { label: 'Farming Equipment', value: 'Farming Equipment', icon: Tractor },
  { label: 'Crops / Seeds', value: 'Crops / Seeds', icon: Wheat },
  { label: 'Electronics', value: 'Electronics', icon: Smartphone },
  { label: 'Vehicles', value: 'Vehicles', icon: Car },
  { label: 'Furniture', value: 'Furniture', icon: Sofa },
  { label: 'Other', value: 'Other', icon: PackageSearch },
];

const Home = ({ userVillage, setActiveTab }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [locationSearch, setLocationSearch] = useState('');

  const email = localStorage.getItem('userEmail') || 'guest@example.com';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, wishlistRes, adsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/products`),
          axios.get(`${API_BASE_URL}/api/user/wishlist?email=${encodeURIComponent(email)}`),
          axios.get(`${API_BASE_URL}/api/ads/active`)
        ]);
        
        setProducts(productsRes.data);
        setWishlistIds(wishlistRes.data.map(item => item._id));
        setAds(adsRes.data);
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
        await axios.delete(`${API_BASE_URL}/api/user/wishlist`, { data: { email, productId } });
        setWishlistIds(prev => prev.filter(id => id !== productId));
      } else {
        await axios.post(`${API_BASE_URL}/api/user/wishlist`, { email, productId });
        setWishlistIds(prev => [...prev, productId]);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  // Filter products by selected category
  const categoryFiltered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  // Filter by location search (overrides village-based nearby logic)
  const filteredProducts = locationSearch.trim()
    ? categoryFiltered.filter(p =>
        p.location?.toLowerCase().includes(locationSearch.toLowerCase().trim())
      )
    : categoryFiltered;

  // Nearby = matching village (only when no location search is active)
  const nearbyProducts = !locationSearch.trim() && userVillage
    ? filteredProducts.filter(p => p.location?.toLowerCase().includes(userVillage.toLowerCase())).slice(0, 4)
    : [];

  // Latest = rest of filtered products (not in nearby)
  const latestListings = filteredProducts
    .filter(p => !nearbyProducts.find(n => n._id === p._id))
    .slice(0, 12);

  const renderProductCard = (product) => (
    <div key={product._id} className="product-card" onClick={() => setSelectedProduct(product)} style={{ cursor: 'pointer' }}>
      <div style={{ position: 'relative' }}>
        <img src={product.img} alt={product.title} className="product-img" />
        {product.category && (
          <span className="product-category-badge">{product.category}</span>
        )}
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
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Marketplace Overview</h1>
        <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} color="var(--primary)" />
          Showing active listings near <strong style={{ color: 'var(--primary)' }}>{userVillage || 'your village'}</strong>
        </p>
      </div>

      {/* Category Filter Bar */}
      <div className="category-filter-bar">
        {CATEGORIES.map(({ label, value, icon: Icon }) => (
          <button
            key={value}
            className={`category-filter-btn ${activeCategory === value ? 'active' : ''}`}
            onClick={() => setActiveCategory(value)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Location Search Bar */}
      <div className="location-search-wrapper">
        <div className="location-search-inner">
          <Search size={17} className="location-search-icon" />
          <input
            type="text"
            className="location-search-input"
            placeholder="Search by location... (e.g. Pune, Warud)"
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
          />
          {locationSearch && (
            <button
              className="location-search-clear"
              onClick={() => setLocationSearch('')}
              title="Clear"
            >
              <X size={15} />
            </button>
          )}
        </div>
        {locationSearch.trim() && (
          <p className="location-search-hint">
            <MapPin size={13} />
            Showing products in <strong>"{locationSearch}"</strong>
            &nbsp;&mdash; {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Nearby Products — only show if there are nearby results */}
      {!loading && nearbyProducts.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 0 }}>
              {activeCategory === 'all' ? 'Nearby Products' : `Nearby · ${activeCategory}`}
            </h2>
            <span style={{ fontSize: '0.875rem', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ArrowRight size={16} />
            </span>
          </div>
          <div className="card-grid">
            {nearbyProducts.map(product => renderProductCard(product))}
          </div>
        </div>
      )}

      {/* Main Featured Ad Banner */}
      {ads.filter(a => a.isActive && a.placement === 'main').length > 0 && (
        <div style={{ marginBottom: '3rem' }} className="animate-fadeIn">
          {(() => {
            const mainAd = ads.find(a => a.isActive && a.placement === 'main');
            return (
              <a href={mainAd.redirectUrl} target="_blank" rel="noreferrer" className="ad-poster ad-poster-main">
                <div className="ad-poster-badge">SPONSORED</div>
                <img src={mainAd.imageUrl} alt="Featured Ad" />
                <div className="ad-poster-content" style={{ display: 'block' }}>
                  <div className="ad-poster-title">{mainAd.title}</div>
                  <p style={{ color: 'var(--text-muted)', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Exclusive Sponsored Content</p>
                </div>
              </a>
            );
          })()}
        </div>
      )}

      {/* Latest Listings */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          {locationSearch.trim()
            ? `Results in "${locationSearch}"`
            : activeCategory === 'all' ? 'Latest Listings' : `Latest · ${activeCategory}`
          }
        </h2>
        {loading ? (
          <p>Loading...</p>
        ) : latestListings.length === 0 ? (
          <div className="empty-category-state">
            <PackageSearch size={48} color="var(--text-muted)" />
            <p>No more {activeCategory === 'all' ? '' : `"${activeCategory}" `}listings available.</p>
          </div>
        ) : (
          <div className="card-grid">
            {latestListings.reduce((acc, product, index) => {
              acc.push(renderProductCard(product));
              const shouldInject = ((index + 1) % 6 === 0);
              const gridAds = ads.filter(a => a.isActive && a.placement === 'grid');
              if (shouldInject && gridAds.length > 0) {
                const adIndex = Math.floor(index / 6) % gridAds.length;
                const ad = gridAds[adIndex];
                acc.push(
                  <a key={`ad-${ad._id}-${index}`} href={ad.redirectUrl} target="_blank" rel="noreferrer" className="ad-poster">
                    <div className="ad-poster-badge">SPONSORED</div>
                    <img src={ad.imageUrl} alt={ad.title} />
                    <div className="ad-poster-content">
                      <div className="ad-poster-title">{ad.title}</div>
                    </div>
                  </a>
                );
              }
              return acc;
            }, [])}
          </div>
        )}
      </div>

      {/* Urgent Sales Banner */}
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
            width: '60px', height: '60px', borderRadius: '50%', 
            background: 'rgba(239, 68, 68, 0.2)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', flexShrink: 0
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
