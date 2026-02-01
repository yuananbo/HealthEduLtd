# HealthEduLtd - Healthcare Platform

A comprehensive healthcare education platform built with modern web technologies.

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Architecture**: Model-View-Controller (MVC)

## Project Structure

```
HealthEduLtd/
├── backend/                 # Node.js Express server
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers (C in MVC)
│   ├── models/             # Database models (M in MVC)
│   ├── routes/             # API route definitions
│   ├── middleware/         # Custom middleware
│   ├── services/           # Business logic layer
│   ├── utils/              # Utility functions
│   └── views/              # Server-side views (V in MVC) - API responses
├── frontend/               # React application
│   ├── public/             # Static files
│   └── src/
│       ├── components/     # React components (View layer)
│       ├── pages/          # Page components
│       ├── services/       # API service calls
│       ├── hooks/          # Custom React hooks
│       ├── context/        # React context providers
│       └── utils/          # Frontend utilities
└── docs/                   # Documentation
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure your database credentials in .env
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Database Setup

1. Create a PostgreSQL database named `healthedu_db`
2. Update the `.env` file with your database credentials
3. Run migrations: `npm run migrate`

## API Documentation

API endpoints are available at `http://localhost:5000/api/v1`

## Environment Variables

See `.env.example` files in both frontend and backend directories.

## License

Proprietary - HealthEduLtd
