import React from 'react';

const Home = ({ userVillage }) => {
  const nearbyProducts = [
    { id: 1, title: 'Fresh Desi Ghee', price: '₹650', location: 'Nagpur', img: 'https://images.unsplash.com/photo-1582213702164-9092403666d6?auto=format&fit=crop&q=80&w=400' },
    { id: 2, title: 'Tractor Spares', price: '₹1,200', location: 'Warud', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400' },
    { id: 3, title: 'Organic Wheat (1kg)', price: '₹45', location: 'Katol', img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400' },
  ];

  const latestListings = [
    { id: 4, title: 'Cotton Harvest Help', price: '₹350/day', location: 'Morshi', img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400' },
    { id: 5, title: 'Bicycle - Old Model', price: '₹2,500', location: 'Amravati', img: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div className="home-page">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="page-title">Marketplace Overview</h1>
        <p style={{ margin: 0 }}>📍 Showing active listings near <strong style={{ color: 'var(--primary)' }}>{userVillage || 'your village'}</strong></p>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 0 }}>Nearby Products</h2>
          <span style={{ fontSize: '0.875rem', color: 'var(--primary)', cursor: 'pointer' }}>View all →</span>
        </div>
        <div className="card-grid">
          {nearbyProducts.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.img} alt={product.title} className="product-img" />
              <div className="product-info">
                <div className="product-price">{product.price}</div>
                <div className="product-title">{product.title}</div>
                <div className="product-meta">
                  <span>{product.location}</span>
                  <span style={{ color: 'var(--success)', fontWeight: '600' }}>In Stock</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Latest Listings</h2>
        <div className="card-grid">
          {latestListings.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.img} alt={product.title} className="product-img" />
              <div className="product-info">
                <div className="product-price">{product.price}</div>
                <div className="product-title">{product.title}</div>
                <div className="product-meta">
                  <span>{product.location}</span>
                  <span style={{ color: 'var(--text-muted)' }}>2 hours ago</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ 
        marginTop: '3rem', 
        padding: '2rem', 
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(0, 0, 0, 0.2))', 
        borderRadius: 'var(--radius-md)', 
        border: '1px solid rgba(239, 68, 68, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>🔥 Urgent Sales</h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Check out products that need to be sold today at high discounts!</p>
        </div>
        <button className="btn" style={{ background: '#ef4444', color: 'white' }}>Check Now</button>
      </div>
    </div>
  );
};

export default Home;
