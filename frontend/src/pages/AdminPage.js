import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AdminPage.css';

const TABS = ['Dashboard', 'Products', 'Orders', 'Custom Orders', 'Users'];
const API_BASE = process.env.REACT_APP_API_URL?.replace('/api','') || 'http://localhost:5000';

const getImageSrc = (image) => {
  if (!image) return '';
  return image.startsWith('http') ? image : `${API_BASE}/uploads/${image}`;
};

const isImageAvatar = (avatar) => typeof avatar === 'string' && /^(data:image\/|https?:\/\/)/.test(avatar);

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name:'', phone:'', role:'user', isActive:true });
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name:'', type:'Chain', description:'', price:'', comparePrice:'', material:'Gold Plated', availableMaterials:'', stock:'', sizes:'', badge:'', isFeatured:'false', stoneType:'CZ', caratWeight:'', cut:'N/A', color:'N/A', clarity:'N/A', imageFiles: null });

  const handleRemoveImage = async (productId, filename) => {
    try {
      await api.delete(`/products/${productId}/image/${encodeURIComponent(filename)}`);
      toast.success('Image removed');
      loadData();
    } catch { toast.error('Failed to remove image'); }
  };

  useEffect(() => {
    if (!user || !isAdmin) { navigate('/'); return; }
    loadData();
  }, [user, isAdmin, navigate]);

  const loadData = async () => {
    try {
      const [prod, ord, cust, usr] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/orders'),
        api.get('/custom'),
        api.get('/auth/users'),
      ]);
      setProducts(prod.data.products);
      setOrders(ord.data.orders);
      setCustomOrders(cust.data.orders);
      setUsers(usr.data.users);
      const revenue = ord.data.orders.filter(o => o.orderStatus !== 'Cancelled').reduce((s,o) => s+o.total, 0);
      setStats({
        products: prod.data.pagination.total,
        orders: ord.data.total,
        revenue,
        customOrders: cust.data.orders.length,
        pending: ord.data.orders.filter(o => o.orderStatus === 'Processing').length,
        users: usr.data.total,
      });
    } catch {}
  };

  const handleProductSubmit = async e => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', productForm.name);
      fd.append('type', productForm.type);
      fd.append('description', productForm.description);
      fd.append('price', productForm.price);
      if (productForm.comparePrice) fd.append('comparePrice', productForm.comparePrice);
      fd.append('stock', productForm.stock);
      fd.append('material', productForm.material);
      fd.append('availableMaterials', JSON.stringify(productForm.availableMaterials ? productForm.availableMaterials.split(',').map(s=>s.trim()) : []));
      fd.append('sizes', productForm.sizes);
      fd.append('badge', productForm.badge);
      fd.append('isFeatured', productForm.isFeatured);
      fd.append('diamond', JSON.stringify({ stoneType: productForm.stoneType, caratWeight: productForm.caratWeight, cut: productForm.cut, color: productForm.color, clarity: productForm.clarity }));
      if (productForm.imageFiles) {
        Array.from(productForm.imageFiles).forEach(f => fd.append('images', f));
      }
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created!');
      }
      setShowProductForm(false); setEditProduct(null); loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const toggleFeatured = async (id, current) => {
    try {
      await api.patch(`/products/${id}/featured`);
      toast.success(current ? 'Removed from homepage' : 'Added to homepage ⭐');
      loadData();
    } catch { toast.error('Failed to update'); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Deactivate this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deactivated');
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const updateOrderStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { orderStatus: status });
    toast.success(`Order marked as ${status}`);
    loadData();
  };

  const updateCustomStatus = async (id, status) => {
    await api.put(`/custom/${id}`, { status });
    toast.success('Custom order updated');
    loadData();
  };

  const openEditProduct = (p) => {
    setEditProduct(p);
    setProductForm({
      name: p.name, type: p.type, description: p.description,
      price: p.price, comparePrice: p.comparePrice || '',
      material: p.material, availableMaterials: p.availableMaterials?.join(', ') || '',
      stock: p.stock, sizes: p.sizes?.join(', ') || '',
      badge: p.badge || '', isFeatured: String(p.isFeatured),
      stoneType: p.diamond?.stoneType || 'CZ',
      caratWeight: p.diamond?.caratWeight || '',
      cut: p.diamond?.cut || 'N/A',
      color: p.diamond?.color || 'N/A',
      clarity: p.diamond?.clarity || 'N/A',
      imageFiles: null,
    });
    setShowProductForm(true);
  };

  return (
    <div className="admin-page container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
      <div className="admin-header">
        <div>
          <div className="section-label">Admin Panel</div>
          <h1 className="section-title">WYW Dashboard</h1>
        </div>
        <Link to="/" className="btn-ghost">← Back to Site</Link>
      </div>

      {/* TABS */}
      <div className="admin-tabs">
        {TABS.map(t => (
          <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* DASHBOARD */}
      {tab === 'Dashboard' && stats && (
        <div className="fade-in">
          <div className="stat-cards">
            {[
              { label:'Total Products',   value: stats.products,                    icon:'💎' },
              { label:'Total Orders',     value: stats.orders,                      icon:'📦' },
              { label:'Total Revenue',    value:`₹${stats.revenue.toLocaleString()}`, icon:'💰' },
              { label:'Custom Requests',  value: stats.customOrders,               icon:'✂️' },
              { label:'Pending Orders',   value: stats.pending,                    icon:'⏳' },
              { label:'Total Users',      value: stats.users,                      icon:'👥' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <span className="stat-icon">{s.icon}</span>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <h3 className="admin-section-title">Recent Orders</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {orders.slice(0, 10).map(o => (
                  <tr key={o._id}>
                    <td className="mono">#{o._id.slice(-8).toUpperCase()}</td>
                    <td>{o.user?.name || '—'}</td>
                    <td className="gold-text">₹{o.total.toLocaleString()}</td>
                    <td><span className="status-chip" style={{ color: o.orderStatus === 'Delivered' ? '#2ecc71' : o.orderStatus === 'Cancelled' ? '#e74c3c' : 'var(--gold)' }}>{o.orderStatus}</span></td>
                    <td className="muted-text">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      {tab === 'Products' && (
        <div className="fade-in">
          <div className="admin-section-header">
            <h3 className="admin-section-title">All Products</h3>
            <button className="btn-primary" onClick={() => { setEditProduct(null); setProductForm({ name:'', type:'Chain', description:'', price:'', comparePrice:'', material:'Gold Plated', stock:'', sizes:'', badge:'' }); setShowProductForm(true); }}>
              + Add Product
            </button>
          </div>

          {showProductForm && (
            <form className="product-form" onSubmit={handleProductSubmit} encType="multipart/form-data">
              <h3 className="product-form-title">{editProduct ? 'Edit Product' : 'Add New Product'}</h3>

              {/* Basic Info */}
              <div className="form-grid-2">
                <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} required/></div>
                <div className="form-group"><label className="form-label">Type *</label>
                  <select className="form-select" value={productForm.type} onChange={e => setProductForm(f => ({ ...f, type: e.target.value }))}>
                    {['Chain','Pendant','Ring','Bracelet','Earring','Grillz','Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Price (₹) *</label><input className="form-input" type="number" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} required/></div>
                <div className="form-group"><label className="form-label">Compare Price (₹)</label><input className="form-input" type="number" value={productForm.comparePrice} onChange={e => setProductForm(f => ({ ...f, comparePrice: e.target.value }))}/></div>
                <div className="form-group"><label className="form-label">Stock *</label><input className="form-input" type="number" value={productForm.stock} onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))} required/></div>
                <div className="form-group"><label className="form-label">Badge</label><input className="form-input" value={productForm.badge} onChange={e => setProductForm(f => ({ ...f, badge: e.target.value }))} placeholder="New, Bestseller, Sale..."/></div>
                <div className="form-group"><label className="form-label">Sizes (comma-separated)</label><input className="form-input" value={productForm.sizes} onChange={e => setProductForm(f => ({ ...f, sizes: e.target.value }))} placeholder='18", 20", 22"'/></div>
                <div className="form-group">
                  <label className="form-label">Featured?</label>
                  <select className="form-select" value={productForm.isFeatured} onChange={e => setProductForm(f => ({ ...f, isFeatured: e.target.value }))}>
                    <option value="false">No</option><option value="true">Yes — show on homepage</option>
                  </select>
                </div>
              </div>

              {/* Material */}
              <div className="form-section-divider">Material</div>
              <div className="form-grid-2">
                <div className="form-group"><label className="form-label">Default Material</label>
                  <select className="form-select" value={productForm.material} onChange={e => setProductForm(f => ({ ...f, material: e.target.value }))}>
                    {['10K Gold','14K Gold','18K Gold','24K Gold','White Gold','Rose Gold','Gold Plated','Silver','Silver Plated','Platinum','Stainless Steel','Custom'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Available Materials (comma-separated)</label>
                  <input className="form-input" value={productForm.availableMaterials} onChange={e => setProductForm(f => ({ ...f, availableMaterials: e.target.value }))} placeholder="Gold Plated, 14K Gold, Silver Plated"/>
                </div>
              </div>

              {/* Diamond 4Cs */}
              <div className="form-section-divider">Diamond / Stone Details (4Cs)</div>
              <div className="form-grid-3">
                <div className="form-group"><label className="form-label">Stone Type</label>
                  <select className="form-select" value={productForm.stoneType} onChange={e => setProductForm(f => ({ ...f, stoneType: e.target.value }))}>
                    {['CZ','Natural Diamond','Lab Diamond','Moissanite','Ruby','Sapphire','Emerald','Other','N/A'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Carat Weight</label>
                  <input className="form-input" value={productForm.caratWeight} onChange={e => setProductForm(f => ({ ...f, caratWeight: e.target.value }))} placeholder="e.g. 2.5 ct total"/>
                </div>
                <div className="form-group"><label className="form-label">Cut</label>
                  <select className="form-select" value={productForm.cut} onChange={e => setProductForm(f => ({ ...f, cut: e.target.value }))}>
                    {['N/A','Excellent','Very Good','Good','Fair','Poor'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Color Grade</label>
                  <select className="form-select" value={productForm.color} onChange={e => setProductForm(f => ({ ...f, color: e.target.value }))}>
                    {['N/A','D','E','F','G','H','I','J','K','L','M'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Clarity</label>
                  <select className="form-select" value={productForm.clarity} onChange={e => setProductForm(f => ({ ...f, clarity: e.target.value }))}>
                    {['N/A','FL','IF','VVS1','VVS2','VS1','VS2','SI1','SI2','I1','I2','I3'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Images */}
              <div className="form-section-divider">Product Images</div>
              <div className="form-group">
                <label className="form-label">Upload Images (max 6, JPG/PNG/WEBP, 5MB each)</label>
                <input type="file" className="form-input file-input" multiple accept="image/*"
                  onChange={e => setProductForm(f => ({ ...f, imageFiles: e.target.files }))}/>
                <p className="form-hint">Images will be displayed on the product page. Upload high-quality photos on dark/black background for best results.</p>
              </div>
              {editProduct?.images?.length > 0 && (
                <div className="existing-images">
                  <p className="form-label">Existing Images</p>
                  <div className="img-thumb-row">
                    {editProduct.images.map(img => (
                      <div key={img} className="img-thumb-wrap">
                        <img src={getImageSrc(img)} alt={img} className="img-thumb"/>
                        <button type="button" className="img-remove" onClick={() => handleRemoveImage(editProduct._id, img)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group" style={{marginTop:'0.75rem'}}>
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} required style={{minHeight:90}}/>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">{editProduct ? 'Update Product' : 'Create Product'}</button>
                <button type="button" className="btn-ghost" onClick={() => setShowProductForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Type</th><th>Price</th><th>Stock</th><th>Sold</th><th>Homepage</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td className="muted-text">{p.type}</td>
                    <td className="gold-text">₹{p.price.toLocaleString()}</td>
                    <td className={p.stock < 5 ? 'danger-text' : ''}>{p.stock}</td>
                    <td>{p.sold}</td>
                    <td>
                      <button
                        className={`featured-toggle ${p.isFeatured ? 'is-featured' : ''}`}
                        onClick={() => toggleFeatured(p._id, p.isFeatured)}
                        title={p.isFeatured ? 'Remove from homepage' : 'Show on homepage'}
                      >
                        {p.isFeatured ? '⭐ Featured' : '☆ Add'}
                      </button>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="table-btn" onClick={() => openEditProduct(p)}>Edit</button>
                        <button className="table-btn danger" onClick={() => deleteProduct(p._id)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDERS */}
      {tab === 'Orders' && (
        <div className="fade-in">
          <h3 className="admin-section-title">All Orders</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Update</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td className="mono">#{o._id.slice(-8).toUpperCase()}</td>
                    <td>{o.user?.name || '—'}<br/><span className="muted-text">{o.user?.email}</span></td>
                    <td className="muted-text">{o.items.length} item(s)</td>
                    <td className="gold-text">₹{o.total.toLocaleString()}</td>
                    <td className="muted-text">{o.paymentMethod}</td>
                    <td><span className="status-chip">{o.orderStatus}</span></td>
                    <td>
                      <select className="form-select mini-select" value={o.orderStatus} onChange={e => updateOrderStatus(o._id, e.target.value)}>
                        {['Processing','Confirmed','Shipped','Delivered','Cancelled'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CUSTOM ORDERS */}
      {tab === 'Custom Orders' && (
        <div className="fade-in">
          <h3 className="admin-section-title">Custom Order Requests</h3>
          <div className="custom-orders-list">
            {customOrders.map(o => (
              <div key={o._id} className="custom-order-card">
                <div className="custom-order-header">
                  <div>
                    <p className="custom-order-name">{o.firstName} {o.lastName}</p>
                    <p className="custom-order-contact">{o.email} · {o.phone}</p>
                  </div>
                  <select className="form-select mini-select" value={o.status} onChange={e => updateCustomStatus(o._id, e.target.value)}>
                    {['New','Reviewed','Quoted','Accepted','In Progress','Completed','Rejected'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="custom-order-meta">
                  <span className="badge">{o.jewelleryType}</span>
                  {o.budget && <span className="custom-budget">Budget: {o.budget}</span>}
                  <span className="custom-date">{new Date(o.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <p className="custom-vision">"{o.vision}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* USERS */}
      {tab === 'Users' && (
        <div className="fade-in">
          <div className="admin-section-header">
            <h3 className="admin-section-title">All Users</h3>
            <input
              className="form-input" style={{width:260}}
              placeholder="Search by name or email..."
              value={userSearch}
              onChange={async e => {
                setUserSearch(e.target.value);
                try {
                  const { data } = await api.get(`/auth/users?search=${e.target.value}`);
                  setUsers(data.users);
                } catch {}
              }}
            />
          </div>

          {/* Edit User Modal */}
          {editingUser && (
            <div className="user-edit-panel">
              <h3 className="user-edit-title">Edit User — {editingUser.name}</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={userForm.name} onChange={e => setUserForm(f=>({...f,name:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={userForm.phone} onChange={e => setUserForm(f=>({...f,phone:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={userForm.role} onChange={e => setUserForm(f=>({...f,role:e.target.value}))}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={userForm.isActive} onChange={e => setUserForm(f=>({...f,isActive:e.target.value==='true'}))}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-primary" onClick={async () => {
                  try {
                    await api.put(`/auth/users/${editingUser._id}`, userForm);
                    toast.success('User updated!');
                    setEditingUser(null);
                    loadData();
                  } catch(err) { toast.error(err.response?.data?.message || 'Failed'); }
                }}>Save Changes</button>
                <button className="btn-ghost" onClick={() => setEditingUser(null)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Phone</th>
                  <th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                        {isImageAvatar(u.avatar) ? (
                          <img src={u.avatar} alt={u.name} style={{width:28,height:28,borderRadius:'50%',objectFit:'cover'}} />
                        ) : (
                          <span style={{fontSize:'1.2rem'}}>{u.avatar || '👤'}</span>
                        )}
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="muted-text">{u.email}</td>
                    <td className="muted-text">{u.phone || '—'}</td>
                    <td>
                      <span className={`role-chip ${u.role}`}>{u.role}</span>
                    </td>
                    <td>
                      <span className={`status-chip-user ${u.isActive ? 'active' : 'inactive'}`}>
                        {u.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td className="muted-text">
                      {new Date(u.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="table-btn" onClick={() => {
                          setEditingUser(u);
                          setUserForm({ name:u.name, phone:u.phone||'', role:u.role, isActive:u.isActive });
                        }}>Edit</button>
                        <button
                          className={`table-btn ${u.isActive ? 'danger' : ''}`}
                          disabled={u.role === 'admin'}
                          title={u.role === 'admin' ? 'Cannot deactivate admin' : ''}
                          onClick={async () => {
                            try {
                              const { data } = await api.patch(`/auth/users/${u._id}/toggle`);
                              toast.success(data.message);
                              loadData();
                            } catch(err) { toast.error(err.response?.data?.message || 'Failed'); }
                          }}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
