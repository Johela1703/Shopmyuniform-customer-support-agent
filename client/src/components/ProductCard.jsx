import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { ShoppingBag, Check, Info, School } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const [selectedSize, setSelectedSize] = useState('M');
  const [added, setAdded] = useState(false);

  const availableSizes = product.stockBySizes
    ? Object.keys(product.stockBySizes)
    : ['S', 'M', 'L', 'XL'];

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, selectedSize, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="product-card animate-fade-in">
      <Link to={`/product/${product._id}`} className="product-image-wrap">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600'}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        {product.schoolId && (
          <span className="product-school-tag">
            <School size={12} /> {product.schoolId.code || product.schoolId.name}
          </span>
        )}
      </Link>

      <div className="product-details">
        <div className="product-category-row">
          <span className="product-category">{product.category}</span>
          <span className="badge badge-grade">{product.gender}</span>
        </div>

        <Link to={`/product/${product._id}`}>
          <h3 className="product-title">{product.name}</h3>
        </Link>

        {product.applicableGrades && product.applicableGrades.length > 0 && (
          <div className="product-grades">
            Grades: {product.applicableGrades.join(', ')}
          </div>
        )}

        {/* Size Selection Pill Bar */}
        <div className="size-selector-bar">
          <span className="size-label">Select Size:</span>
          <div className="size-buttons">
            {availableSizes.map((sz) => {
              const stock = product.stockBySizes ? product.stockBySizes[sz] : 10;
              const isOutOfStock = stock === 0;
              return (
                <button
                  key={sz}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setSelectedSize(sz)}
                  className={`size-btn ${selectedSize === sz ? 'active' : ''} ${isOutOfStock ? 'disabled' : ''}`}
                  title={isOutOfStock ? `${sz} is Out of Stock` : `${sz} (${stock} in stock)`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>

        <div className="product-footer-row">
          <div className="product-price">
            <span className="price-symbol">$</span>
            <span className="price-val">{product.price.toFixed(2)}</span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`btn-add-cart ${added ? 'added' : ''}`}
          >
            {added ? (
              <>
                <Check size={16} /> Added!
              </>
            ) : (
              <>
                <ShoppingBag size={16} /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
