import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Package, Truck, Calendar, CheckCircle2, Clock, Sparkles, MapPin } from 'lucide-react';

export default function OrdersPage({ onOpenAIChat }) {
  const { token, user } = useContext(AuthContext);
  const location = useLocation();
  const newOrderNumber = location.state ? location.state.newOrderNumber : null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('/api/orders/myorders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load orders', err);
        setLoading(false);
      });
  }, [token]);

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <Package size={40} color="#2563eb" style={{ marginBottom: '1rem' }} />
        <h2>Please Sign In to View Your Orders</h2>
        <p style={{ color: 'var(--text-muted)' }}>You must be logged in to view your live uniform order history.</p>
      </div>
    );
  }

  return (
    <div className="orders-page animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>My Uniform Orders</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
        Track your live shipments, view item details, or query order updates directly with our AI Support Assistant.
      </p>

      {newOrderNumber && (
        <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#14532d', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CheckCircle2 size={22} color="#16a34a" />
          <div>
            <strong>Order Placed Successfully!</strong> Order Number: <code>{newOrderNumber}</code> has been recorded in our MongoDB database.
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading your orders...</div>
      ) : orders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((ord) => (
            <div
              key={ord._id}
              style={{
                backgroundColor: 'white',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
              }}
            >
              {/* Order Header */}
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Order Reference</span>
                  <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--secondary)' }}>
                    {ord.orderNumber}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Placed Date</span>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Estimated Delivery</span>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#0284c7' }}>
                    {ord.estimatedDelivery}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className={`badge badge-${(ord.orderStatus || 'processing').toLowerCase().replace(/\s+/g, '-')}`}>
                    {ord.orderStatus}
                  </span>

                  <button
                    onClick={onOpenAIChat}
                    className="btn-secondary"
                    style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', gap: '0.35rem' }}
                    title="Track or ask AI about this order"
                  >
                    <Sparkles size={14} color="#2563eb" /> Track via AI
                  </button>
                </div>
              </div>

              {/* Order Progress Bar */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#16a34a' }}>✓ Order Confirmed</span>
                  <span style={{ color: ord.orderStatus === 'Shipped' || ord.orderStatus === 'Delivered' ? '#16a34a' : 'var(--text-muted)' }}>
                    {ord.orderStatus === 'Shipped' || ord.orderStatus === 'Delivered' ? '✓ Dispatched' : '• Preparing'}
                  </span>
                  <span style={{ color: ord.orderStatus === 'Delivered' ? '#16a34a' : 'var(--text-muted)' }}>
                    {ord.orderStatus === 'Delivered' ? '✓ Delivered' : '• Out for Delivery'}
                  </span>
                </div>
                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #2563eb, #10b981)',
                    width: ord.orderStatus === 'Delivered' ? '100%' : ord.orderStatus === 'Shipped' ? '65%' : '30%',
                    transition: '0.5s ease',
                  }}></div>
                </div>
              </div>

              {/* Items List */}
              <div style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.25rem' }}>
                  {ord.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {item.image && (
                        <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Size: <strong>{item.size}</strong> • Qty: {item.quantity}
                        </div>
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Details */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Carrier: </span>
                    <strong>{ord.carrier}</strong>
                    {ord.trackingNumber && <span> (Tracking: <code>{ord.trackingNumber}</code>)</span>}
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Total Amount: </span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>${ord.totalAmount.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <Package size={36} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
          <h3>No Orders Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>You haven't placed any school uniform orders yet.</p>
        </div>
      )}
    </div>
  );
}
