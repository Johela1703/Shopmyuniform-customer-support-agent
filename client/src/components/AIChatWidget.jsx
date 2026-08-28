import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Package,
  Truck,
  RotateCcw,
  Ruler,
  Database,
  ChevronRight,
  Minimize2,
  ExternalLink
} from 'lucide-react';

export default function AIChatWidget({ isOpen, onClose }) {
  const { user, selectedSchool, selectedGrade } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello! I am **ShopMyUniform AI Support Agent**. 🏫\n\nI am connected directly to our MongoDB database to retrieve your live orders, size availability, and uniform stock. How can I help you today?`,
      sources: ['MongoDB Live Database Connected'],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    { label: '📦 Where is my order?', query: 'Where is my order?' },
    { label: '👕 White shirts Grade 7', query: 'Do you have white shirts for Grade 7?' },
    { label: '📏 Available sizes', query: 'Which sizes are available for navy blue trousers?' },
    { label: '🚚 Delivery time', query: 'How long will delivery take?' },
    { label: '🔄 Exchange policy', query: 'I want to exchange my shirt. What is the process?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('smu_token')
            ? { Authorization: `Bearer ${localStorage.getItem('smu_token')}` }
            : {}),
        },
        body: JSON.stringify({
          message: textToSend,
          schoolId: selectedSchool ? selectedSchool._id : null,
          grade: selectedGrade,
        }),
      });

      const data = await res.json();

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.reply || "I'm sorry, I couldn't process that request right now.",
        sources: data.retrievedSources || [],
        orderData: data.orderData || [],
        productData: data.productData || [],
        intent: data.intent,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: '⚠️ Network connection issue while querying database. Please try again.',
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        id="ai-chat-floating-btn"
        onClick={onClose}
        className="ai-floating-trigger"
        title="Open AI Support Agent"
      >
        <div className="trigger-pulse"></div>
        <Sparkles size={24} />
        <span className="trigger-label">AI Support</span>
      </button>
    );
  }

  return (
    <div className="ai-chat-window animate-fade-in">
      {/* Chat Window Header */}
      <div className="ai-chat-header">
        <div className="header-agent-info">
          <div className="agent-avatar">
            <Bot size={22} color="#ffffff" />
          </div>
          <div>
            <div className="agent-name">ShopMyUniform AI Assistant</div>
            <div className="agent-status">
              <span className="online-dot"></span> Database Grounded RAG
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="chat-header-btn" onClick={onClose}>
            <Minimize2 size={18} />
          </button>
        </div>
      </div>

      {/* Quick Suggestion Pills */}
      <div className="chat-suggestions-bar">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.query)}
            className="suggestion-pill"
            disabled={loading}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages Body */}
      <div className="ai-chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message-row ${msg.sender === 'user' ? 'message-user' : 'message-bot'}`}
          >
            {msg.sender === 'bot' && (
              <div className="msg-avatar bot-avatar">
                <Bot size={16} />
              </div>
            )}

            <div className="msg-bubble-wrap">
              <div className="msg-bubble">
                <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>

                {/* Embedded Order Card Widget */}
                {msg.orderData && msg.orderData.length > 0 && (
                  <div className="embedded-cards-container">
                    {msg.orderData.map((ord) => (
                      <div key={ord._id || ord.orderNumber} className="chat-order-card">
                        <div className="card-header-row">
                          <span className="order-no"><Package size={14} /> {ord.orderNumber}</span>
                          <span className={`badge badge-${(ord.orderStatus || 'processing').toLowerCase().replace(/\s+/g, '-')}`}>
                            {ord.orderStatus}
                          </span>
                        </div>
                        <div className="order-items-preview">
                          {ord.items && ord.items.map((it, i) => (
                            <div key={i} className="item-row">
                              <span>• {it.name} ({it.size}) x{it.quantity}</span>
                              <span>${(it.unitPrice * it.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="order-footer-info">
                          <span>Est. Delivery: <strong>{ord.estimatedDelivery}</strong></span>
                          <span>Total: <strong>${ord.totalAmount.toFixed(2)}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Embedded Product Card Widget */}
                {msg.productData && msg.productData.length > 0 && (
                  <div className="embedded-cards-container">
                    {msg.productData.map((prod) => (
                      <div key={prod._id} className="chat-product-card">
                        <img src={prod.image} alt={prod.name} className="card-img" />
                        <div className="card-info">
                          <div className="card-title">{prod.name}</div>
                          <div className="card-meta">${prod.price.toFixed(2)} • {prod.gender}</div>
                          <div className="card-sizes">
                            Sizes: {prod.stockBySizes ? Object.keys(prod.stockBySizes).join(', ') : 'S, M, L'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Retrieved Database Sources Indicator */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="sources-tag">
                    <Database size={11} /> {msg.sources[0]}
                  </div>
                )}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="msg-avatar user-avatar">
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-message-row message-bot">
            <div className="msg-avatar bot-avatar">
              <Bot size={16} />
            </div>
            <div className="msg-bubble typing-bubble">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '0.5rem' }}>Querying MongoDB...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="ai-chat-input-form"
      >
        <input
          id="ai-chat-input"
          type="text"
          placeholder="Ask AI about orders, products, sizes, delivery..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          id="ai-chat-send-btn"
          type="submit"
          disabled={!input.trim() || loading}
          className="send-btn"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
