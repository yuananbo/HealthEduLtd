/**
 * Home Page Component
 * Landing page for the application
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Welcome to HealthEduLtd</h1>
          <p>Your trusted platform for healthcare education</p>
          <div className="hero-buttons">
            <Link to="/courses" className="btn btn-primary">
              Explore Courses
            </Link>
            <Link to="/register" className="btn btn-outline">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose HealthEduLtd?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Expert-Led Courses</h3>
              <p>Learn from healthcare professionals with years of experience.</p>
            </div>
            <div className="feature-card">
              <h3>Comprehensive Resources</h3>
              <p>Access a wide range of health education materials.</p>
            </div>
            <div className="feature-card">
              <h3>Flexible Learning</h3>
              <p>Study at your own pace, anytime and anywhere.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
