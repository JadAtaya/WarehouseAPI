import React from 'react';
import './Home.css';

const categories = [
  { name: 'Dairy', img: '🧀' },
  { name: 'Bakery', img: '🥖' },
  { name: 'Produce', img: '🥦' },
  { name: 'Grain & Rice', img: '🍚' },
  { name: 'Cereals', img: '🥣' },
  { name: 'Beverages', img: '🥤' },
];

export default function Home() {
  return (
    <div className="home-floating-cards-container">
      <div className="home-welcome-card">
        <h1>Welcome to the Warehouse!</h1>
        <p>You have successfully logged in.</p>
      </div>
      {categories.map((cat, idx) => (
        <div className={`floating-category-card floating-card-${idx}`} key={cat.name}>
          <div className="category-img">{cat.img}</div>
          <div className="category-name">{cat.name}</div>
        </div>
      ))}
    </div>
  );
}
