/**
 * Course Detail Page Component
 * Displays detailed information about a specific course
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { courseService } from '../services/courseService';
import Button from '../components/common/Button';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseById(id);
      setCourse(response.data);
    } catch (err) {
      setError('Failed to load course details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    // TODO: Implement enrollment logic
    console.log('Enrolling in course:', id);
  };

  if (loading) {
    return (
      <div className="course-detail">
        <div className="container">
          <p>Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-detail">
        <div className="container">
          <p className="error">{error || 'Course not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail">
      <div className="container">
        <div className="course-header">
          <h1>{course.title}</h1>
          <div className="course-meta">
            <span className="difficulty">{course.difficulty}</span>
            <span className="category">{course.category}</span>
          </div>
        </div>

        <div className="course-content">
          <div className="course-main">
            <section className="description">
              <h2>About This Course</h2>
              <p>{course.description}</p>
            </section>

            <section className="modules">
              <h2>Course Modules</h2>
              <p className="placeholder">Course modules will be displayed here.</p>
              {/* TODO: Display course modules */}
            </section>
          </div>

          <aside className="course-sidebar">
            <div className="enroll-card">
              <h3>Enroll Now</h3>
              <Button variant="primary" size="large" onClick={handleEnroll}>
                Start Learning
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
