import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './CartPage.css';

export default function CartPage() {
  const { cart, cartTotal, updateQty, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    street: '', city: '', state: '', pincode: '',
    paymentMethod: 'COD',
  });

  const shipping = cartTotal >= 999 ? 0 : 99;
  const total = cartTotal + shipping;

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleOrder = async () => {
    if (!user) { toast.error('Please log in to place an order'); navigate('/login'); return; }
    if (!form.name || !form.street || !form.city || !form.pincode) {
      toast.error('Please fill in your shipping address'); return;
    }
    setPlacing(true);
    try {
      const items = cart.map(i => ({ product: i.product._id, quantity: i.quantity, size: i.size }));
      const { data } = await api.post('/orders', {
        items,
        shippingAddress: { name: form.name, phone: form.phone, street: form.street, city: form.city, state: form.state, pincode: form.pincode },
        paymentMethod: form.paymentMethod,
      });
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) return (
    <div className="cart-empty container">
      <h2>Your cart is empty</h2>
      <p>Looks like you haven't added anything yet.</p>
      <Link to="/shop" className="btn-primary" style={{marginTop:'1.5rem'}}>Browse Collection</Link>
    </div>
  );

  return (
    <div className="cart-page container" style={{ paddingTop: '5rem' }}>
      <div className="section-label" style={{marginBottom:'0.5rem'}}>Checkout</div>
      <h1 className="section-title" style={{marginBottom:'2.5rem'}}>Your Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.map(item => (
            <div key={item._id} className="cart-item">
              <div className="cart-item-img">💎</div>
              <div className="cart-item-info">
                <p className="cart-item-type">{item.product?.type}</p>
                <p className="cart-item-name">{item.product?.name}</p>
                {item.size && <p className="cart-item-size">Size: {item.size}</p>}
              </div>
              <div className="cart-item-controls">
                <button onClick={() => updateQty(item._id, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQty(item._id, item.quantity + 1)}>+</button>
              </div>
              <div className="cart-item-price">₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</div>
              <button className="cart-remove" onClick={() => removeFromCart(item._id)}>✕</button>
            </div>
          ))}

          <div className="shipping-info">
            {shipping === 0
              ? <span className="free-ship">✓ Free shipping on this order</span>
              : <span>₹{shipping} shipping · Free on orders above ₹999</span>}
          </div>
        </div>

        <div className="cart-sidebar">
          <div className="order-summary">
            <h3 className="summary-title">Order Summary</h3>
            <div className="gold-divider"/>
            <div className="summary-row"><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
            <div className="gold-divider"/>
            <div className="summary-row total-row"><span>Total</span><span className="price-display">₹{total.toLocaleString()}</span></div>
          </div>

          <div className="checkout-form">
            <h3 className="summary-title">Shipping Details</h3>
            <div className="gold-divider"/>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Rahul Sharma"/>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210"/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input className="form-input" name="street" value={form.street} onChange={handleChange} placeholder="123, Main Street"/>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" name="city" value={form.city} onChange={handleChange} placeholder="Mumbai"/>
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-input" name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra"/>
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input className="form-input" name="pincode" value={form.pincode} onChange={handleChange} placeholder="400053"/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select className="form-select" name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
                <option value="COD">Cash on Delivery</option>
                <option value="UPI">UPI</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="NetBanking">Net Banking</option>
              </select>
            </div>
            <button className="btn-primary" style={{width:'100%',marginTop:'0.5rem',justifyContent:'center'}} onClick={handleOrder} disabled={placing}>
              {placing ? 'Placing Order...' : `Place Order · ₹${total.toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
