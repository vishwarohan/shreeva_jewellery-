import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api','');

// Beautiful SVG illustrations per category
const CategorySVG = ({ type }) => {
  const svgs = {
    Chain: (
      <svg width="120" height="140" viewBox="0 0 120 140" fill="none">
        {/* Chain links */}
        {[0,1,2,3,4,5].map(i => (
          <g key={i} transform={`translate(0, ${i * 20})`}>
            <ellipse cx="60" cy="15" rx="22" ry="8" fill="none" stroke="#C9A84C" strokeWidth="3" opacity={1 - i*0.1}/>
            <ellipse cx="60" cy="15" rx="14" ry="4" fill="rgba(201,168,76,0.15)" stroke="#E8C96A" strokeWidth="1" opacity={1 - i*0.1}/>
          </g>
        ))}
        {/* Pendant drop */}
        <polygon points="60,128 72,112 48,112" fill="rgba(201,168,76,0.3)" stroke="#C9A84C" strokeWidth="1.5"/>
        <circle cx="60" cy="108" r="6" fill="rgba(201,168,76,0.4)" stroke="#E8C96A" strokeWidth="1.5"/>
      </svg>
    ),
    Pendant: (
      <svg width="120" height="140" viewBox="0 0 120 140" fill="none">
        {/* Chain top */}
        <line x1="60" y1="10" x2="60" y2="38" stroke="#C9A84C" strokeWidth="2.5" strokeDasharray="4 3"/>
        <circle cx="60" cy="8" r="5" fill="none" stroke="#C9A84C" strokeWidth="2"/>
        {/* Main pendant */}
        <circle cx="60" cy="82" r="42" fill="rgba(201,168,76,0.06)" stroke="#C9A84C" strokeWidth="1.5"/>
        <circle cx="60" cy="82" r="30" fill="rgba(201,168,76,0.1)" stroke="#C9A84C" strokeWidth="1"/>
        <circle cx="60" cy="82" r="18" fill="rgba(201,168,76,0.2)" stroke="#E8C96A" strokeWidth="1"/>
        {/* Sparkle */}
        <circle cx="60" cy="82" r="6" fill="rgba(232,201,106,0.6)"/>
        {/* WYW text */}
        <text x="60" y="115" fontFamily="'Bebas Neue',sans-serif" fontSize="11" fill="#C9A84C" textAnchor="middle" letterSpacing="3">WYW</text>
        {/* Gem dots */}
        {[[60,42],[88,57],[96,82],[88,107],[60,122],[32,107],[24,82],[32,57]].map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r="2.5" fill="#C9A84C" opacity="0.7"/>
        ))}
      </svg>
    ),
    Ring: (
      <svg width="120" height="140" viewBox="0 0 120 140" fill="none">
        {/* Ring band */}
        <ellipse cx="60" cy="95" rx="38" ry="12" fill="rgba(201,168,76,0.1)" stroke="#C9A84C" strokeWidth="2"/>
        <ellipse cx="60" cy="75" rx="38" ry="12" fill="rgba(201,168,76,0.08)" stroke="#C9A84C" strokeWidth="2"/>
        <rect x="22" y="75" width="76" height="20" fill="rgba(201,168,76,0.08)" stroke="none"/>
        <line x1="22" y1="75" x2="22" y2="95" stroke="#C9A84C" strokeWidth="2"/>
        <line x1="98" y1="75" x2="98" y2="95" stroke="#C9A84C" strokeWidth="2"/>
        {/* Center stone */}
        <polygon points="60,38 78,58 60,72 42,58" fill="rgba(201,168,76,0.35)" stroke="#E8C96A" strokeWidth="1.5"/>
        <polygon points="60,38 78,58 60,50" fill="rgba(232,201,106,0.5)" stroke="#E8C96A" strokeWidth="0.5"/>
        <polygon points="60,38 42,58 60,50" fill="rgba(201,168,76,0.3)" stroke="#E8C96A" strokeWidth="0.5"/>
        {/* Side stones */}
        {[[32,62],[88,62],[25,72],[95,72]].map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r="3" fill="rgba(201,168,76,0.5)" stroke="#C9A84C" strokeWidth="0.8"/>
        ))}
      </svg>
    ),
    Bracelet: (
      <svg width="140" height="100" viewBox="0 0 140 100" fill="none">
        {/* Bracelet arc */}
        <path d="M15,70 Q70,10 125,70" fill="none" stroke="#C9A84C" strokeWidth="10" strokeLinecap="round"/>
        <path d="M15,70 Q70,10 125,70" fill="none" stroke="#0f0f0f" strokeWidth="6" strokeLinecap="round"/>
        {/* Stones along bracelet */}
        {[[20,65],[37,40],[57,22],[83,22],[103,40],[120,65]].map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="7" fill="rgba(201,168,76,0.3)" stroke="#E8C96A" strokeWidth="1.2"/>
            <circle cx={cx} cy={cy} r="3.5" fill="rgba(232,201,106,0.6)"/>
          </g>
        ))}
        {/* Clasp */}
        <rect x="57" y="78" width="26" height="12" rx="3" fill="rgba(201,168,76,0.2)" stroke="#C9A84C" strokeWidth="1.5"/>
        <text x="70" y="88" fontFamily="'Bebas Neue',sans-serif" fontSize="7" fill="#C9A84C" textAnchor="middle" letterSpacing="1">WYW</text>
      </svg>
    ),
    Earring: (
      <svg width="120" height="130" viewBox="0 0 120 130" fill="none">
        {/* Left earring */}
        <circle cx="32" cy="20" r="7" fill="rgba(201,168,76,0.2)" stroke="#C9A84C" strokeWidth="2"/>
        <line x1="32" y1="27" x2="32" y2="45" stroke="#C9A84C" strokeWidth="2"/>
        <polygon points="32,45 42,65 22,65" fill="rgba(201,168,76,0.25)" stroke="#C9A84C" strokeWidth="1.5"/>
        <circle cx="32" cy="78" r="14" fill="rgba(201,168,76,0.15)" stroke="#C9A84C" strokeWidth="1.5"/>
        <circle cx="32" cy="78" r="7" fill="rgba(201,168,76,0.3)" stroke="#E8C96A" strokeWidth="1"/>
        {/* Right earring */}
        <circle cx="88" cy="20" r="7" fill="rgba(201,168,76,0.2)" stroke="#C9A84C" strokeWidth="2"/>
        <line x1="88" y1="27" x2="88" y2="45" stroke="#C9A84C" strokeWidth="2"/>
        <polygon points="88,45 98,65 78,65" fill="rgba(201,168,76,0.25)" stroke="#C9A84C" strokeWidth="1.5"/>
        <circle cx="88" cy="78" r="14" fill="rgba(201,168,76,0.15)" stroke="#C9A84C" strokeWidth="1.5"/>
        <circle cx="88" cy="78" r="7" fill="rgba(201,168,76,0.3)" stroke="#E8C96A" strokeWidth="1"/>
        {/* Sparkle dots */}
        <circle cx="32" cy="78" r="2.5" fill="#E8C96A"/>
        <circle cx="88" cy="78" r="2.5" fill="#E8C96A"/>
      </svg>
    ),
    Grillz: (
      <svg width="140" height="100" viewBox="0 0 140 100" fill="none">
        {/* Mouth shape */}
        <path d="M20,35 Q70,15 120,35 L120,65 Q70,80 20,65 Z" fill="rgba(201,168,76,0.08)" stroke="#C9A84C" strokeWidth="2"/>
        {/* Teeth */}
        {[28,44,58,72,86,100,112].map((x,i) => (
          <rect key={i} x={x} y="38" width="12" height="24" rx="2"
            fill={i===3 ? "rgba(201,168,76,0.4)" : "rgba(201,168,76,0.22)"}
            stroke="#E8C96A" strokeWidth="0.8"/>
        ))}
        {/* Gem on center tooth */}
        <polygon points="84,42 90,50 84,56 78,50" fill="rgba(232,201,106,0.7)" stroke="#E8C96A" strokeWidth="0.8"/>
        {/* WYW label */}
        <text x="70" y="92" fontFamily="'Bebas Neue',sans-serif" fontSize="12" fill="#C9A84C" textAnchor="middle" letterSpacing="4">GRILLZ</text>
      </svg>
    ),
  };
  return (
    <div className="category-svg-wrap" style={{ filter:'drop-shadow(0 0 16px rgba(201,168,76,0.35))' }}>
      {svgs[type] || svgs.Pendant}
    </div>
  );
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  const hasImage = product.images && product.images.length > 0 && !imgError;
  const imgSrc = hasImage
    ? (product.images[0].startsWith('http') ? product.images[0] : `${API_BASE}/uploads/${product.images[0]}`)
    : null;

  return (
    <div className="product-card">
      <Link to={`/product/${product.slug || product._id}`} className="product-img-wrap">
        {product.badge && <span className="product-badge">{product.badge}</span>}
        {discount && <span className="product-discount">-{discount}%</span>}
        <div className="product-img">
          {hasImage ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="product-real-img"
              onError={() => setImgError(true)}
            />
          ) : (
            <CategorySVG type={product.type} />
          )}
        </div>
      </Link>
      <div className="product-info">
        <p className="product-type">{product.type}</p>
        <Link to={`/product/${product.slug || product._id}`} className="product-name">
          {product.name}
        </Link>
        {product.ratings?.count > 0 && (
          <div className="product-rating">
            <span className="stars">{'★'.repeat(Math.round(product.ratings.average))}</span>
            <span className="rating-count">({product.ratings.count})</span>
          </div>
        )}
        <div className="product-footer">
          <div className="product-prices">
            <span className="price-display">₹{product.price.toLocaleString()}</span>
            {product.comparePrice && (
              <span className="price-compare">₹{product.comparePrice.toLocaleString()}</span>
            )}
          </div>
          <button
            className="product-cta"
            onClick={() => addToCart(product._id)}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Sold Out' : 'Add +'}
          </button>
        </div>
      </div>
    </div>
  );
}