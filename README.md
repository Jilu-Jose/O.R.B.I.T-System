# ORBIT – Enterprise Employee Leave Management System

ORBIT is a production-grade full-stack Employee Leave Management System that simulates a real-world corporate HR workflow. The application follows enterprise architectural patterns, strict security standards, and scalable backend structuring.

Live Application: https://o-r-b-i-t-system.vercel.app

---

## Table of Contents

1. Overview
2. Key Features
3. System Architecture
4. Technology Stack
5. Complete Project Structure
6. Backend Architecture Breakdown
7. Frontend Architecture Breakdown
8. API Documentation
9. Installation & Setup
10. Environment Configuration
11. Production Deployment
12. Security Standards Implemented
13. Scalability Considerations
14. Future Enhancements
15. License

---

## 1. Overview

ORBIT replicates an enterprise-grade HR leave workflow system. It enforces structured role hierarchy and secure leave approval processes.

Supported Roles:

- Admin
- Manager
- Employee

Each role operates under strict Role-Based Access Control (RBAC) policies.

---

## 2. Key Features

### Authentication & Security
- JWT-based authentication
- HTTP-only cookies for secure token storage
- bcrypt password hashing
- Express rate limiting
- Strict CORS configuration
- Secure environment variable management
- Middleware-based access control

### Leave Management Engine
- Automatic leave balance deduction on approval
- Automatic restoration on rejection
- Overlapping leave conflict detection
- Date validation and atomic database updates
- AI-inspired leave risk pattern detection

### Real-Time Notification System
- Socket.IO integration
- Live leave submission alerts
- Real-time approval notifications

### Analytics Dashboard
- Chart.js visualizations
- Monthly leave trends
- Approval vs rejection ratio
- Department-level insights

### User Interface
- Fully responsive layout
- Dark mode support
- Toast notifications
- Clean enterprise UI structure
- Modular component design

---

## 3. System Architecture

Client (React + Vite)
        ↓
REST API (Express.js)
        ↓
MongoDB Database (Mongoose ODM)
        ↓
Socket.IO Layer (Real-Time Events)

Architecture Pattern:
- MVC for backend
- Component-based architecture for frontend
- Middleware-driven authentication
- Service-layer API handling

---

## 4. Technology Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router DOM
- Context API
- Axios
- Chart.js
- Socket.IO Client
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO

### Security Utilities
- JSON Web Token (JWT)
- bcrypt
- cookie-parser
- express-rate-limit
- dotenv
- node-cron

---

## 5. Complete Project Structure

### Root Structure
ORBIT/
│
├── client/
├── server/
├── README.md
└── package.json


---

## Backend File Structure
server/
│
├── config/
│ └── db.js
│
├── controllers/
│ ├── authController.js
│ ├── leaveController.js
│ ├── userController.js
│ └── analyticsController.js
│
├── middleware/
│ ├── authMiddleware.js
│ ├── roleMiddleware.js
│ ├── errorMiddleware.js
│ └── rateLimiter.js
│
├── models/
│ ├── User.js
│ └── Leave.js
│
├── routes/
│ ├── authRoutes.js
│ ├── leaveRoutes.js
│ ├── userRoutes.js
│ └── analyticsRoutes.js
│
├── utils/
│ ├── generateToken.js
│ ├── leaveConflictChecker.js
│ └── riskDetector.js
│
├── socket/
│ └── socketHandler.js
│
├── server.js
├── package.json
└── .env


---

## Frontend File Structure
client/
│
├── public/
│
├── src/
│ │
│ ├── assets/
│ │
│ ├── components/
│ │ ├── Navbar.jsx
│ │ ├── Sidebar.jsx
│ │ ├── LeaveCard.jsx
│ │ ├── DashboardChart.jsx
│ │ └── ProtectedRoute.jsx
│ │
│ ├── pages/
│ │ ├── Login.jsx
│ │ ├── Register.jsx
│ │ ├── Dashboard.jsx
│ │ ├── Leaves.jsx
│ │ ├── Users.jsx
│ │ └── Analytics.jsx
│ │
│ ├── context/
│ │ ├── AuthContext.jsx
│ │ └── ThemeContext.jsx
│ │
│ ├── services/
│ │ └── api.js
│ │
│ ├── hooks/
│ │ └── useAuth.js
│ │
│ ├── App.jsx
│ ├── main.jsx
│ └── index.css
│
├── package.json
└── vite.config.js


---

## 6. Backend Architecture Breakdown

### Controllers
Contain business logic. No direct database logic in routes.

### Models
Mongoose schemas with validation rules.

### Middleware
- Authentication verification
- Role-based permission validation
- Centralized error handling
- Rate limiting

### Utils
Reusable logic such as:
- Token generation
- Leave conflict detection
- Risk detection algorithm

### Socket Layer
Handles:
- Leave submission broadcast
- Approval/rejection push events

---

## 7. Frontend Architecture Breakdown

- Context API handles global authentication state
- Axios configured with `withCredentials: true`
- ProtectedRoute ensures role-based routing
- Dark mode implemented via context
- Charts dynamically rendered from analytics API

---

## 8. API Documentation

### Authentication `/api/auth`
- POST /register
- POST /login
- POST /logout
- GET /me

### Leaves `/api/leaves`
- POST /
- GET /
- PATCH /:id
- DELETE /:id

### Users `/api/users`
- GET /
- POST /
- PATCH /:id
- DELETE /:id

### Analytics `/api/analytics`
- GET /

---

## 9. Installation & Setup

### Database Setup

Use MongoDB Atlas or Local MongoDB:


mongodb://127.0.0.1:27017/orbit-rms


---

### Backend Setup


cd server
npm install
npm run dev


---

### Frontend Setup


cd client
npm install
npm run dev


---

## 10. Environment Configuration

Create `.env` inside `server/`


PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/orbit-rms
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173


---

## 11. Production Deployment

Backend:
- Set NODE_ENV=production
- Enable secure cookies
- Configure strict CORS
- Use production MongoDB cluster

Frontend:
- Update API base URL
- Deploy to Vercel/Netlify
- Enable HTTPS

---

## 12. Security Standards Implemented

- HTTP-only cookies prevent token access via JavaScript
- Role-based middleware prevents unauthorized access
- Password hashing with salt rounds
- Rate limiter protects authentication routes
- Input validation and sanitization
- Centralized error handling

---

## 13. Scalability Considerations

- Modular folder structure
- Separation of concerns
- Stateless authentication
- Event-driven notification system
- Easily containerizable with Docker
- Ready for microservice transition

---

## 14. Future Enhancements

- Multi-tenant organization support
- Leave policy configuration engine
- Payroll system integration
- Audit logs
- Redis caching
- CI/CD pipeline
- Unit and integration testing
- Mobile application version

---

## 15. License

This project is developed for portfolio and educational demonstration purposes.

---

## Author

ORBIT is designed and developed as a production-grade HR workflow simulation demonstrating full-stack engineering, security implementation, and scalable system architecture.