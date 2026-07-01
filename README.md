# 🏙️ Smart City Public Issue Reporting System

An AI-powered smart city platform that enables citizens to report public infrastructure issues such as potholes, garbage accumulation, water leakages, broken streetlights, and more. The system automatically classifies issues using AI, assigns them to the appropriate department, and allows real-time tracking until resolution.

---

## ✨ Features

### 👥 Citizen Portal
- Secure user registration with Email OTP verification
- JWT-based authentication
- Report issues with image, description, and location
- AI-based issue categorization
- Automatic ticket generation
- Track issue status in real time
- View issue history and dashboard statistics
- Email notifications for status updates

### 🛠️ Admin Portal
- Secure admin authentication
- Role-based access control
- Department-wise issue management
- Update issue status
- Upload resolution images
- Interactive dashboard with filters
- Email notifications to citizens

### 🤖 AI Module
- Automatic image classification
- Issue category prediction
- Confidence score generation
- Severity estimation
- Duplicate issue detection

---

# 🏗️ Tech Stack

| Category | Technologies |
|----------|--------------|
| Frontend | React.js, JavaScript, HTML, CSS, Axios |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Authentication | JWT, Bcrypt |
| AI Service | FastAPI, Roboflow |
| Email Service | Resend API |

---

# 📌 System Architecture

```text
User
   │
   ▼
React Frontend
   │
Axios Requests
   │
   ▼
Express Backend
   │
 ┌─┴───────────────┐
 │                 │
 ▼                 ▼
Supabase DB   Supabase Storage
 │                 │
 └──────┬──────────┘
        ▼
 FastAPI AI Service
        │
        ▼
 Roboflow Model
```

---

# 🔄 Workflow

### User Registration

```
Register
   ↓
Receive OTP
   ↓
Verify OTP
   ↓
JWT Generated
   ↓
Dashboard
```

### Issue Reporting

```
Upload Image
      ↓
Backend
      ↓
Store Image
      ↓
AI Classification
      ↓
Generate Ticket
      ↓
Store in Database
      ↓
Track Issue
```

### Admin Workflow

```
Admin Login
      ↓
View Assigned Issues
      ↓
Update Status
      ↓
Upload Resolution Image
      ↓
Citizen Notified
```

---

# 🔐 Security Features

- JWT Authentication
- Protected Routes
- Role-Based Authorization
- Password Hashing (Bcrypt)
- Email OTP Verification
- Middleware Authentication
- Secure Image Upload

---

# 📊 Project Highlights

- ✅ AI-powered issue classification
- ✅ Real-time issue tracking
- ✅ Automatic department assignment
- ✅ Email notifications
- ✅ Role-based admin dashboard
- ✅ Interactive user dashboard
- ✅ Cloud database using Supabase
- ✅ FastAPI microservice architecture

---

# 📂 Project Structure

```
Smart-City-Public-System
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── routes
│   ├── middleware
│   ├── controllers
│   ├── services
│   └── package.json
│
├── ai-service
│   ├── app.py
│   ├── model
│   └── requirements.txt
│
└── README.md
```

---

# 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/your-username/Smart-City-Public-System.git
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm start
```

### AI Service

```bash
cd ai-service
pip install -r requirements.txt
uvicorn app:app --reload
```


