import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

export default function CartPage({ onOpenAIChat }) {
  const { cartItems, removeFromCart, updateQuantity, totalAmount, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: '#eff6ff', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <ShoppingBag size={40} color="#2563eb" />
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Your Shopping Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Explore our certified school uniform catalog or ask our AI Support Assistant for sizing advice!
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" className="btn-primary">
            <ArrowLeft size={16} /> Browse Uniforms
          </Link>
          <button onClick={onOpenAIChat} className="btn-secondary">
            <Sparkles size={16} /> Ask AI Assistant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Shopping Cart ({cartItems.length} items)</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cartItems.map((item, idx) => (
            <div
              key={`${item.productId}-${item.size}`}
              style={{
                display: 'flex',
                gap: '1rem',
                backgroundColor: 'white',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                alignItems: 'center',
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.2rem' }}>{item.name}</h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  School: {item.schoolName || 'Approved Standard'} • Size: <strong style={{ color: 'var(--text-main)' }}>{item.size}</strong>
                </div>
                <div style={{ fontWeight: '800', color: 'var(--primary-light)' }}>
                  ${item.unitPrice.toFixed(2)}
                </div>
              </div>

              {/* Quantity Controls */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, item.size, -1)}
                  style={{ padding: '0.3rem 0.6rem', background: '#f8fafc', fontWeight: '700' }}
                >
                  -
                </button>
                <span style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem', fontWeight: '700' }}>
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, item.size, 1)}
                  style={{ padding: '0.3rem 0.6rem', background: '#f8fafc', fontWeight: '700' }}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => removeFromCart(item.productId, item.size)}
                style={{ background: 'none', color: '#ef4444', padding: '0.4rem' }}
                title="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button
            onClick={clearCart}
            style={{ background: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', alignSelf: 'flex-start', border: 'none', textDecoration: 'underline' }}
          >
            Clear entire cart
          </button>
        </div>

        {/* Order Summary Box */}
        <div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-md)',
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Order Summary</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>${totalAmount.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
              <span>School Delivery:</span>
              <span style={{ fontWeight: '700', color: '#16a34a' }}>FREE</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', color: 'var(--text-muted)' }}>
              <span>Doorstep Size Swap Guarantee:</span>
              <span style={{ fontWeight: '700', color: '#16a34a' }}>Included</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Total:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                ${totalAmount.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1rem' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={16} color="#16a34a" /> 256-Bit SSL Encrypted Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
