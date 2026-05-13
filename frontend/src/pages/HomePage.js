import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const TICKER_ITEMS = [
  'Luxury Jewellery',
  'Premium Craftsmanship',
  'Custom Designs',
  'Elegant Collection',
  'SHREEVA',
  'Surat · Gujarat',
  'Worldwide Shipping',
  'Exclusive Pieces',
  'Since 2018'
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // First try featured products
        const res = await api.get('/products?featured=true&limit=4');

        if (res.data.products && res.data.products.length > 0) {
          setFeatured(res.data.products);
        } else {
          // Fallback latest products
          const fallback = await api.get('/products?sort=newest&limit=4');
          setFeatured(fallback.data.products || []);
        }
      } catch {
        try {
          const fallback = await api.get('/products?limit=4');
          setFeatured(fallback.data.products || []);
        } catch {}
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="home">

      {/* HERO */}
      <section className="hero">

        <div className="hero-left fade-in">

          <div className="hero-tag">
            ✨ SHREEVA · Since 2018
          </div>

          <h1>
            SHREE<span className="gold-word">VA</span>
          </h1>

          <p className="hero-sub">
            Elegant luxury jewellery crafted for those who appreciate
            timeless style and premium craftsmanship.
            Exclusive designs. Worldwide shipping.
          </p>

          <div className="hero-actions">
            <Link to="/shop" className="btn-primary">
              Shop Collection
            </Link>

            <Link to="/custom" className="btn-ghost">
              Custom Order
            </Link>
          </div>

          <div className="hero-stats">
            {[
              ['40K+', 'Clients'],
              ['7+', 'Years Excellence'],
              ['∞', 'Worldwide Ship']
            ].map(([n, l]) => (
              <div key={l} className="hero-stat">
                <div className="hero-stat-num">{n}</div>
                <div className="hero-stat-label">{l}</div>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT SIDE LOGO */}
        <div className="hero-right">

          <div className="hero-glow" />

          {/* SHREEVA ELEGANT SVG LOGO */}
          <svg
            className="hero-diamond"
            width="320"
            height="320"
            viewBox="0 0 320 320"
            fill="none"
          >

            {/* Outer Ring */}
            <circle
              cx="160"
              cy="160"
              r="120"
              stroke="#C9A84C"
              strokeWidth="1.5"
              fill="rgba(201,168,76,0.04)"
            />

            {/* Inner Ring */}
            <circle
              cx="160"
              cy="160"
              r="95"
              stroke="rgba(201,168,76,0.4)"
              strokeWidth="1"
            />

            {/* Decorative Top Diamond */}
            <polygon
              points="160,55 175,75 160,95 145,75"
              fill="#C9A84C"
              opacity="0.9"
            />

            {/* Main Brand Name */}
            <text
              x="160"
              y="150"
              fontFamily="'Bebas Neue', sans-serif"
              fontSize="42"
              fill="#C9A84C"
              textAnchor="middle"
              letterSpacing="8"
            >
              SHREEVA
            </text>

            {/* Luxury Line */}
            <line
              x1="100"
              y1="175"
              x2="220"
              y2="175"
              stroke="#C9A84C"
              strokeWidth="1"
              opacity="0.5"
            />

            {/* Subtitle */}
            <text
              x="160"
              y="200"
              fontFamily="'Barlow Condensed', sans-serif"
              fontSize="12"
              fill="#888"
              textAnchor="middle"
              letterSpacing="4"
            >
              LUXURY JEWELLERY
            </text>

            {/* Decorative Dots */}
            {[70, 100, 130, 160, 190, 220, 250].map((x, i) => (
              <circle
                key={i}
                cx={x}
                cy="235"
                r={i === 3 ? 4 : 2}
                fill="#C9A84C"
                opacity={i === 3 ? 1 : 0.5}
              />
            ))}

          </svg>

          {/* Floating Particles */}
          <div className="hero-particles">
            {[...Array(6)].map((_, i) => (
              <span key={i} className={`particle p${i + 1}`}>
                ✦
              </span>
            ))}
          </div>

        </div>

      </section>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-track">

          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="ticker-item">
              {item}
              <span className="ticker-dot" />
            </span>
          ))}

        </div>
      </div>

      {/* FEATURED PRODUCTS */}
      <section className="section container">

        <div className="section-header">

          <div>
            <div className="section-label">
              Fresh Drops
            </div>

            <h2 className="section-title">
              Shop The Collection
            </h2>
          </div>

          <Link to="/shop" className="section-link">
            View All →
          </Link>

        </div>

        {loading ? (

          <div className="product-grid-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="product-skeleton" />
            ))}
          </div>

        ) : featured.length > 0 ? (

          <div className="product-grid-4">
            {featured.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

        ) : (

          <div className="no-products-home">

            <p>No products yet.</p>

            <Link
              to="/admin"
              className="btn-primary"
              style={{ marginTop: '1rem' }}
            >
              Add Products in Admin →
            </Link>

          </div>

        )}

      </section>

      {/* BRAND PILLARS */}
      <div className="brand-pillars">

        {[
          {
            icon: '💎',
            title: 'Premium Quality',
            desc: 'Every piece crafted with premium materials and meticulous attention to detail.'
          },
          {
            icon: '✂️',
            title: 'Custom Design',
            desc: 'From concept to creation — bring your unique vision to life with bespoke design.'
          },
          {
            icon: '🌏',
            title: 'Worldwide Shipping',
            desc: 'We ship globally so everyone can enjoy luxury craftsmanship.'
          }
        ].map(p => (

          <div key={p.title} className="brand-pillar">

            <span className="pillar-icon">
              {p.icon}
            </span>

            <h3 className="pillar-title">
              {p.title}
            </h3>

            <p className="pillar-desc">
              {p.desc}
            </p>

          </div>

        ))}

      </div>

      {/* ABOUT SECTION */}
      <section className="about-strip">

        <div className="about-strip-visual">

          <div className="about-glow" />

          <svg width="220" height="240" viewBox="0 0 220 240" fill="none">

            <circle
              cx="110"
              cy="120"
              r="85"
              stroke="#C9A84C"
              strokeWidth="1.3"
              fill="rgba(201,168,76,0.05)"
            />

            <text
              x="110"
              y="120"
              fontFamily="'Bebas Neue',sans-serif"
              fontSize="28"
              fill="#C9A84C"
              textAnchor="middle"
              letterSpacing="4"
            >
              SHREEVA
            </text>

            <text
              x="110"
              y="145"
              fontFamily="'Barlow Condensed',sans-serif"
              fontSize="10"
              fill="#888"
              textAnchor="middle"
              letterSpacing="3"
            >
              LUXURY JEWELLERY
            </text>

          </svg>

          <div className="about-tag">
            Est. Surat · 2018
          </div>

        </div>

        <div className="about-strip-content">

          <div className="section-label">
            Our Story
          </div>

          <h2 className="section-title">
            The Luxury.<br />
            The Craft.
          </h2>

          <p>
            <strong>SHREEVA</strong> represents timeless luxury,
            elegant craftsmanship and premium jewellery artistry.
          </p>

          <p>
            We create sophisticated jewellery pieces designed
            for individuals who value elegance, confidence
            and exclusivity.
          </p>

          <blockquote className="about-quote">
            "Elegance designed to shine forever."
          </blockquote>

          <Link
            to="/about"
            className="btn-primary"
            style={{ marginTop: '1.5rem' }}
          >
            Learn More
          </Link>

        </div>

      </section>

      {/* CUSTOM CTA */}
      <section className="custom-cta">

        <div className="custom-cta-inner">

          <div
            className="section-label"
            style={{ justifyContent: 'center' }}
          >
            Bespoke Service
          </div>

          <h2
            className="section-title"
            style={{
              textAlign: 'center',
              marginBottom: '1rem'
            }}
          >
            Make It Yours
          </h2>

          <p
            style={{
              textAlign: 'center',
              color: 'var(--muted)',
              maxWidth: 480,
              margin: '0 auto 2rem',
              lineHeight: 1.8
            }}
          >
            Turn your vision into reality.
            Create custom jewellery crafted exclusively for you.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Link to="/custom" className="btn-primary">
              Request Custom Quote
            </Link>
          </div>

        </div>

      </section>

    </div>
  );
}