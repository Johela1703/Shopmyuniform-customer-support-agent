import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import {
  ShoppingBag,
  Check,
  School,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';

export default function ProductDetailPage({ onOpenAIChat }) {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        if (data.stockBySizes) {
          const firstInStock = Object.keys(data.stockBySizes).find((s) => data.stockBySizes[s] > 0);
          if (firstInStock) setSelectedSize(firstInStock);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load product details', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading product details...</div>;
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Product Not Found</h2>
        <Link to="/" className="btn-secondary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const sizesMap = product.stockBySizes ? Object.entries(product.stockBySizes) : [];

  return (
    <div className="product-detail-page animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: '600' }}>
        <ArrowLeft size={18} /> Back to Catalog
      </Link>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2.5rem',
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-light)',
      }}>
        {/* Product Image Gallery */}
        <div>
          <div style={{
            height: '400px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            backgroundColor: '#f1f5f9',
            border: '1px solid var(--border-light)',
          }}>
            <img
              src={product.image || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600'}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <button
            onClick={onOpenAIChat}
            style={{
              width: '100%',
              marginTop: '1.25rem',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1e40af',
              padding: '0.8rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <Sparkles size={18} color="#2563eb" /> Ask AI Assistant About This Uniform
          </button>
        </div>

        {/* Product Specs & Size Picker */}
        <div>
          {product.schoolId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <School size={16} color="#2563eb" />
              <span style={{ fontWeight: '700', color: 'var(--primary-light)', fontSize: '0.88rem' }}>
                {product.schoolId.name}
              </span>
            </div>
          )}

          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span className="badge badge-grade">{product.category}</span>
            <span className="badge badge-grade">{product.gender}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Grades: <strong>{product.applicableGrades ? product.applicableGrades.join(', ') : 'All'}</strong>
            </span>
          </div>

          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '1.5rem' }}>
            ${product.price.toFixed(2)}
          </div>

          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {product.description}
          </p>

          {/* Real-time Size Stock Grid */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
              Available Sizes & Live Inventory:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
              {sizesMap.map(([sz, count]) => {
                const isOutOfStock = count === 0;
                const isSelected = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    disabled={isOutOfStock}
                    onClick={() => setSelectedSize(sz)}
                    style={{
                      padding: '0.6rem 0.4rem',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                      border: isSelected ? '2px solid var(--primary-light)' : '1px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--primary-dark)' : isOutOfStock ? '#f1f5f9' : 'white',
                      color: isSelected ? 'white' : isOutOfStock ? '#94a3b8' : 'var(--text-main)',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{sz}</div>
                    <div style={{ fontSize: '0.7rem', marginTop: '2px', color: isSelected ? '#93c5fd' : isOutOfStock ? '#94a3b8' : '#16a34a' }}>
                      {isOutOfStock ? 'Sold Out' : `${count} in stock`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity and Add to Cart */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '0.6rem 1rem', background: '#f8fafc', fontWeight: '700' }}
              >
                -
              </button>
              <span style={{ padding: '0.6rem 1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center' }}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                style={{ padding: '0.6rem 1rem', background: '#f8fafc', fontWeight: '700' }}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className={`btn-primary ${added ? 'added' : ''}`}
              style={{ flex: 1, justifyContent: 'center', padding: '0.85rem' }}
            >
              {added ? (
                <>
                  <Check size={18} /> Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingBag size={18} /> Add Size {selectedSize} to Cart
                </>
              )}
            </button>
          </div>

          {/* Product Specifications */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
            <div><strong>Fabric Material:</strong> {product.material}</div>
            <div><strong>Washing & Care:</strong> {product.careInstructions}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
