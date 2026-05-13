import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import './ShopPage.css';

const TYPES = ['All', 'Chain', 'Pendant', 'Ring', 'Bracelet', 'Earring', 'Grillz'];
const SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const type = searchParams.get('type') || 'All';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, page, limit: 12 });
      if (type !== 'All') params.set('type', type);
      if (search) params.set('search', search);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch {}
    setLoading(false);
  }, [type, sort, page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    if (key !== 'page') next.set('page', 1);
    setSearchParams(next);
  };

  return (
    <div className="shop-page container" style={{ paddingTop: '5rem' }}>
      <div className="shop-header">
        <div>
          <div className="section-label">All Products</div>
          <h1 className="section-title">Shop The Collection</h1>
        </div>
        <div className="shop-search">
          <input
            type="text" className="form-input" placeholder="Search jewellery..."
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchProducts()}
          />
        </div>
      </div>

      <div className="shop-controls">
        <div className="type-filters">
          {TYPES.map(t => (
            <button key={t}
              className={`type-btn ${type === t ? 'active' : ''}`}
              onClick={() => setParam('type', t)}
            >{t}</button>
          ))}
        </div>
        <select className="form-select sort-select" value={sort} onChange={e => setParam('sort', e.target.value)}>
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="product-grid-4">
          {[...Array(8)].map((_,i) => <div key={i} className="product-skeleton" style={{aspectRatio:'1.3'}}/>)}
        </div>
      ) : products.length === 0 ? (
        <div className="shop-empty">
          <p>No products found. Try a different filter.</p>
        </div>
      ) : (
        <>
          <div className="product-grid-4">
            {products.map(p => <ProductCard key={p._id} product={p}/>)}
          </div>
          {pagination.pages > 1 && (
            <div className="pagination">
              {[...Array(pagination.pages)].map((_,i) => (
                <button key={i}
                  className={`page-btn ${page === i+1 ? 'active' : ''}`}
                  onClick={() => setParam('page', i+1)}
                >{i+1}</button>
              ))}
            </div>
          )}
          <p className="result-count">{pagination.total} product{pagination.total !== 1 ? 's' : ''} found</p>
        </>
      )}
    </div>
  );
}
