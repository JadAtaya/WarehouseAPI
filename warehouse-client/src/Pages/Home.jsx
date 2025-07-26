import React from 'react';
import './Home.css';
import { FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Dairy', img: '\ud83e\uddc0' },
  { name: 'Bakery', img: '\ud83e\udd56' },
  { name: 'Produce', img: '\ud83e\udd66' },
  { name: 'Grain & Rice', img: '\ud83c\udf5a' },
  { name: 'Cereals', img: '\ud83e\udd63' },
  { name: 'Beverages', img: '\ud83e\udd64' },
  { name: 'And more !', img: '\u2728' },
];

export default function Home() {
  return (
    <div className="home-floating-cards-container">
      <div className="home-welcome-card enhanced">
        <img src={process.env.PUBLIC_URL + "/warehouselogo.png"} alt="Warehouse Logo" className="home-logo" />
        <h1>Welcome to the Warehouse!</h1>
        <p>Your one-stop solution for inventory management.</p>
        <Link to="/products" className="home-cta-btn">
          Explore Products <FaArrowRight style={{marginLeft: '0.7rem', fontSize: '1.1em'}} />
        </Link>
      </div>
      <div className="floating-cards-list">
        {categories.map((cat, idx) => (
          <div className={`floating-category-card floating-card-${idx}`} key={cat.name} tabIndex={0} title={cat.name}>
            <div className="category-img-bg">
              <span className="category-img">{cat.img}</span>
            </div>
            <div className="category-name">{cat.name}</div>
          </div>
        ))}
      </div>
      <div className="home-bg-overlay"></div>
    </div>
  );
}
