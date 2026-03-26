import React from 'react';

const Wishlist = () => {
  const savedItems = [
    { id: 201, title: 'Handmade Wooden Cart', price: '₹4,200', location: 'Morshi', img: 'https://images.unsplash.com/photo-1594411124115-46487e35b750?auto=format&fit=crop&q=80&w=400' },
    { id: 202, title: 'Fertilizer Sprayer', price: '₹1,500', location: 'Katol', img: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div className="wishlist-page">
      <h1 className="page-title">My Wishlist</h1>
      
      {savedItems.length > 0 ? (
        <div className="card-grid">
          {savedItems.map(item => (
            <div key={item.id} className="product-card">
              <img src={item.img} alt={item.title} className="product-img" />
              <div className="product-info">
                <div className="product-price">{item.price}</div>
                <div className="product-title">{item.title}</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                   <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem' }}>View Details</button>
                   <button className="btn btn-danger" style={{ padding: '0.5rem', borderRadius: '50%', flex: '0 0 40px' }}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="auth-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
          <h3>Your wishlist is empty</h3>
          <p>Explore the market and save items you like!</p>
          <button className="btn btn-primary">Start Shopping</button>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
