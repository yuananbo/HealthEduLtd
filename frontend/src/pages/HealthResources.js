/**
 * Health Resources Page Component
 * Lists health education resources
 */

import React, { useState, useEffect } from 'react';
import { healthService } from '../services/healthService';
import Card from '../components/common/Card';
import './HealthResources.css';

const HealthResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await healthService.getAllResources();
      setResources(response.data || []);
    } catch (err) {
      setError('Failed to load health resources');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="resources-page">
        <div className="container">
          <p>Loading resources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resources-page">
        <div className="container">
          <p className="error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resources-page">
      <div className="container">
        <h1>Health Resources</h1>
        <p className="page-subtitle">
          Explore our collection of health education materials
        </p>

        {resources.length === 0 ? (
          <p className="no-resources">No resources available yet. Check back soon!</p>
        ) : (
          <div className="resources-grid">
            {resources.map((resource) => (
              <Card key={resource.id} className="resource-card">
                <Card.Body>
                  <span className="resource-type">{resource.type}</span>
                  <h3>{resource.title}</h3>
                  <p>{resource.content?.substring(0, 150)}...</p>
                  <div className="resource-meta">
                    <span className="category">{resource.category}</span>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthResources;
