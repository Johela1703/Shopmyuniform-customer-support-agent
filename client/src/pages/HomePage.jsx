import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import {
  Sparkles,
  Filter,
  CheckCircle2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Search,
  GraduationCap
} from 'lucide-react';

export default function HomePage({ onOpenAIChat }) {
  const { selectedSchool, selectedGrade } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');

  const categories = ['All', 'Shirts', 'Trousers', 'Skirts', 'Blazers', 'Sweaters', 'PE Uniform'];

  useEffect(() => {
    setLoading(true);
    let url = '/api/products?';
    const params = new URLSearchParams();

    if (selectedSchool) {
      params.append('schoolId', selectedSchool._id);
    }
    if (selectedGrade) {
      params.append('grade', selectedGrade);
    }
    if (categoryFilter !== 'All') {
      params.append('category', categoryFilter);
    }
    if (genderFilter !== 'All') {
      params.append('gender', genderFilter);
    }
    if (searchFromUrl) {
      params.append('search', searchFromUrl);
    }

    fetch(`${url}${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch products', err);
        setLoading(false);
      });
  }, [selectedSchool, selectedGrade, categoryFilter, genderFilter, searchFromUrl]);

  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
        color: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '3rem 2.5rem',
        marginBottom: '2.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(30, 58, 138, 0.25)',
      }}>
        <div style={{ maxWidth: '640px', position: 'relative', zIndex: 2 }}>
          <span style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '0.3rem 0.8rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '1rem',
            border: '1px solid rgba(255,255,255,0.3)',
          }}>
            <GraduationCap size={16} /> Official School Dress Codes 2026
          </span>

          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1.15, marginBottom: '1rem', color: 'white' }}>
            Smart Uniform Shopping with <span style={{ color: '#60a5fa' }}>AI Assistant</span> Guidance
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#cbd5e1', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            {selectedSchool ? (
              <>Showing uniforms tailored for <strong>{selectedSchool.name}</strong> {selectedGrade ? `(${selectedGrade})` : ''}.</>
            ) : (
              <>Find certified school shirts, trousers, blazers, and PE gear. Ask our database-connected AI support for order tracking and size stock in real-time.</>
            )}
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={onOpenAIChat} className="btn-primary" style={{ padding: '0.85rem 1.6rem', fontSize: '0.95rem' }}>
              <Sparkles size={18} /> Ask AI Customer Support
            </button>
          </div>
        </div>

        {/* Feature Pills */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          marginTop: '2.5rem',
          paddingTop: '1.75rem',
          borderTop: '1px solid rgba(255,255,255,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <Truck size={20} color="#60a5fa" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>3-5 Day Delivery</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Direct to your home</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <RotateCcw size={20} color="#60a5fa" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>14-Day Free Exchange</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Doorstep size swap</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <ShieldCheck size={20} color="#60a5fa" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>100% Quality Fabric</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>School approved</div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Filter Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-light)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Filter size={16} /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.84rem',
                fontWeight: '600',
                border: categoryFilter === cat ? '2px solid var(--primary-light)' : '1px solid var(--border-light)',
                backgroundColor: categoryFilter === cat ? 'var(--primary-dark)' : 'white',
                color: categoryFilter === cat ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-muted)' }}>Gender:</span>
          {['All', 'Boys', 'Girls', 'Unisex'].map((g) => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: '600',
                border: genderFilter === g ? '2px solid var(--primary-light)' : '1px solid var(--border-light)',
                backgroundColor: genderFilter === g ? '#eff6ff' : 'white',
                color: genderFilter === g ? 'var(--primary-light)' : 'var(--text-main)',
                cursor: 'pointer',
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Title & Result Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.4rem' }}>
          {selectedSchool ? `${selectedSchool.name} Catalog` : 'All Approved Uniforms'}
        </h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Showing <strong>{products.length}</strong> items
        </span>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading products from database...
        </div>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem',
          textAlign: 'center',
          border: '1px solid var(--border-light)',
        }}>
          <Search size={36} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
          <h3>No uniforms found matching your criteria</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Try resetting your school filter or category selection. You can also ask our AI assistant for help!
          </p>
        </div>
      )}
    </div>
  );
}
