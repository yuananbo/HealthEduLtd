/**
 * Header Component
 * Main navigation header for the application
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>HealthEduLtd</h1>
          </Link>
          
          <nav className="nav">
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/courses">Courses</Link></li>
              <li><Link to="/health-resources">Resources</Link></li>
              
              {user ? (
                <>
                  <li><Link to="/dashboard">Dashboard</Link></li>
                  <li><Link to="/profile">Profile</Link></li>
                  <li>
                    <button onClick={logout} className="btn-logout">
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li><Link to="/login">Login</Link></li>
                  <li><Link to="/register" className="btn-register">Register</Link></li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
