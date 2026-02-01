/**
 * Dashboard Page Component
 * User's personalized dashboard
 */

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="container">
        <h1>Dashboard</h1>
        <p className="welcome-message">
          Welcome back, {user?.firstName || 'User'}!
        </p>

        <div className="dashboard-grid">
          {/* Enrolled Courses */}
          <div className="dashboard-card">
            <h3>My Courses</h3>
            <p className="placeholder">Your enrolled courses will appear here.</p>
            {/* TODO: Display enrolled courses */}
          </div>

          {/* Progress Overview */}
          <div className="dashboard-card">
            <h3>Learning Progress</h3>
            <p className="placeholder">Track your learning progress here.</p>
            {/* TODO: Display progress statistics */}
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card">
            <h3>Recent Activity</h3>
            <p className="placeholder">Your recent activity will appear here.</p>
            {/* TODO: Display recent activity */}
          </div>

          {/* Recommended Resources */}
          <div className="dashboard-card">
            <h3>Recommended for You</h3>
            <p className="placeholder">Personalized recommendations coming soon.</p>
            {/* TODO: Display recommendations */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
