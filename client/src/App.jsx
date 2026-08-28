import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatWidget from './components/AIChatWidget';

import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const toggleAIChat = () => {
    setIsAIChatOpen((prev) => !prev);
  };

  const openAIChat = () => {
    setIsAIChatOpen(true);
  };

  return (
    <div className="app-container">
      <Navbar onOpenAIChat={openAIChat} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage onOpenAIChat={openAIChat} />} />
          <Route path="/product/:id" element={<ProductDetailPage onOpenAIChat={openAIChat} />} />
          <Route path="/cart" element={<CartPage onOpenAIChat={openAIChat} />} />
          <Route path="/checkout" element={<CheckoutPage onOpenAIChat={openAIChat} />} />
          <Route path="/orders" element={<OrdersPage onOpenAIChat={openAIChat} />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>

      <Footer onOpenAIChat={openAIChat} />

      <AIChatWidget isOpen={isAIChatOpen} onClose={toggleAIChat} />
    </div>
  );
}
