import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { whatsappProduct } from '../utils/whatsapp';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api','') || 'http://localhost:5000';

const MATERIAL_GROUPS = [
  { group: 'Gold', items: ['10K Gold','14K Gold','18K Gold','24K Gold','White Gold','Rose Gold','Gold Plated'] },
  { group: 'Silver & Other', items: ['Silver','Silver Plated','Platinum','Stainless Steel','Custom'] },
];

const CLARITY_DESC = { FL:'Flawless',IF:'Internally Flawless',VVS1:'Very Very Slightly Included 1',VVS2:'Very Very Slightly Included 2',VS1:'Very Slightly Included 1',VS2:'Very Slightly Included 2',SI1:'Slightly Included 1',SI2:'Slightly Included 2',I1:'Included 1',I2:'Included 2',I3:'Included 3','N/A':'Not Applicable' };
const CUT_SCORE = { Excellent:5,'Very Good':4,Good:3,Fair:2,Poor:1,'N/A':0 };

function DiamondBadge({ label, value }) {
  if (!value || value === 'N/A') return null;
  return (
    <div className="diamond-badge">
      <span className="db-label">{label}</span>
      <span className="db-value">{value}</span>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then(r => {
        setProduct(r.data.product);
        setSelectedMaterial(r.data.product.material || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) { toast.error('Please select a size'); return; }
    addToCart(product._id, qty, selectedSize);
  };

  const handleWhatsApp = () => {
    if (product.sizes?.length > 0 && !selectedSize) { toast.error('Please select a size first'); return; }
    whatsappProduct({ product, selectedMaterial, selectedSize, quantity: qty });
  };

  const handleReview = async e => {
    e.preventDefault();
    if (!user) { toast.error('Please log in to leave a review'); return; }
    setSubmittingReview(true);
    try {
      const { data } = await api.post(`/products/${product._id}/reviews`, reviewForm);
      setProduct(data.product);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmittingReview(false); }
  };

  const getImgSrc = (filename) => {
    if (!filename) return null;
    if (filename.startsWith('http')) return filename;
    return `${API_BASE}/uploads/${filename}`;
  };

  if (loading) return <div className="page-loading"><div className="spinner"/></div>;
  if (!product) return <div className="not-found container"><h2>Product not found</h2><Link to="/shop" className="btn-primary" style={{marginTop:'1rem'}}>Back to Shop</Link></div>;

  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : null;
  const hasDiamond = product.diamond && Object.values(product.diamond).some(v => v && v !== 'N/A' && v !== '');
  const hasImages = product.images && product.images.length > 0;
  const materialsToShow = product.availableMaterials?.length > 0 ? product.availableMaterials : [product.material];

  return (
    <div className="product-detail container" style={{ paddingTop:'5rem', paddingBottom:'5rem' }}>
      <nav className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <Link to={`/shop?type=${product.type}`}>{product.type}s</Link> / <span>{product.name}</span>
      </nav>

      <div className="detail-grid">
        {/* ── IMAGES ── */}
        <div className="detail-image-wrap">
          {product.badge && <span className="product-badge">{product.badge}</span>}
          {discount && <span className="product-discount">-{discount}%</span>}

          <div className="detail-main-image">
            {hasImages ? (
              <img src={getImgSrc(product.images[activeImg])} alt={product.name} className="product-img-real"/>
            ) : (
              <div className="product-img-placeholder">
                <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
                  <polygon points="70,8 130,45 110,118 30,118 10,45" fill="rgba(201,168,76,0.08)" stroke="#C9A84C" strokeWidth="1.5"/>
                  <polygon points="70,8 130,45 70,34" fill="rgba(201,168,76,0.2)" stroke="#C9A84C" strokeWidth="0.6"/>
                  <polygon points="70,8 10,45 70,34" fill="rgba(201,168,76,0.1)" stroke="#C9A84C" strokeWidth="0.6"/>
                  <text x="70" y="82" fontFamily="'Bebas Neue',sans-serif" fontSize="18" fill="#C9A84C" textAnchor="middle" letterSpacing="4">WYW</text>
                  <circle cx="70" cy="8" r="4" fill="#E8C96A"/>
                </svg>
              </div>
            )}
          </div>

          {hasImages && product.images.length > 1 && (
            <div className="detail-thumbs">
              {product.images.map((img, i) => (
                <button key={i} className={`thumb-btn ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                  <img src={getImgSrc(img)} alt={`view ${i+1}`}/>
                </button>
              ))}
            </div>
          )}

          <div className="detail-image-footer">
            <span>💎 Premium Quality</span>
            <span>🌏 Worldwide Shipping</span>
            <span>✅ Authenticity Guaranteed</span>
          </div>
        </div>

        {/* ── INFO ── */}
        <div className="detail-info">
          <p className="detail-type">{product.type}</p>
          <h1 className="detail-name">{product.name}</h1>

          {product.ratings.count > 0 && (
            <div className="detail-rating">
              <span className="stars">{'★'.repeat(Math.round(product.ratings.average))}{'☆'.repeat(5-Math.round(product.ratings.average))}</span>
              <span className="rating-num">{product.ratings.average}</span>
              <span className="rating-count">({product.ratings.count} review{product.ratings.count!==1?'s':''})</span>
            </div>
          )}

          <div className="detail-pricing">
            <span className="price-display" style={{fontSize:'2.2rem'}}>₹{product.price.toLocaleString()}</span>
            {product.comparePrice && (
              <><span className="price-compare">₹{product.comparePrice.toLocaleString()}</span>
              <span className="discount-pill">Save {discount}%</span></>
            )}
          </div>

          <p className="detail-desc">{product.description}</p>

          {/* ── DIAMOND 4Cs ── */}
          {hasDiamond && (
            <div className="diamond-section">
              <h3 className="diamond-title">💎 Stone Details</h3>
              <div className="diamond-grid">
                <DiamondBadge label="Stone" value={product.diamond.stoneType}/>
                <DiamondBadge label="Carat" value={product.diamond.caratWeight}/>
                <DiamondBadge label="Cut" value={product.diamond.cut}/>
                <DiamondBadge label="Color" value={product.diamond.color !== 'N/A' ? `Grade ${product.diamond.color}` : null}/>
                <DiamondBadge label="Clarity" value={product.diamond.clarity !== 'N/A' ? `${product.diamond.clarity} — ${CLARITY_DESC[product.diamond.clarity]||''}` : null}/>
              </div>
              {product.diamond.cut !== 'N/A' && (
                <div className="cut-meter">
                  <span className="cut-label">Cut Quality</span>
                  <div className="cut-bar-wrap">
                    {['Poor','Fair','Good','Very Good','Excellent'].map((c,i) => (
                      <div key={c} className={`cut-seg ${CUT_SCORE[product.diamond.cut] > i ? 'active' : ''}`}/>
                    ))}
                  </div>
                  <span className="cut-val">{product.diamond.cut}</span>
                </div>
              )}
            </div>
          )}

          {/* ── MATERIAL SELECTOR ── */}
          {materialsToShow.length > 0 && (
            <div className="material-section">
              <p className="selector-label">Material — <span className="selected-val">{selectedMaterial}</span></p>
              <div className="material-options">
                {materialsToShow.map(m => (
                  <button key={m}
                    className={`material-btn ${selectedMaterial === m ? 'active' : ''}`}
                    onClick={() => setSelectedMaterial(m)}
                    title={m}
                  >
                    <span className="material-dot" style={{background: materialColor(m)}}/>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── SIZE SELECTOR ── */}
          {product.sizes?.length > 0 && (
            <div className="size-section">
              <p className="selector-label">Size — <span className="selected-val">{selectedSize || 'Select'}</span></p>
              <div className="size-options">
                {product.sizes.map(s => (
                  <button key={s}
                    className={`size-btn ${selectedSize === s ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* ── STOCK & META ── */}
          <div className="detail-meta">
            <div className="meta-row"><span>Material</span><span>{selectedMaterial || product.material}</span></div>
            <div className="meta-row"><span>Stock</span><span className={product.stock > 0 ? 'in-stock' : 'out-stock'}>{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</span></div>
            {product.sold > 0 && <div className="meta-row"><span>Sold</span><span>{product.sold}+ pieces</span></div>}
          </div>

          {/* ── QTY + ADD TO CART ── */}
          <div className="qty-row">
            <div className="qty-ctrl">
              <button onClick={() => setQty(q => Math.max(1, q-1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q+1))}>+</button>
            </div>
            <button className="btn-primary add-cart-btn" onClick={handleAddToCart} disabled={product.stock === 0} style={{flex:1,justifyContent:'center'}}>
              {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>

          {/* ── WHATSAPP BUTTONS ── */}
          <div className="whatsapp-actions">
            <button className="wa-btn wa-enquire" onClick={handleWhatsApp}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Enquire on WhatsApp
            </button>
            <button className="wa-btn wa-order" onClick={handleWhatsApp}>
              Order via WhatsApp
            </button>
          </div>

          <div className="detail-trust">
            {['Free shipping on orders ₹999+','Worldwide shipping available','Quality guaranteed','Easy returns within 7 days'].map(t => (
              <div key={t} className="trust-item">✓ {t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── REVIEWS ── */}
      <div className="reviews-section">
        <div className="section-label">Customer Feedback</div>
        <h2 className="section-title" style={{marginBottom:'2rem'}}>Reviews</h2>
        <div className="reviews-layout">
          <div className="reviews-list">
            {product.reviews.length === 0
              ? <p style={{color:'var(--muted)'}}>No reviews yet. Be the first!</p>
              : product.reviews.map((r,i) => (
                <div key={i} className="review-card">
                  <div className="review-header">
                    <span className="review-name">{r.name}</span>
                    <span className="stars" style={{fontSize:'0.85rem'}}>{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="review-comment">{r.comment}</p>
                  <p className="review-date">{new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                </div>
              ))
            }
          </div>
          <div className="review-form-wrap">
            <h3 className="review-form-title">Leave a Review</h3>
            {user ? (
              <form onSubmit={handleReview}>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div className="star-picker">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button"
                        className={`star-pick ${reviewForm.rating >= n ? 'active' : ''}`}
                        onClick={() => setReviewForm(f => ({...f, rating:n}))}
                      >★</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Comment</label>
                  <textarea className="form-textarea" value={reviewForm.comment}
                    onChange={e => setReviewForm(f => ({...f, comment:e.target.value}))}
                    placeholder="Share your experience..." required/>
                </div>
                <button type="submit" className="btn-primary" style={{width:'100%',justifyContent:'center'}} disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="review-login-prompt">
                <p>Please <Link to="/login">log in</Link> to leave a review.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function materialColor(m) {
  const colors = { '10K Gold':'#b8860b','14K Gold':'#c9a84c','18K Gold':'#d4a017','24K Gold':'#ffd700','White Gold':'#e8e8e8','Rose Gold':'#b76e79','Gold Plated':'#c9a84c','Silver':'#c0c0c0','Silver Plated':'#aaa','Platinum':'#e5e4e2','Stainless Steel':'#888','Custom':'linear-gradient(135deg,#c9a84c,#c0c0c0)' };
  return colors[m] || '#888';
}
