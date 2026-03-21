<div align="center">

<br/>

```
 ██████╗ ██████╗ ██████╗ ██╗████████╗
██╔═══██╗██╔══██╗██╔══██╗██║╚══██╔══╝
██║   ██║██████╔╝██████╔╝██║   ██║
██║   ██║██╔══██╗██╔══██╗██║   ██║
╚██████╔╝██║  ██║██████╔╝██║   ██║
 ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝   ╚═╝
```

# Enterprise Employee Leave Management System

**Production-grade HR leave workflow system with real-time notifications, role-based access control, and analytics**

<br/>

[![Live Demo](https://img.shields.io/badge/Live_Demo-o--r--b--i--t--system.vercel.app-0A66C2?style=for-the-badge&logo=vercel&logoColor=white)](https://o-r-b-i-t-system.vercel.app)
[![React](https://img.shields.io/badge/React-Vite-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

<br/>

</div>

---

## ![overview](https://img.shields.io/badge/-Overview-1a1a2e?style=flat-square&logo=readme&logoColor=white) Overview

**ORBIT** is a production-grade full-stack Employee Leave Management System that replicates a real-world corporate HR workflow. It enforces a structured three-tier role hierarchy — Admin, Manager, and Employee — under strict Role-Based Access Control (RBAC) policies, backed by JWT authentication, real-time Socket.IO notifications, and a Chart.js analytics dashboard.

The system follows enterprise architectural patterns including MVC separation on the backend, a middleware-driven auth pipeline, a service-layer frontend, and an event-driven notification layer.

---

## ![features](https://img.shields.io/badge/-Key_Features-1a1a2e?style=flat-square&logo=todoist&logoColor=white) Key Features

| | Feature | Description |
|---|---|---|
| ![](https://img.shields.io/badge/JWT_Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white) | **Authentication & Security** | JWT tokens stored in HTTP-only cookies, bcrypt hashing, rate limiting, strict CORS |
| ![](https://img.shields.io/badge/RBAC-6A0DAD?style=flat-square&logo=checkmarx&logoColor=white) | **Role-Based Access Control** | Admin, Manager, and Employee roles with middleware-enforced endpoint permissions |
| ![](https://img.shields.io/badge/Leave_Engine-0078D4?style=flat-square&logo=azureml&logoColor=white) | **Leave Management Engine** | Automatic balance deduction, conflict detection, date validation, atomic DB updates |
| ![](https://img.shields.io/badge/Real--Time-010101?style=flat-square&logo=socketdotio&logoColor=white) | **Real-Time Notifications** | Socket.IO broadcasts for live leave submission and approval/rejection alerts |
| ![](https://img.shields.io/badge/Analytics-FF6384?style=flat-square&logo=chartdotjs&logoColor=white) | **Analytics Dashboard** | Chart.js visualisations — monthly trends, approval ratios, department insights |
| ![](https://img.shields.io/badge/Risk_Detection-EA4335?style=flat-square&logo=googledataflow&logoColor=white) | **AI Leave Risk Detection** | Pattern-based risk scoring algorithm flags anomalous leave behaviour |
| ![](https://img.shields.io/badge/Dark_Mode-1a1a2e?style=flat-square&logo=halfmoon&logoColor=white) | **Responsive Dark Mode UI** | Fully responsive layout with dark mode toggle, toast notifications, clean enterprise design |

---

## ![arch](https://img.shields.io/badge/-System_Architecture-1a1a2e?style=flat-square&logo=diagrams.net&logoColor=white) System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORBIT System                             │
├──────────────────────┬──────────────────────┬───────────────────┤
│   React / Vite       │   Node / Express      │   Socket.IO Layer │
│    (Frontend)        │     (Backend MVC)     │   (Real-Time)     │
│                      │                       │                   │
│  · Dashboard UI      │  · REST API (MVC)     │  · Leave Submit   │
│  · Context API Auth  │  · JWT Middleware      │    Broadcast      │
│  · Chart.js Charts   │  · RBAC Middleware     │  · Approval Push  │
│  · Socket Client     │  · Rate Limiting       │  · Rejection Push │
│  · Dark Mode         │  · Error Handling      │                   │
│  · Toast Alerts      │  · Risk Detector       │                   │
└──────────┬───────────┴──────────┬────────────┴──────────────────┘
           │                      │
           └──────────────────────▼
                    MongoDB (Mongoose ODM)
                  Users  ·  Leave Records
```

**Architecture Patterns:**

| Layer | Pattern |
|---|---|
| ![](https://img.shields.io/badge/Backend-grey?style=flat-square&logo=nodedotjs&logoColor=white) | MVC — Controllers, Models, Routes, Middleware, Utils |
| ![](https://img.shields.io/badge/Frontend-grey?style=flat-square&logo=react&logoColor=white) | Component-based — Pages, Components, Context, Services, Hooks |
| ![](https://img.shields.io/badge/Auth-grey?style=flat-square&logo=jsonwebtokens&logoColor=white) | Middleware-driven — JWT validation + RBAC role checks per route |
| ![](https://img.shields.io/badge/Real--Time-grey?style=flat-square&logo=socketdotio&logoColor=white) | Event-driven — Socket.IO handlers for live HR workflow events |

---

## ![stack](https://img.shields.io/badge/-Tech_Stack-1a1a2e?style=flat-square&logo=stackshare&logoColor=white) Tech Stack

```
┌──────────────┐  ┌──────────────────────────────────────────────────┐
│  FRONTEND    │  │  React · Vite · Tailwind CSS · React Router DOM  │
│              │  │  Context API · Axios · Chart.js · Socket.IO      │
│              │  │  React Hot Toast                                  │
├──────────────┤  ├──────────────────────────────────────────────────┤
│  BACKEND     │  │  Node.js · Express.js · Mongoose · Socket.IO     │
│              │  │  node-cron · cookie-parser                        │
├──────────────┤  ├──────────────────────────────────────────────────┤
│  DATABASE    │  │  MongoDB Atlas / Local MongoDB                    │
├──────────────┤  ├──────────────────────────────────────────────────┤
│  SECURITY    │  │  JWT · bcrypt · express-rate-limit · dotenv      │
├──────────────┤  ├──────────────────────────────────────────────────┤
│  DEPLOYMENT  │  │  Vercel (Frontend) · MongoDB Atlas (Database)    │
└──────────────┘  └──────────────────────────────────────────────────┘
```

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-0F172A?style=flat-square&logo=tailwindcss&logoColor=38BDF8)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socketdotio&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat-square&logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-003A70?style=flat-square&logo=letsencrypt&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

---

## ![roles](https://img.shields.io/badge/-Role_Hierarchy-1a1a2e?style=flat-square&logo=checkmarx&logoColor=white) Role Hierarchy & Permissions

```
┌────────────────────────────────────────────────────┐
│                      ADMIN                         │
│   Full system access · User management · Analytics │
├────────────────────────────────────────────────────┤
│                     MANAGER                        │
│  Approve / Reject leaves · View team · Dashboard   │
├────────────────────────────────────────────────────┤
│                    EMPLOYEE                        │
│   Submit leaves · View own records · Notifications │
└────────────────────────────────────────────────────┘
```

| Permission | Admin | Manager | Employee |
|---|---|---|---|
| Submit leave request | ![](https://img.shields.io/badge/Yes-22C55E?style=flat-square) | ![](https://img.shields.io/badge/Yes-22C55E?style=flat-square) | ![](https://img.shields.io/badge/Yes-22C55E?style=flat-square) |
| Approve / Reject leaves | ![](https://img.shields.io/badge/Yes-22C55E?style=flat-square) | ![](https://img.shields.io/badge/Yes-22C55E?style=flat-square) | ![](https://img.shields.io/badge/No-EF4444?style=flat-square) |
| Manage users | ![](https://img.shields.io/badge/Yes-22C55E?style=flat-square) | ![](https://img.shields.io/badge/No-EF4444?style=flat-square) | ![](https://img.shields.io/badge/No-EF4444?style=flat-square) |
| View analytics dashboard | ![](https://img.shields.io/badge/Yes-22C55E?style=flat-square) | ![](https://img.shields.io/badge/Yes-22C55E?style=flat-square) | ![](https://img.shields.io/badge/No-EF4444?style=flat-square) |
| Delete records | ![](https://img.shields.io/badge/Yes-22C55E?style=flat-square) | ![](https://img.shields.io/badge/No-EF4444?style=flat-square) | ![](https://img.shields.io/badge/No-EF4444?style=flat-square) |

---

## ![structure](https://img.shields.io/badge/-Project_Structure-1a1a2e?style=flat-square&logo=files&logoColor=white) Project Structure

### Backend

```
server/
│
├── config/
│   └── db.js                    # MongoDB connection
│
├── controllers/
│   ├── authController.js        # Login, register, logout
│   ├── leaveController.js       # Leave CRUD + conflict detection
│   ├── userController.js        # User management
│   └── analyticsController.js   # Aggregated reporting
│
├── middleware/
│   ├── authMiddleware.js        # JWT verification
│   ├── roleMiddleware.js        # RBAC role enforcement
│   ├── errorMiddleware.js       # Centralised error handling
│   └── rateLimiter.js           # Route-level rate limiting
│
├── models/
│   ├── User.js                  # User schema + roles
│   └── Leave.js                 # Leave schema + balance
│
├── routes/
│   ├── authRoutes.js            # /api/auth
│   ├── leaveRoutes.js           # /api/leaves
│   ├── userRoutes.js            # /api/users
│   └── analyticsRoutes.js       # /api/analytics
│
├── utils/
│   ├── generateToken.js         # JWT generation helper
│   ├── leaveConflictChecker.js  # Overlap detection logic
│   └── riskDetector.js          # AI-inspired risk pattern engine
│
├── socket/
│   └── socketHandler.js         # Socket.IO event handlers
│
└── server.js                    # App entry point
```

### Frontend

```
client/src/
│
├── components/
│   ├── Navbar.jsx               # Global navigation bar
│   ├── Sidebar.jsx              # Role-aware sidebar menu
│   ├── LeaveCard.jsx            # Leave request card component
│   ├── DashboardChart.jsx       # Chart.js wrapper component
│   └── ProtectedRoute.jsx       # Role-based route guard
│
├── pages/
│   ├── Login.jsx                # Authentication page
│   ├── Register.jsx             # User registration
│   ├── Dashboard.jsx            # Main HR overview
│   ├── Leaves.jsx               # Leave request management
│   ├── Users.jsx                # User administration (Admin)
│   └── Analytics.jsx            # Analytics and reporting
│
├── context/
│   ├── AuthContext.jsx          # Global authentication state
│   └── ThemeContext.jsx         # Dark / light mode state
│
├── services/
│   └── api.js                   # Axios instance + API service layer
│
└── hooks/
    └── useAuth.js               # Custom authentication hook
```

---

## ![start](https://img.shields.io/badge/-Getting_Started-1a1a2e?style=flat-square&logo=dependabot&logoColor=white) Getting Started

### Prerequisites

![Node.js](https://img.shields.io/badge/Node.js-v16+_required-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_or_Local-47A248?style=flat-square&logo=mongodb&logoColor=white)
![npm](https://img.shields.io/badge/npm-package_manager-CB3837?style=flat-square&logo=npm&logoColor=white)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/ORBIT.git
cd ORBIT
```

**2. Set up the backend**
```bash
cd server
npm install
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, and CLIENT_URL
npm run dev
```

**3. Set up the frontend**
```bash
cd client
npm install
npm run dev
```

> The frontend runs at **`http://localhost:5173`** and the backend at **`http://localhost:5000`** by default.

---

## ![env](https://img.shields.io/badge/-Environment_Configuration-1a1a2e?style=flat-square&logo=dotenv&logoColor=white) Environment Configuration

Create a `.env` file inside `server/`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/orbit-rms
JWT_SECRET=your_super_secret_key_min_32_chars
CLIENT_URL=http://localhost:5173
```

| Variable | Description |
|---|---|
| `PORT` | Express server port (default: 5000) |
| `NODE_ENV` | Runtime environment (`development` / `production`) |
| `MONGO_URI` | MongoDB Atlas or local connection string |
| `JWT_SECRET` | Secret key for JWT signing (minimum 32 characters) |
| `CLIENT_URL` | Allowed CORS origin for the React frontend |

---

## ![api](https://img.shields.io/badge/-API_Reference-1a1a2e?style=flat-square&logo=postman&logoColor=white) API Reference

### ![auth](https://img.shields.io/badge/Auth-/api/auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate and receive JWT cookie |
| `POST` | `/api/auth/logout` | Auth | Clear JWT cookie and end session |
| `GET` | `/api/auth/me` | Auth | Get current authenticated user |

### ![leaves](https://img.shields.io/badge/Leaves-/api/leaves-0078D4?style=flat-square&logo=azureml&logoColor=white)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/leaves` | Employee+ | Submit a new leave request |
| `GET` | `/api/leaves` | Employee+ | Get leave records (role-filtered) |
| `PATCH` | `/api/leaves/:id` | Manager+ | Approve or reject a leave request |
| `DELETE` | `/api/leaves/:id` | Admin | Delete a leave record |

### ![users](https://img.shields.io/badge/Users-/api/users-6A0DAD?style=flat-square&logo=checkmarx&logoColor=white)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users` | Admin | Retrieve all users |
| `POST` | `/api/users` | Admin | Create a new user |
| `PATCH` | `/api/users/:id` | Admin | Update user details or role |
| `DELETE` | `/api/users/:id` | Admin | Remove a user account |

### ![analytics](https://img.shields.io/badge/Analytics-/api/analytics-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/analytics` | Admin, Manager | Monthly trends, approval ratios, department data |

---

## ![security](https://img.shields.io/badge/-Security_Standards-1a1a2e?style=flat-square&logo=letsencrypt&logoColor=white) Security Standards

| Measure | Implementation |
|---|---|
| ![](https://img.shields.io/badge/Token_Storage-grey?style=flat-square&logo=jsonwebtokens&logoColor=white) | HTTP-only cookies prevent JavaScript access to JWT tokens |
| ![](https://img.shields.io/badge/Password_Hashing-grey?style=flat-square&logo=letsencrypt&logoColor=white) | bcrypt with configurable salt rounds |
| ![](https://img.shields.io/badge/Rate_Limiting-grey?style=flat-square&logo=cloudflare&logoColor=white) | express-rate-limit protects auth routes from brute force |
| ![](https://img.shields.io/badge/CORS-grey?style=flat-square&logo=googlechrome&logoColor=white) | Strict origin allowlist via `CLIENT_URL` environment variable |
| ![](https://img.shields.io/badge/RBAC-grey?style=flat-square&logo=checkmarx&logoColor=white) | Role middleware enforces endpoint-level access on every request |
| ![](https://img.shields.io/badge/Input_Validation-grey?style=flat-square&logo=shield&logoColor=white) | Schema-level validation via Mongoose and centralised error handling |
| ![](https://img.shields.io/badge/Env_Management-grey?style=flat-square&logo=dotenv&logoColor=white) | All secrets managed through environment variables — never hardcoded |

---

## ![deploy](https://img.shields.io/badge/-Production_Deployment-1a1a2e?style=flat-square&logo=vercel&logoColor=white) Production Deployment

### Frontend — Vercel
```bash
# Push to GitHub — Vercel auto-deploys on push to main
# Set VITE_API_URL in Vercel environment variables dashboard
```

### Backend
```bash
# Set the following in your hosting environment:
NODE_ENV=production
MONGO_URI=<your-atlas-production-uri>
JWT_SECRET=<strong-production-secret>
CLIENT_URL=https://o-r-b-i-t-system.vercel.app
```

> In production, secure cookies are enabled automatically when `NODE_ENV=production` is set.

---

## ![future](https://img.shields.io/badge/-Future_Enhancements-1a1a2e?style=flat-square&logo=githubactions&logoColor=white) Future Enhancements

| Enhancement | Description |
|---|---|
| ![](https://img.shields.io/badge/Multi--Tenant-grey?style=flat-square&logo=building&logoColor=white) | Multi-organisation support with tenant isolation |
| ![](https://img.shields.io/badge/Leave_Policy_Engine-grey?style=flat-square&logo=gear&logoColor=white) | Configurable leave policies per department or role |
| ![](https://img.shields.io/badge/Payroll_Integration-grey?style=flat-square&logo=stripe&logoColor=white) | Sync approved leave with payroll processing systems |
| ![](https://img.shields.io/badge/Audit_Logs-grey?style=flat-square&logo=datadog&logoColor=white) | Full audit trail for all leave and user actions |
| ![](https://img.shields.io/badge/Redis_Caching-grey?style=flat-square&logo=redis&logoColor=white) | Redis layer for session caching and analytics acceleration |
| ![](https://img.shields.io/badge/CI%2FCD_Pipeline-grey?style=flat-square&logo=githubactions&logoColor=white) | Automated testing, linting, and deployment pipeline |
| ![](https://img.shields.io/badge/Unit_Testing-grey?style=flat-square&logo=jest&logoColor=white) | Jest unit and integration test coverage |
| ![](https://img.shields.io/badge/Mobile_App-grey?style=flat-square&logo=react&logoColor=white) | React Native mobile application |

---

## ![scalability](https://img.shields.io/badge/-Scalability-1a1a2e?style=flat-square&logo=buffer&logoColor=white) Scalability Considerations

```
Current Architecture          →    Scale Path
──────────────────────────────────────────────────────────────
Monolithic Express server     →    Microservice decomposition
In-process Socket.IO          →    Redis adapter (multi-node)
MongoDB standalone            →    Atlas sharding + replicas
Stateless JWT auth            →    Token refresh + blocklist
Docker-ready structure        →    Kubernetes orchestration
```

---

<div align="center">

Built as a production-grade portfolio demonstration of enterprise full-stack engineering

[![Status](https://img.shields.io/badge/status-live-brightgreen?style=flat-square&logo=vercel&logoColor=white)](https://o-r-b-i-t-system.vercel.app)
[![Made with Node.js](https://img.shields.io/badge/Made_with-Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Powered by MongoDB](https://img.shields.io/badge/Powered_by-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![MIT License](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square&logo=opensourceinitiative&logoColor=white)](LICENSE)

</div>