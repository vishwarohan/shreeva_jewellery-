import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './AccountPage.css';

const TABS = ['Profile', 'My Orders', 'Change Password'];

const AVATARS = ['💎','👑','🔥','⚡','🦁','🐉','💀','🌟'];

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export default function AccountPage() {
  const { user, fetchMe, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Profile');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile form
  const [profile, setProfile] = useState({ name:'', phone:'', avatar:'', address:{ street:'', city:'', state:'', pincode:'', country:'India' } });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw] = useState({ current:false, new:false, confirm:false });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setProfile({
      name: user.name || '',
      phone: user.phone || '',
      avatar: user.avatar || '',
      address: {
        street:  user.address?.street  || '',
        city:    user.address?.city    || '',
        state:   user.address?.state   || '',
        pincode: user.address?.pincode || '',
        country: user.address?.country || 'India',
      },
    });
  }, [user, navigate]);

  useEffect(() => {
    if (tab === 'My Orders') loadOrders();
  }, [tab]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await api.get('/orders/my');
      setOrders(data.orders);
    } catch {}
    setLoadingOrders(false);
  };

  const handleProfileSave = async e => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/auth/me', profile);
      await fetchMe();
      toast.success('Profile updated!');
    } catch(err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    setSavingProfile(false);
  };

  const handleAvatarUpload = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error('Image must be under 5 MB');
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    setUploadingAvatar(true);
    try {
      const { data } = await api.put('/auth/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(p => ({ ...p, avatar: data.avatar }));
      await fetchMe();
      toast.success('Profile image uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handlePasswordChange = async e => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch(err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    setSavingPw(false);
  };

  const STATUS_COLORS = { Processing:'#f39c12', Confirmed:'#3498db', Shipped:'#9b59b6', Delivered:'#2ecc71', Cancelled:'#e74c3c' };

  if (!user) return null;

  return (
    <div className="account-page container" style={{ paddingTop:'5rem', paddingBottom:'5rem' }}>

      {/* HEADER */}
      <div className="account-header">
        <div className="account-avatar-wrap">
          <div className="account-avatar">
            {isImageAvatar(profile.avatar) ? (
              <img src={profile.avatar} alt={`${user.name || 'User'} profile`} />
            ) : (
              profile.avatar || 'WYW'
            )}
          </div>
          <div className="account-avatar-info">
            <h1 className="account-name">{user.name}</h1>
            <p className="account-email">{user.email}</p>
            <span className={`account-role-badge ${user.role}`}>{user.role === 'admin' ? '⭐ Admin' : '👤 Member'}</span>
          </div>
        </div>
        <div className="account-header-actions">
          {user.role === 'admin' && (
            <Link to="/admin" className="btn-primary">Admin Panel →</Link>
          )}
          <button className="btn-ghost" onClick={logout}>Logout</button>
        </div>
      </div>

      {/* TABS */}
      <div className="account-tabs">
        {TABS.map(t => (
          <button key={t} className={`account-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {tab === 'Profile' && (
        <form className="account-form fade-in" onSubmit={handleProfileSave}>
          <div className="form-section-title">Personal Details</div>

          <div className="form-group">
            <label className="form-label">Profile Image</label>
            <div className="profile-image-upload">
              <div className="profile-image-preview">
                {isImageAvatar(profile.avatar) ? (
                  <img src={profile.avatar} alt="Profile preview" />
                ) : (
                  <span>{profile.avatar || 'WYW'}</span>
                )}
              </div>
              <div className="profile-image-actions">
                <label className="upload-avatar-btn">
                  {uploadingAvatar ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                </label>
                {isImageAvatar(profile.avatar) && (
                  <button type="button" className="btn-ghost avatar-clear-btn" onClick={() => setProfile(p => ({ ...p, avatar: '' }))}>
                    Remove Image
                  </button>
                )}
                <p className="form-hint">JPG, PNG, or WebP. Keep it under 5 MB.</p>
              </div>
            </div>
          </div>

          {/* Avatar picker */}
          <div className="form-group">
            <label className="form-label">Choose Your Avatar</label>
            <div className="avatar-picker">
              {AVATARS.map(a => (
                <button key={a} type="button"
                  className={`avatar-opt ${profile.avatar === a ? 'active' : ''}`}
                  onClick={() => setProfile(p => ({ ...p, avatar: a }))}
                >{a}</button>
              ))}
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                placeholder="Your name" required/>
            </div>
            <div className="form-group">
              <label className="form-label">Phone / WhatsApp</label>
              <input className="form-input" value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98765 43210"/>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={user.email} disabled style={{ opacity:0.5, cursor:'not-allowed' }}/>
            <p className="form-hint">Email cannot be changed. Contact admin if needed.</p>
          </div>

          <div className="form-section-title" style={{ marginTop:'1.5rem' }}>Shipping Address</div>
          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input className="form-input" value={profile.address.street}
              onChange={e => setProfile(p => ({ ...p, address:{ ...p.address, street:e.target.value } }))}
              placeholder="123, Main Street, Apartment 4B"/>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" value={profile.address.city}
                onChange={e => setProfile(p => ({ ...p, address:{ ...p.address, city:e.target.value } }))}
                placeholder="Mumbai"/>
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input className="form-input" value={profile.address.state}
                onChange={e => setProfile(p => ({ ...p, address:{ ...p.address, state:e.target.value } }))}
                placeholder="Maharashtra"/>
            </div>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input className="form-input" value={profile.address.pincode}
                onChange={e => setProfile(p => ({ ...p, address:{ ...p.address, pincode:e.target.value } }))}
                placeholder="400053"/>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      )}

      {/* ── MY ORDERS TAB ── */}
      {tab === 'My Orders' && (
        <div className="fade-in">
          {loadingOrders ? (
            <div className="page-loading"><div className="spinner"/></div>
          ) : orders.length === 0 ? (
            <div className="orders-empty">
              <p>You haven't placed any orders yet.</p>
              <Link to="/shop" className="btn-primary" style={{ marginTop:'1.5rem' }}>Browse Collection</Link>
            </div>
          ) : (
            <div className="account-orders-list">
              {orders.map(order => (
                <div key={order._id} className="account-order-card" onClick={() => navigate(`/orders/${order._id}`)}>
                  <div className="aoc-top">
                    <div>
                      <p className="aoc-num">#{order._id.slice(-8).toUpperCase()}</p>
                      <p className="aoc-date">{new Date(order.createdAt).toLocaleDateString('en-IN',{ day:'numeric', month:'short', year:'numeric' })}</p>
                    </div>
                    <span className="aoc-status" style={{ color: STATUS_COLORS[order.orderStatus] }}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="aoc-items">
                    {order.items.map((item,i) => (
                      <span key={i} className="aoc-item-chip">{item.name} ×{item.quantity}</span>
                    ))}
                  </div>
                  <div className="aoc-footer">
                    <span className="aoc-total">₹{order.total.toLocaleString()}</span>
                    <span className="aoc-view">View Details →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CHANGE PASSWORD TAB ── */}
      {tab === 'Change Password' && (
        <form className="account-form fade-in" onSubmit={handlePasswordChange} style={{ maxWidth:480 }}>
          <div className="form-section-title">Change Password</div>
          <p className="form-hint" style={{ marginBottom:'1.5rem' }}>Choose a strong password with at least 6 characters.</p>

          {[
            { label:'Current Password', key:'currentPassword', show:'current' },
            { label:'New Password',     key:'newPassword',     show:'new' },
            { label:'Confirm Password', key:'confirmPassword', show:'confirm' },
          ].map(f => (
            <div className="form-group" key={f.key}>
              <label className="form-label">{f.label}</label>
              <div className="pw-input-wrap">
                <input
                  className="form-input"
                  type={showPw[f.show] ? 'text' : 'password'}
                  value={pwForm[f.key]}
                  onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder="••••••••"
                  required
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(s => ({ ...s, [f.show]: !s[f.show] }))}>
                  {showPw[f.show] ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          ))}

          {/* Password strength indicator */}
          {pwForm.newPassword && (
            <div className="pw-strength">
              <div className="pw-strength-bars">
                {[1,2,3,4].map(n => (
                  <div key={n} className={`pw-bar ${passwordStrength(pwForm.newPassword) >= n ? `level-${passwordStrength(pwForm.newPassword)}` : ''}`}/>
                ))}
              </div>
              <span className="pw-strength-label">{['','Weak','Fair','Good','Strong'][passwordStrength(pwForm.newPassword)]}</span>
            </div>
          )}

          {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
            <p className="pw-mismatch">⚠️ Passwords do not match</p>
          )}

          <div className="form-actions" style={{ marginTop:'1.5rem' }}>
            <button type="submit" className="btn-primary" disabled={savingPw || (pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword)}>
              {savingPw ? 'Changing...' : 'Change Password'}
            </button>
          </div>
          <div className="forgot-link-wrap">
            <Link to="/forgot-password" className="forgot-link">Forgot your password?</Link>
          </div>
        </form>
      )}
    </div>
  );
}

function isImageAvatar(avatar) {
  return typeof avatar === 'string' && /^(data:image\/|https?:\/\/)/.test(avatar);
}

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
