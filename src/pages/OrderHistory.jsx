import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/apiClient';
import { useAuth } from '../context/AuthContext';

// --- MOCK DATA ---
const mockOrders = [
  {
    order_id: 1024,
    created_at: '2024-05-20T10:30:00Z',
    total_amount: '1349.98',
    full_name: 'Admin User',
    email: 'admin@10239gmail.com',
    phone: '83206 33350',
    status: 'Delivered',
    items: [
      { id: 'prod_1', name: 'Harmoniq Pro Electric Guitar', price: 699.99, qty: 1 },
      { id: 'prod_2', name: 'Acoustic Dreadnought', price: 649.99, qty: 1 },
    ],
  },
  {
    order_id: 1023,
    created_at: '2024-04-15T14:00:00Z',
    total_amount: '549.00',
    full_name: 'Admin User',
    email: 'admin@10239gmail.com',
    phone: '83206 33350',
    status: 'Shipped',
    items: [
      { id: 'prod_8', name: 'Digital Piano DP-88', price: 549.00, qty: 1 },
    ],
  },
  {
    order_id: 1021,
    created_at: '2024-02-01T09:12:00Z',
    total_amount: '49.98',
    full_name: 'Admin User',
    email: 'admin@10239gmail.com',
    phone: '83206 33350',
    status: 'Processing',
    items: [
      { id: 'prod_15', name: 'Premium Guitar Strings', price: 24.99, qty: 2 },
    ],
  },
];

function OrderItem({ item }) {
  return (
    <div className="order-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-sm) 0' }}>
      <div className="order-item-details">
        <p><strong>{item.name}</strong></p>
        <p className="small muted">Qty: {item.qty} &bull; Price: ${item.price.toFixed(2)}</p>
      </div>
      <div className="order-item-total">
        <p style={{ fontWeight: 'bold' }}>${(item.qty * item.price).toFixed(2)}</p>
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const getStatusStyle = (status) => {
    const baseStyle = {
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      textTransform: 'uppercase',
    };
    switch (status) {
      case 'Delivered':
        return { ...baseStyle, background: 'var(--green-light)', color: 'var(--green-dark)' };
      case 'Shipped':
        return { ...baseStyle, background: 'var(--blue-light)', color: 'var(--blue-dark)' };
      case 'Processing':
        return { ...baseStyle, background: 'var(--orange-light)', color: 'var(--orange-dark)' };
      default:
        return { ...baseStyle, background: 'var(--surface-elevated)', color: 'var(--text-muted)' };
    }
  };

  return (
    <div className="card order-history-card">
      <div className="order-summary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-md)' }}>
        <div>
          <p className="small muted">Order #{order.order_id}</p>
          <p><strong>{new Date(order.created_at).toLocaleDateString()}</strong></p>
        </div>
        <div>
          <p className="small muted">Status</p>
          <p><span style={getStatusStyle(order.status)}>{order.status}</span></p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className="small muted">Total</p>
          <p><strong>${Number(order.total_amount).toFixed(2)}</strong></p>
        </div>
        <button className="btn small" onClick={() => setIsOpen(!isOpen)} style={{ minWidth: '110px' }}>
          {isOpen ? 'Hide Details' : 'View Details'}
        </button>
      </div>
      {isOpen && (
        <div className="order-details" style={{ marginTop: 'var(--space-lg)', borderTop: '1px solid var(--surface-elevated)', paddingTop: 'var(--space-lg)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)' }}>
            <div>
              <h4 style={{ marginBottom: 'var(--space-sm)' }}>Items</h4>
              {order.items.map((item, index) => (
                <OrderItem key={`${item.id}-${index}`} item={item} />
              ))}
            </div>
            <div className="order-shipping-details" style={{ background: 'var(--surface-elevated)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ marginBottom: 'var(--space-sm)' }}>Shipping To</h4>
              <p className="small">{order.full_name}</p>
              <p className="small">{order.email}</p>
              {order.phone && <p className="small">{order.phone}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // To use real data, uncomment the line below and remove the mock data line
        // const data = await api('/api/orders');
        // setOrders(data.orders || []);

        // Using mock data for now
        setOrders(mockOrders);
      } catch (err) {
        setError('Failed to fetch order history.');
        showToast(err.message || 'Could not load orders.', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [showToast]);

  return (
    <section>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
          <div>
            <h2>Order History</h2>
            <p className="muted">Review your past purchases from the Harmoniq store.</p>
          </div>
          <Link to="/account" className="btn">Back to Account</Link>
        </div>

        {loading && <div className="spinner" style={{ margin: 'var(--space-xl) auto' }}></div>}
        
        {error && <div className="card error" style={{ textAlign: 'center' }}>{error}</div>}

        {!loading && !error && (
          <>
            {orders.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                <p>You haven't placed any orders yet.</p>
                <Link to="/store" className="btn primary" style={{ marginTop: 'var(--space-md)' }}>
                  Browse the Store
                </Link>
              </div>
            ) : (
              <div className="order-list">
                {orders.map(order => (
                  <OrderCard key={order.order_id} order={order} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}