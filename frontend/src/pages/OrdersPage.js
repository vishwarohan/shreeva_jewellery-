import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './OrdersPage.css';

const STATUS_COLORS = {
  Processing: '#f39c12', Confirmed: '#3498db', Shipped: '#9b59b6',
  Delivered: '#2ecc71', Cancelled: '#e74c3c',
};

export function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/orders/my')
      .then(r => { setOrders(r.data.orders); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, navigate]);

  if (loading) return <div className="page-loading"><div className="spinner"/></div>;

  return (
    <div className="orders-page container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
      <div className="section-label">Account</div>
      <h1 className="section-title" style={{ marginBottom: '2.5rem' }}>My Orders</h1>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <p>You haven't placed any orders yet.</p>
          <Link to="/shop" className="btn-primary" style={{ marginTop: '1.5rem' }}>Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card" onClick={() => navigate(`/orders/${order._id}`)}>
              <div className="order-card-top">
                <div>
                  <p className="order-num">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</p>
                  <p className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <span className="order-status-badge" style={{ background: `${STATUS_COLORS[order.orderStatus]}22`, color: STATUS_COLORS[order.orderStatus], border: `1px solid ${STATUS_COLORS[order.orderStatus]}44` }}>
                  {order.orderStatus}
                </span>
              </div>
              <div className="order-card-items">
                {order.items.map((item, i) => (
                  <span key={i} className="order-item-chip">{item.name} ×{item.quantity}</span>
                ))}
              </div>
              <div className="order-card-footer">
                <span className="order-total">₹{order.total.toLocaleString()}</span>
                <span className="order-view">View Details →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get(`/orders/${id}`)
      .then(r => { setOrder(r.data.order); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, user, navigate]);

  if (loading) return <div className="page-loading"><div className="spinner"/></div>;
  if (!order) return <div className="not-found container"><h2>Order not found</h2><Link to="/orders" className="btn-primary" style={{marginTop:'1rem'}}>My Orders</Link></div>;

  const steps = ['Processing', 'Confirmed', 'Shipped', 'Delivered'];
  const currentStep = steps.indexOf(order.orderStatus);

  return (
    <div className="order-detail container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
      <Link to="/orders" className="back-link">← Back to Orders</Link>

      <div className="order-detail-header">
        <div>
          <div className="section-label">Order Details</div>
          <h1 className="section-title">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</h1>
          <p className="order-placed-date">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <span className="order-status-badge large" style={{ background: `${STATUS_COLORS[order.orderStatus]}22`, color: STATUS_COLORS[order.orderStatus], border: `1px solid ${STATUS_COLORS[order.orderStatus]}44` }}>
          {order.orderStatus}
        </span>
      </div>

      {/* TRACKER */}
      {order.orderStatus !== 'Cancelled' && (
        <div className="order-tracker">
          {steps.map((step, i) => (
            <div key={step} className={`tracker-step ${i <= currentStep ? 'done' : ''} ${i === currentStep ? 'current' : ''}`}>
              <div className="tracker-dot">{i <= currentStep ? '✓' : i + 1}</div>
              <p className="tracker-label">{step}</p>
              {i < steps.length - 1 && <div className={`tracker-line ${i < currentStep ? 'done' : ''}`}/>}
            </div>
          ))}
        </div>
      )}

      <div className="order-detail-grid">
        {/* ITEMS */}
        <div className="order-items-section">
          <h3 className="order-section-title">Items Ordered</h3>
          {order.items.map((item, i) => (
            <div key={i} className="order-detail-item">
              <div className="order-item-icon">💎</div>
              <div className="order-item-info">
                <p className="order-item-name">{item.name}</p>
                {item.size && <p className="order-item-meta">Size: {item.size}</p>}
                <p className="order-item-meta">Qty: {item.quantity}</p>
              </div>
              <div className="order-item-price">₹{(item.price * item.quantity).toLocaleString()}</div>
            </div>
          ))}
          <div className="order-totals">
            <div className="order-total-row"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString()}</span></div>
            <div className="order-total-row"><span>Shipping</span><span>{order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost}`}</span></div>
            <div className="gold-divider"/>
            <div className="order-total-row grand"><span>Total</span><span className="price-display">₹{order.total.toLocaleString()}</span></div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="order-sidebar">
          <div className="order-info-block">
            <h3 className="order-section-title">Shipping Address</h3>
            <p className="order-address">
              <strong>{order.shippingAddress.name}</strong><br/>
              {order.shippingAddress.street}<br/>
              {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}<br/>
              {order.shippingAddress.country}
            </p>
            {order.shippingAddress.phone && <p className="order-phone">📞 {order.shippingAddress.phone}</p>}
          </div>
          <div className="order-info-block">
            <h3 className="order-section-title">Payment</h3>
            <div className="order-meta-row"><span>Method</span><span>{order.paymentMethod}</span></div>
            <div className="order-meta-row"><span>Status</span>
              <span style={{ color: order.paymentStatus === 'Paid' ? '#2ecc71' : 'var(--muted)' }}>{order.paymentStatus}</span>
            </div>
          </div>
          {order.trackingNumber && (
            <div className="order-info-block">
              <h3 className="order-section-title">Tracking</h3>
              <p className="tracking-num">{order.trackingNumber}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
