import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle2, Truck, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';

export default function CheckoutPage({ onOpenAIChat }) {
  const { cartItems, totalAmount, clearCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [street, setStreet] = useState(user && user.shippingAddress ? user.shippingAddress.street || '742 Evergreen Terrace' : '742 Evergreen Terrace');
  const [city, setCity] = useState(user && user.shippingAddress ? user.shippingAddress.city || 'Springfield' : 'Springfield');
  const [state, setState] = useState(user && user.shippingAddress ? user.shippingAddress.state || 'IL' : 'IL');
  const [pincode, setPincode] = useState(user && user.shippingAddress ? user.shippingAddress.pincode || '62704' : '62704');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card / Debit Card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>No items in cart to checkout</h2>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '1rem' }}>
          Back to Catalog
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please login to complete your order creation.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems,
          shippingAddress: { street, city, state, pincode },
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        clearCart();
        navigate('/orders', { state: { newOrderNumber: data.orderNumber } });
      } else {
        setError(data.message || 'Order creation failed');
      }
    } catch (err) {
      setError('Network error while placing order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Checkout & Order Creation</h1>

      {!token && (
        <div style={{ backgroundColor: '#fffbebfb', border: '1px solid #fde68a', color: '#b45309', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          🔒 <strong>Note:</strong> You are currently placing an order as Guest. Please sign in so your order will automatically link to your AI Customer Support account context!
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Shipping Information Form */}
        <div style={{ backgroundColor: 'white', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={20} color="#2563eb" /> Delivery Address
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>Street Address</label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>State / Region</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>Zip / Pincode</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CreditCard size={16} /> Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
              >
                <option value="Credit Card / Debit Card">Credit Card / Debit Card (Mock)</option>
                <option value="UPI / Net Banking">UPI / Net Banking (Mock)</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>
          </div>
        </div>

        {/* Order Items & Submit */}
        <div>
          <div style={{ backgroundColor: 'white', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Review Items</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {cartItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span>{item.name} ({item.size}) x{item.quantity}</span>
                  <span style={{ fontWeight: '700' }}>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Total Amount:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>${totalAmount.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent"
              style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1rem' }}
            >
              {loading ? 'Creating Order...' : 'Complete & Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
