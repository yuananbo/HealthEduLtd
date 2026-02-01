/**
 * Models Index
 * Central export for all database models and associations
 */

const User = require('./User');
const Course = require('./Course');
const HealthResource = require('./HealthResource');

// Define Model Associations

// User - Course (One-to-Many: Instructor creates courses)
User.hasMany(Course, {
  foreignKey: 'instructorId',
  as: 'taughtCourses'
});
Course.belongsTo(User, {
  foreignKey: 'instructorId',
  as: 'instructor'
});

// User - HealthResource (One-to-Many: Author creates resources)
User.hasMany(HealthResource, {
  foreignKey: 'authorId',
  as: 'createdResources'
});
HealthResource.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author'
});

// TODO: Add Enrollment model for User-Course Many-to-Many relationship
// TODO: Add Module model for Course modules
// TODO: Add Progress model for tracking user progress

module.exports = {
  User,
  Course,
  HealthResource
};
