import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { categories, products } from '../data/products.js';
import { useCart } from '../context/CartContext.jsx';
import PaymentModal from '../components/PaymentModal.jsx';

function ProductCard({ p, onAdd }) {
  const [open, setOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        onAdd(p);
        setAddingToCart(false);
      }, 100);
    } catch (error) {
      console.error('Failed to open purchase form:', error);
      setAddingToCart(false);
    }
  };

  return (
    <li className="card" aria-expanded={open}>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
        {!imageLoaded && <div className="product-image image-loading" />}
        <img
          src={p.img}
          alt={p.name}
          className="product-image"
          style={{ display: imageLoaded ? 'block' : 'none' }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />
      </div>
      <h3>{p.name}</h3>
      <div className="small">{p.specs.join(' • ')}</div>
      <div className="price">${p.price}</div>
      <div className="actions">
        <button
          className={`btn primary ${addingToCart ? 'loading' : ''}`}
          onClick={handleAddToCart}
          disabled={addingToCart}
        >
          {addingToCart ? 'Buying....' : 'Buy Now'}
        </button>
        <button className="btn" onClick={() => setOpen(o => !o)}>
          {open ? 'Hide Details' : 'View Details'}
        </button>
      </div>
      {open && (
        <div
          className="small"
          style={{
            marginTop: 'var(--space-md)',
            padding: 'var(--space-md)',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 'var(--radius-lg)',
            animation: 'fadeInUp var(--transition-normal) ease-out'
          }}
        >
          <p>High-quality build and tone designed for reliable performance. Ideal for students and gigging musicians alike.</p>
          <ul style={{ margin: 'var(--space-sm) 0', paddingLeft: 'var(--space-md)' }}>
            {p.specs.map(s => (
              <li key={s} style={{ margin: 'var(--space-xs) 0' }}>
                • {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

function CartItem({ item, onInc, onDec, onRemove }) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => {
      onRemove(item.id);
      setRemoving(false);
    }, 200);
  };

  return (
    <li className={`cart-item ${removing ? 'removing' : ''}`}>
      <div>
        <strong>{item.name}</strong>
        <div className="small">${item.price} × {item.qty}</div>
      </div>
      <div className="quantity-controls">
        <button className="quantity-btn" onClick={() => onDec(item.id)}>−</button>
        <span className="quantity-display">{item.qty}</span>
        <button className="quantity-btn" onClick={() => onInc(item.id)}>+</button>
        <button className="btn" onClick={handleRemove} style={{ marginLeft: 'var(--space-sm)' }}>
          Remove
        </button>
      </div>
    </li>
  );
}

// IndexedDB utilities for persisting orders across reloads and pages
async function initDB() {
  if (!('indexedDB' in window)) {
    throw new Error('IndexedDB not supported');
  }
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('MusicStoreDB', 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('orders')) {
        const store = db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('email', 'customer.email', { unique: false });
      }
    };
  });
}

async function addOrder(orderData) {
  const db = await initDB();
  const tx = db.transaction('orders', 'readwrite');
  const store = tx.objectStore('orders');
  const order = {
    customer: {
      fullName: orderData.fullName,
      email: orderData.email,
      phone: orderData.phone,
    },
    shipping: {
      line1: orderData.addressLine1,
      line2: orderData.addressLine2 || '',
      city: orderData.city,
      state: orderData.state,
      zip: orderData.zipCode,
      country: orderData.country,
    },
    payment: {
      method: orderData.paymentMethod,
      ...(orderData.paymentMethod === 'credit-card' && {
        cardNumber: orderData.cardNumber.replace(/\s/g, ''), // Store without spaces, but in prod, hash/mask
        expiry: `${orderData.expiryMonth}/${orderData.expiryYear}`,
        cardHolderName: orderData.cardHolderName,
      }),
    },
    items: orderData.items,
    total: orderData.total,
    orderId: orderData.orderId || Date.now().toString(),
    date: new Date().toISOString(),
    status: 'confirmed',
  };
  return store.add(order);
}

export default function Store() {
  const { items, add, remove, inc, dec, total, clear } = useCart();
  const [cat, setCat] = useState('all');
  const [clearingCart, setClearingCart] = useState(false);

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState('summary'); // 'summary', 'form', 'success'
  const [purchasingProduct, setPurchasingProduct] = useState(null); // NEW: Track single product purchase

  const filtered = useMemo(() => (cat === 'all' ? products : products.filter(p => p.category === cat)), [cat]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  const handleClearCart = async () => {
    setClearingCart(true);
    try {
      await clear();
    } catch (error) {
      console.error('Failed to clear cart:', error);
    } finally {
      setClearingCart(false);
    }
  };

  // --- MODAL HANDLERS ---
  const handleOpenModal = () => {
    setModalView('summary');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setPurchasingProduct(null); // Reset single product purchase
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (formData) => {
    console.log('Placing order with details:', formData);

    const orderTotal = purchasingProduct ? purchasingProduct.price : total;
    const orderItems = purchasingProduct 
      ? [{ id: String(purchasingProduct.id), name: purchasingProduct.name, price: purchasingProduct.price, qty: 1 }]
      : items.map(item => ({ id: String(item.id), name: item.name, price: item.price, qty: item.qty }));

    try {
      const orderData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        paymentMethod: formData.paymentMethod,
        cardNumber: formData.cardNumber,
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        cvv: formData.cvv,
        cardHolderName: formData.cardHolderName,
        total: orderTotal,
        items: orderItems,
        orderId: Date.now().toString()
      };

      // Save to IndexedDB first
      await addOrder(orderData);
      console.log('Order saved to IndexedDB');

      // Then try to sync with backend
      try {
        const response = await fetch('http://localhost:4000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            total: orderTotal,
            items: orderItems
          }),
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Backend order failed:', errorData);
        } else {
          const result = await response.json();
          console.log('Order synced with backend:', result);
        }
      } catch (networkError) {
        console.error('Network error when placing order:', networkError);
      }

      // Clear the cart only if it was a cart purchase (not single product)
      if (!purchasingProduct) {
        await clear();
      }

      // Show success
      setModalView('success');
    } catch (error) {
      console.error('Failed to save order:', error);
      alert('Failed to save your order. Please try again.');
    }
  };

  return (
    <section>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h2>Instrument Store</h2>
        <p className="small">Curated gear for learners and pros. Quality instruments for every musical journey.</p>
      </div>

      <div className="store-layout">
        <div>
          <div className="actions" style={{ marginBottom: 'var(--space-xl)' }}>
            <button className={`btn ${cat === 'all' ? 'primary' : ''}`} onClick={() => setCat('all')}>
              All Products
            </button>
            {categories.map(c => (
              <button key={c.id} className={`btn ${cat === c.id ? 'primary' : ''}`} onClick={() => setCat(c.id)}>
                {c.name}
              </button>
            ))}
          </div>

          <ul className="grid">
            {filtered.map((p, index) => (
              <ProductCard 
                key={p.id} 
                p={p} 
                onAdd={(product) => {
                  setPurchasingProduct(product);
                  handleOpenModal();
                }} 
                style={{ animationDelay: `${index * 100}ms` }} 
              />
            ))}
          </ul>
        </div>

      </div>

      {/* --- MODAL PORTAL --- */}
      {isModalOpen && createPortal(
        <ModalBackdrop>
          {/* View 1: Summary */}
          {modalView === 'summary' && (
            <div className="card" style={{ maxWidth: '500px', width: '100%', margin: '0 auto', animation: 'fadeInUp var(--transition-normal)' }}>
              <h3>Checkout Summary</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 'var(--space-lg) 0', maxHeight: '40vh', overflowY: 'auto' }}>
                {purchasingProduct ? (
                  // Single product purchase
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--surface-elevated)' }}>
                    <span>{purchasingProduct.name} <span className="small muted">x 1</span></span>
                    <span>${purchasingProduct.price.toFixed(2)}</span>
                  </li>
                ) : (
                  // Cart items purchase
                  items.map(item => (
                    <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--surface-elevated)' }}>
                      <span>{item.name} <span className="small muted">x {item.qty}</span></span>
                      <span>${(item.price * item.qty).toFixed(2)}</span>
                    </li>
                  ))
                )}
              </ul>
              <div className="total" style={{ marginTop: 'var(--space-md)' }}>
                <span>Total</span>
                <span>${purchasingProduct ? purchasingProduct.price.toFixed(2) : total.toFixed(2)}</span>
              </div>
              <div className="actions" style={{ marginTop: 'var(--space-lg)', justifyContent: 'flex-end' }}>
                <button className="btn" onClick={handleCloseModal}>Cancel</button>
                <button className="btn primary" onClick={() => setModalView('form')}>
                  Confirm Purchase
                </button>
              </div>
            </div>
          )}

          {/* View 2: Delivery Form */}
          {modalView === 'form' && (
            <DeliveryForm onSubmit={handleFormSubmit} onCancel={() => setModalView('summary')} />
          )}

          {/* View 3: Success Message */}
          {modalView === 'success' && (
            <div className="card" style={{ maxWidth: '500px', width: '100%', margin: '0 auto', animation: 'fadeInUp var(--transition-normal)', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--green)' }}>Order Confirmed!</h3>
              <p>Thank you for your purchase.</p>
              <p className="small" style={{ marginBottom: 'var(--space-lg)' }}>You will receive a confirmation email shortly.</p>
              <div className="actions" style={{ justifyContent: 'center' }}>
                <button className="btn primary" onClick={handleCloseModal}>Close</button>
              </div>
            </div>
          )}
        </ModalBackdrop>,
        document.body
      )}
    </section>
  );
}

// --- HELPER COMPONENTS ---
function ModalBackdrop({ children }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 'var(--space-lg)'
    }}>
      {children}
    </div>
  );
}

function DeliveryForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    paymentMethod: 'credit-card',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolderName: '',
    saveShipping: false,
    savePayment: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !formData.addressLine1 ||
      !formData.city || !formData.state || !formData.zipCode || !formData.country) {
      alert('Please fill out all shipping address fields.');
      return;
    }

    if (formData.paymentMethod === 'credit-card' &&
      (!formData.cardNumber || !formData.expiryMonth || !formData.expiryYear || !formData.cvv || !formData.cardHolderName)) {
      alert('Please fill out all credit card details.');
      return;
    }

    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  const inputStyle = {
    width: '100%',
    padding: 'var(--space-sm)',
    border: '1px solid var(--surface-elevated)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--surface)',
    color: 'var(--text)',
    fontSize: '0.9rem',
    transition: 'var(--transition-normal)',
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: 'var(--space-xs)',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: '500'
  };

  const sectionStyle = {
    marginBottom: 'var(--space-xl)',
    padding: 'var(--space-lg) 0',
    borderBottom: '1px solid var(--surface-elevated)'
  };

  const subsectionStyle = {
    marginBottom: 'var(--space-md)',
    padding: 'var(--space-md)',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{
      maxWidth: '600px',
      width: '100%',
      margin: '0 auto',
      animation: 'fadeInUp var(--transition-normal)',
      maxHeight: '90vh',
      overflowY: 'auto',
      padding: 'var(--space-lg)'
    }}>
      <h3 style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>Checkout</h3>

      {/* Shipping Address Section */}
      <div style={sectionStyle}>
        <h4 style={{ marginBottom: 'var(--space-md)', fontSize: '1.1rem', color: 'var(--text)' }}>Shipping Address</h4>
        <div style={subsectionStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
            <div>
              <label htmlFor="fullName" style={labelStyle}>Full Name</label>
              <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required style={inputStyle} disabled={isSubmitting} />
            </div>
            <div>
              <label htmlFor="email" style={labelStyle}>Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} disabled={isSubmitting} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
            <div>
              <label htmlFor="phone" style={labelStyle}>Phone Number</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required style={inputStyle} disabled={isSubmitting} />
            </div>
            <div>
              <label htmlFor="country" style={labelStyle}>Country</label>
              <select id="country" name="country" value={formData.country} onChange={handleChange} required style={{ ...inputStyle, padding: 'var(--space-sm) var(--space-sm) var(--space-sm) var(--space-md)' }} disabled={isSubmitting}>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label htmlFor="addressLine1" style={labelStyle}>Address Line 1</label>
            <input type="text" id="addressLine1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} required style={inputStyle} disabled={isSubmitting} />
          </div>
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label htmlFor="addressLine2" style={labelStyle}>Address Line 2 (Optional)</label>
            <input type="text" id="addressLine2" name="addressLine2" value={formData.addressLine2} onChange={handleChange} style={inputStyle} disabled={isSubmitting} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 'var(--space-md)' }}>
            <div>
              <label htmlFor="city" style={labelStyle}>City</label>
              <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} required style={inputStyle} disabled={isSubmitting} />
            </div>
            <div>
              <label htmlFor="state" style={labelStyle}>State/Province</label>
              <input type="text" id="state" name="state" value={formData.state} onChange={handleChange} required style={inputStyle} disabled={isSubmitting} />
            </div>
            <div>
              <label htmlFor="zipCode" style={labelStyle}>ZIP Code</label>
              <input type="text" id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} required style={inputStyle} disabled={isSubmitting} />
            </div>
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input type="checkbox" name="saveShipping" checked={formData.saveShipping} onChange={handleChange} disabled={isSubmitting} style={{ cursor: 'pointer' }} />
          Save this address for future orders
        </label>
      </div>

      {/* Payment Method Section */}
      <div style={sectionStyle}>
        <h4 style={{ marginBottom: 'var(--space-md)', fontSize: '1.1rem', color: 'var(--text)' }}>Payment Method</h4>
        <div style={subsectionStyle}>
          <div style={{ display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', cursor: 'pointer', padding: 'var(--space-sm)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.05)', flex: 1, fontSize: '0.9rem' }}>
              <input type="radio" name="paymentMethod" value="credit-card" checked={formData.paymentMethod === 'credit-card'} onChange={handleChange} disabled={isSubmitting} style={{ cursor: 'pointer' }} />
              Credit/Debit Card
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', cursor: 'pointer', padding: 'var(--space-sm)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.05)', flex: 1, fontSize: '0.9rem' }}>
              <input type="radio" name="paymentMethod" value="paypal" checked={formData.paymentMethod === 'paypal'} onChange={handleChange} disabled={isSubmitting} style={{ cursor: 'pointer' }} />
              PayPal
            </label>
          </div>

          {formData.paymentMethod === 'credit-card' && (
            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 'var(--space-md)' }}>
                <div>
                  <label htmlFor="cardNumber" style={labelStyle}>Card Number</label>
                  <input type="text" id="cardNumber" name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" required style={inputStyle} disabled={isSubmitting} />
                </div>
                <div>
                  <label htmlFor="expiryMonth" style={labelStyle}>Expiry Month</label>
                  <input type="text" id="expiryMonth" name="expiryMonth" value={formData.expiryMonth} onChange={handleChange} placeholder="MM" required style={inputStyle} disabled={isSubmitting} />
                </div>
                <div>
                  <label htmlFor="expiryYear" style={labelStyle}>Expiry Year</label>
                  <input type="text" id="expiryYear" name="expiryYear" value={formData.expiryYear} onChange={handleChange} placeholder="YY" required style={inputStyle} disabled={isSubmitting} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div>
                  <label htmlFor="cardHolderName" style={labelStyle}>Cardholder Name</label>
                  <input type="text" id="cardHolderName" name="cardHolderName" value={formData.cardHolderName} onChange={handleChange} required style={inputStyle} disabled={isSubmitting} />
                </div>
                <div>
                  <label htmlFor="cvv" style={labelStyle}>CVV</label>
                  <input type="text" id="cvv" name="cvv" value={formData.cvv} onChange={handleChange} placeholder="123" required style={inputStyle} disabled={isSubmitting} />
                </div>
              </div>
            </div>
          )}

          {formData.paymentMethod === 'paypal' && (
            <div style={{ padding: 'var(--space-md)', background: 'rgba(0, 0, 0, 0.05)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <p className="small">You will be redirected to PayPal to complete your payment.</p>
            </div>
          )}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input type="checkbox" name="savePayment" checked={formData.savePayment} onChange={handleChange} disabled={isSubmitting} style={{ cursor: 'pointer' }} />
          Save this payment method for future orders
        </label>
      </div>

      <div className="actions" style={{
        marginTop: 'var(--space-lg)',
        justifyContent: 'flex-end',
        borderTop: '1px solid var(--surface-elevated)',
        paddingTop: 'var(--space-md)',
        gap: 'var(--space-sm)'
      }}>
        <button type="button" className="btn" onClick={onCancel} disabled={isSubmitting}>
          Back to Summary
        </button>
        <button type="submit" className={`btn primary ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </form>
  );
}