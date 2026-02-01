/**
 * Profile Page Component
 * User profile management
 */

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <div className="container">
        <h1>My Profile</h1>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div className="profile-info">
                <h2>{user?.firstName} {user?.lastName}</h2>
                <p>{user?.email}</p>
                <span className="role">{user?.role || 'Student'}</span>
              </div>
            </div>
          </div>

          <div className="profile-details">
            <h3>Account Settings</h3>
            <p className="placeholder">Profile settings will be available here.</p>
            {/* TODO: Add profile editing form */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
