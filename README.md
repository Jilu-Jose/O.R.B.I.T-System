# Employee Leave Management System

A production-ready full-stack Employee Leave Management System that simulates a real corporate HR workflow. Built strictly adhering to industry standards and modern UI design.

## 🚀 Features

### **1. 🔐 Robust Authentication & Security**
- JWT-based authentication
- **HTTP-only Cookies** for secure token storage to prevent XSS attacks.
- Role-based Access Control (Admin, Manager, Employee).
- Password Hashing via `bcrypt`.
- Rate Limiting via `express-rate-limit` to prevent brute force attacks.
- Strict `CORS` configuration for frontend/backend communication.

### **2. 👥 Role-Based Capabilities**
- **Admin**: Full access. Can add/edit/delete users and re-assign roles. Access to all Analytics & Leaves.
- **Manager**: Intermediate access. Can review, approve, or reject leaves. Views team Analytics insights.
- **Employee**: Can apply for leaves, track history, and check their real-time leave balance.

### **3. 🧠 Smart Leave Management (Advanced Features)**
- **Leave Balance Auto-Calculation**: Automatically deducts days upon manager approval and restores on rejection.
- **Smart Conflict Detection**: Prevents employees from double-booking leaves overlapping across existing dates.
- **AI-Based Risk Indicator**: Detects patterns (like requesting short leaves adjacent to weekends continuously) and flags requests with a Warning Badge for Managers.

### **4. 📊 Real-Time Analytics & UI Notifications**
- Socket.IO integration for instant real-time live push notifications for leave submissions and approvals.
- High-quality metrics dashboards via **Chart.js**.
- Beautiful toaster notifications using `react-hot-toast`.
- Responsive, clean UI mimicking Enterprise HR software aesthetics powered by **Tailwind CSS**.
- **Dark Mode** context toggle.

## 🛠️ Tech Stack 

**Frontend:** React (Vite), Tailwind CSS, React Context API, React Router DOM, Axios, Lucide React, Chart.js  
**Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.IO  
**Security/Utils:** JWT, bcrypt, Cookie Parser, Node Cron, Express Rate Limit  

## ⚡ Getting Started 

### 1. Database Setup
Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or run a local instance.

### 2. Backend Installation
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/orbit-rms
JWT_SECRET=your_super_secret_key
```

Run the backend server:
```bash
npm run dev
# OR
npx nodemon server.js
```

### 3. Frontend Installation
```bash
cd client
npm install
npm run dev
```

## 📚 API Architecture overview

**Authentication `/api/auth/`**
- `POST /register`: Account registration
- `POST /login`: Sign in and retrieve HTTP-only cookie
- `POST /logout`: Destroy cookie session
- `GET /me`: Get authenticated user profile

**Leave Management `/api/leaves/`**
- `POST /`: Submit leave
- `GET /`: Retrieve all contextual leaves
- `PATCH /:id`: Update leave status (Manager/Admin)
- `DELETE /:id`: Cancel/delete leave request

**User Management `/api/users/`**
- `GET /`: List all users (Admin)
- `POST /`: Directly provision a new user (Admin)
- `PATCH /:id`: Update roles/metadata (Admin)
- `DELETE /:id`: Deprovision user (Admin)

**Analytics `/api/analytics/`**
- `GET /`: Overview metrics and timeseries data for dashboards
