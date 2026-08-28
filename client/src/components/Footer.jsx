import React from 'react';
import { GraduationCap, Sparkles, Heart } from 'lucide-react';

export default function Footer({ onOpenAIChat }) {
  return (
    <footer style={{
      backgroundColor: '#0f172a',
      color: '#94a3b8',
      padding: '3rem 1.5rem 2rem',
      marginTop: 'auto',
      borderTop: '1px solid #1e293b',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'white', marginBottom: '1rem' }}>
            <div style={{ background: '#2563eb', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
              <GraduationCap size={20} color="white" />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>ShopMy<span style={{ color: '#60a5fa' }}>Uniform</span></span>
          </div>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1rem' }}>
            Official MERN Stack E-Commerce & AI-Powered Customer Support Agent for School Uniforms.
          </p>
        </div>

        <div>
          <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Support Capabilities</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
            <li>• Live MongoDB Order Tracking ("Where is my order?")</li>
            <li>• Real-Time Product Stock Query ("White shirts Grade 7")</li>
            <li>• Size Inventory Breakdown ("Available sizes")</li>
            <li>• Policy RAG Grounding (Delivery & Exchange rules)</li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Need Help?</h4>
          <button
            onClick={onOpenAIChat}
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
          >
            <Sparkles size={16} /> Open AI Support Chat
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', borderTop: '1px solid #1e293b', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem' }}>
        <div>© 2026 ShopMyUniform. All rights reserved. Built with MERN Stack + AI Agent RAG Architecture.</div>
      </div>
    </footer>
  );
}
