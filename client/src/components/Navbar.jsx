import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import {
  ShoppingBag,
  User as UserIcon,
  School,
  LogOut,
  Package,
  Sparkles,
  Search,
  ChevronDown,
  GraduationCap
} from 'lucide-react';
import SchoolSelectorModal from './SchoolSelectorModal';
import AuthModal from './AuthModal';

export default function Navbar({ onOpenAIChat }) {
  const { user, logout, selectedSchool, selectedGrade } = useContext(AuthContext);
  const { totalCount } = useContext(CartContext);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <header className="navbar-header">
        {/* Top Notification Bar */}
        <div className="top-banner">
          <span>✨ <strong>Back to School 2026 Special:</strong> Free Doorstep Size Exchanges on all School Uniforms!</span>
          <button onClick={onOpenAIChat} className="top-ai-btn">
            <Sparkles size={14} /> Ask AI Assistant
          </button>
        </div>

        {/* Main Navbar */}
        <nav className="navbar-container">
          <Link to="/" className="navbar-brand">
            <div className="brand-icon">
              <GraduationCap size={24} color="#ffffff" />
            </div>
            <div className="brand-text">
              <span className="brand-title">ShopMy<span className="brand-highlight">Uniform</span></span>
              <span className="brand-tagline">Official School Uniform Portal</span>
            </div>
          </Link>

          {/* School Selector Button */}
          <button
            id="school-selector-btn"
            onClick={() => setShowSchoolModal(true)}
            className="school-picker-btn"
            title="Click to select your school and grade"
          >
            <School size={18} className="icon-pulse" />
            <div className="picker-info">
              <span className="picker-label">Target School</span>
              <span className="picker-value">
                {selectedSchool ? selectedSchool.name : 'Select School'}
                {selectedGrade ? ` • ${selectedGrade}` : ''}
              </span>
            </div>
            <ChevronDown size={16} />
          </button>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="nav-search-form">
            <Search size={18} className="search-icon" />
            <input
              id="nav-search-input"
              type="text"
              placeholder="Search shirts, trousers, blazers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Action Links */}
          <div className="nav-actions">
            {user ? (
              <div className="user-menu">
                <Link to="/orders" className="nav-btn-icon" title="My Orders">
                  <Package size={20} />
                  <span className="nav-link-label">Orders</span>
                </Link>
                <Link to="/profile" className="nav-btn-icon" title="My Profile">
                  <UserIcon size={20} />
                  <span className="nav-link-label">{user.name.split(' ')[0]}</span>
                </Link>
                <button onClick={logout} className="nav-logout-btn" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                id="login-modal-trigger"
                onClick={() => setShowAuthModal(true)}
                className="btn-secondary nav-login-btn"
              >
                <UserIcon size={18} /> Login / Register
              </button>
            )}

            {/* Shopping Cart Button */}
            <Link id="nav-cart-btn" to="/cart" className="cart-btn">
              <ShoppingBag size={22} />
              {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
            </Link>
          </div>
        </nav>
      </header>

      {showSchoolModal && (
        <SchoolSelectorModal onClose={() => setShowSchoolModal(false)} />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
}
