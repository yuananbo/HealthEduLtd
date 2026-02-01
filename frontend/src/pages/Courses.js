/**
 * Courses Page Component
 * Lists all available courses
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../services/courseService';
import Card from '../components/common/Card';
import './Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses();
      setCourses(response.data || []);
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="courses-page">
        <div className="container">
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="courses-page">
        <div className="container">
          <p className="error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="container">
        <h1>Courses</h1>
        <p className="page-subtitle">
          Explore our healthcare education courses
        </p>

        {courses.length === 0 ? (
          <p className="no-courses">No courses available yet. Check back soon!</p>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <Link to={`/courses/${course.id}`} key={course.id}>
                <Card className="course-card">
                  <Card.Body>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <div className="course-meta">
                      <span className="difficulty">{course.difficulty}</span>
                      <span className="category">{course.category}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
