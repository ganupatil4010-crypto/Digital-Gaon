import React from 'react';

const MyListings = () => {
  const userProducts = [
    { id: 101, title: 'Vintage Handloom Saree', price: '₹1,500', status: 'Active', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400' },
    { id: 102, title: 'Old Nokia Mobile', price: '₹400', status: 'Sold', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div className="listings-page">
      <h1 className="page-title">My Products</h1>
      
      <div className="card-grid">
        {userProducts.map(product => (
          <div key={product.id} className="product-card">
            <div style={{ position: 'relative' }}>
              <img src={product.img} alt={product.title} className="product-img" />
              <span className={`badge badge-${product.status.toLowerCase()}`} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                {product.status}
              </span>
            </div>
            <div className="product-info">
              <div className="product-price">{product.price}</div>
              <div className="product-title">{product.title}</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', flex: 1 }}>
                  ✏️ Edit
                </button>
                <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', flex: 1 }}>
                  🗑️ Delete
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
           <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✨</div>
           <div style={{ fontWeight: '600' }}>Add New Item</div>
           <p style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem' }}>Ready to sell something else?</p>
        </div>
      </div>
    </div>
  );
};

export default MyListings;
