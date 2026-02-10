# MobiRehab - Local MongoDB Database Setup

This guide explains how to set up and use the local MongoDB database for the MobiRehab application.

## 🗂️ Database Schema Overview

The MobiRehab application uses MongoDB with the following collections:

### 1. **Admins Collection**
- Stores admin user accounts
- Fields: admindId, firstName, lastName, email, password, role, permissions
- Roles: `admin`, `super-admin`
- Permissions: verifyTherapist, suspendTherapist, viewTherapistActivities, etc.

### 2. **Patients Collection**
- Stores patient profiles and medical information
- Fields: patientId, personal info, medical history, vitals, medications
- Nested schemas: medicalHistory, vitals, medications

### 3. **Therapists Collection**
- Stores therapist profiles and credentials
- Fields: therapistId, credentials, specialization, license info
- Specializations: Physiotherapist, Occupational Therapist, Prosthetist and Orthotist, etc.
- Verification status tracking

### 4. **Appointments Collection**
- Manages appointments between patients and therapists
- Fields: patient (ref), therapist (ref), date, time, status, service
- Status types: Pending, Accepted, Declined, Completed, Cancelled, etc.

### 5. **Payments Collection**
- Tracks payment transactions
- Fields: amount, appointment (ref), currency, status
- Default amount: 5000 RWF

### 6. **Availabilities Collection**
- Manages therapist availability schedules
- Nested time slots for different dates
- Maximum 7 date slots per availability

### 7. **SessionNotes Collection**
- Stores therapy session notes
- Fields: appointment (ref), reason, note

### 8. **TherapistRatings Collection**
- Patient ratings and reviews for therapists
- Fields: patient (ref), therapist (ref), rating (1-5), review

## 🚀 Initial Setup

### Prerequisites
- macOS with Homebrew installed
- Node.js installed

### Step 1: Install MongoDB

MongoDB has already been installed via Homebrew:

```bash
brew tap mongodb/brew
brew install mongodb-community@8.0
```

### Step 2: Start MongoDB Service

Start MongoDB and set it to run on system startup:

```bash
brew services start mongodb/brew/mongodb-community@8.0
```

To stop MongoDB:
```bash
brew services stop mongodb/brew/mongodb-community@8.0
```

### Step 3: Initialize Database

Run the database initialization script to create indexes:

```bash
npm run db:init
```

Or use the combined command (starts MongoDB + initializes):
```bash
npm run db:setup
```

## 🔧 Configuration

### Environment Variables

The `.env` file in the `backend` directory has been updated:

```env
DBCONNECTION=mongodb://localhost:27017/mobirehab
```

**Previous (Cloud MongoDB - Not Working):**
```env
DBCONNECTION=mongodb+srv://rodriguegasore:0Q9w8Nolsdh8wVX5@mobirehab.pf2uoof.mongodb.net/mobirHab?retryWrites=true&w=majority&appName=mobirehab
```

## 📊 Database Indexes

The initialization script creates the following indexes for optimal performance:

- **Admins**: email (unique), admindId
- **Patients**: email, patientId, phoneNumber
- **Therapists**: email (unique), therapistId, specialization, isVerified, active
- **Appointments**: patient, therapist, date, status, composite (patient + therapist + date)
- **Payments**: appointment (unique), status
- **Availabilities**: therapist, isActive
- **SessionNotes**: appointment
- **TherapistRatings**: therapist, patient, composite (patient + therapist)

## 🛠️ Available NPM Scripts

```bash
# Initialize database (create indexes)
npm run db:init

# Start MongoDB and initialize database
npm run db:setup

# Start backend server
npm run server

# Start backend server (production)
npm start
```

## 📱 MongoDB GUI Tools

### MongoDB Compass (Recommended)

Download from: https://www.mongodb.com/products/compass

Connection string:
```
mongodb://localhost:27017/mobirehab
```

### Command Line Access

```bash
# Connect to the database
mongosh mongodb://localhost:27017/mobirehab

# Common commands
show collections
db.patients.find()
db.therapists.find()
db.appointments.find()
```

## 🔍 Verification

After setup, verify your database:

1. Check MongoDB is running:
```bash
brew services list | grep mongodb
```

2. Test connection:
```bash
mongosh --eval "db.version()"
```

3. View database stats:
```bash
npm run db:init
```

## 📝 Database Collections Summary

| Collection | Purpose | Key References |
|------------|---------|----------------|
| admins | Admin user management | - |
| patients | Patient profiles | - |
| therapists | Therapist profiles | ratings → TherapistRating |
| appointments | Booking system | patient → Patient, therapist → Therapist |
| payments | Payment tracking | appointment → Appointment |
| availabilities | Schedule management | therapist → Therapist |
| sessionnotes | Session documentation | appointment → Appointment |
| therapistratings | Feedback system | patient → Patient, therapist → Therapist |

## 🔐 Security Notes

1. **Password Hashing**: All user passwords are hashed using bcryptjs (Admin, Patient, Therapist models)
2. **Unique Constraints**: Email fields have unique constraints for Admin and Therapist
3. **Login Attempts**: Admin model includes login attempt tracking with account locking after 5 failed attempts

## 🐛 Troubleshooting

### MongoDB won't start
```bash
# Check MongoDB logs
brew services list
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

### Connection refused
```bash
# Restart MongoDB
brew services restart mongodb/brew/mongodb-community@8.0
```

### Port already in use
```bash
# Check what's using port 27017
lsof -i :27017

# Kill the process if needed
kill -9 <PID>
```

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB University (Free Courses)](https://university.mongodb.com/)

## 🎯 Next Steps

1. ✅ MongoDB installed and running
2. ✅ Database initialized with indexes
3. ✅ Environment variables configured
4. 🔜 Start the backend server: `npm run server`
5. 🔜 Test API endpoints
6. 🔜 Create initial admin user via setup routes

---

**Database Name**: `mobirehab`
**Connection URL**: `mongodb://localhost:27017/mobirehab`
**Server Port**: 27017 (default MongoDB port)
