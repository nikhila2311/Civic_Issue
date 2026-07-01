🏙️ Smart City Public Issue Reporting System

A full-stack AI-powered web application that enables citizens to report public infrastructure issues such as potholes, broken streetlights, garbage accumulation, and water leakages. The system automatically classifies reported issues using Computer Vision, assigns them to the appropriate government department, and allows both citizens and administrators to track issue resolution in real time.

🚀 Features
👤 Citizen Portal
User registration with Email OTP verification
Secure JWT-based authentication
Report issues with:
Image upload
Description
Automatic location detection
AI-powered issue classification
Automatic ticket generation
Track issue status
Dashboard with issue statistics
Resolution history
Email notifications on status updates
🛠️ Admin Portal
Secure admin authentication
Role-based access control
Department-wise issue management
Issue status updates
Upload resolution images
View issue locations on map
Filter issues by:
Status
Category
Department
Email notifications to citizens after updates
🤖 AI Module
Image classification using Roboflow
Automatic issue categorization
Confidence score generation
Severity estimation
Duplicate issue detection based on location
Fallback mechanism when AI service is unavailable
🏗️ System Architecture
                User
                  │
                  ▼
          React Frontend
                  │
        Axios HTTP Requests
                  │
                  ▼
          Express.js Backend
        ┌─────────┴──────────┐
        │                    │
        ▼                    ▼
 Supabase Database     Supabase Storage
        │                    │
        └─────────┬──────────┘
                  │
                  ▼
           FastAPI AI Service
                  │
                  ▼
           Roboflow Model
⚙️ Tech Stack
Frontend
React.js
React Router DOM
Axios
HTML
CSS
JavaScript
Backend
Node.js
Express.js
JWT Authentication
Multer
Bcrypt
Database
Supabase (PostgreSQL)
Storage
Supabase Storage
AI Service
FastAPI
Roboflow Model
Email Service
Resend API
📂 Project Structure
Smart-City-Public-System/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── routes/
│   └── services/
│
├── backend/
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│   ├── utils/
│   └── services/
│
├── ai-service/
│   ├── FastAPI
│   ├── Roboflow Integration
│   └── Prediction APIs
│
└── README.md
🔄 Project Workflow
User Registration
User
   │
   ▼
Register
   │
   ▼
OTP Generated
   │
   ▼
Email Sent
   │
   ▼
OTP Verification
   │
   ▼
JWT Generated
   │
   ▼
Dashboard
Issue Reporting Flow
User Uploads Image
        │
        ▼
Frontend (FormData)
        │
        ▼
Express Backend
        │
        ▼
Supabase Storage
        │
        ▼
Image URL
        │
        ▼
FastAPI AI Service
        │
        ▼
Roboflow Model
        │
        ▼
Category + Confidence
        │
        ▼
Severity Calculation
        │
        ▼
Ticket Generation
        │
        ▼
Database Storage
        │
        ▼
Response to User
Admin Workflow
Admin Login
      │
      ▼
JWT Authentication
      │
      ▼
View Assigned Issues
      │
      ▼
Update Status
      │
      ▼
Upload Resolution Image
      │
      ▼
Database Updated
      │
      ▼
Email Notification Sent
🔐 Security Features
JWT Authentication
Protected Routes
Role-Based Authorization
Password Hashing using Bcrypt
Email OTP Verification
Middleware-based Route Protection
Secure Image Upload Handling
Authorization Header Validation
📸 AI-Based Image Analysis

The uploaded issue image is processed using a dedicated AI service.

The workflow includes:

Upload image
Store image in Supabase Storage
Generate public image URL
Send image URL to FastAPI service
FastAPI forwards request to Roboflow
Roboflow predicts issue category
Backend calculates severity
Issue stored with AI prediction
📊 Dashboard Features
User Dashboard
Total Issues
Pending Issues
In Progress Issues
Resolved Issues
Average Resolution Time
Ticket Tracking
Admin Dashboard
Department-wise Issues
Status Filters
Category Filters
Interactive Issue Management
Resolution History
📧 Notifications

The system automatically sends email notifications for:

OTP Verification
Successful Registration
Issue Status Updates
Resolution Updates
🗄️ Database
Users
User Information
Authentication Details
Verification Status
Issues
Ticket ID
Description
Category
Severity
Status
Image URL
Location
Department
Created Time
Updated Time
OTP
Email
OTP
Expiry Time
Status History
Previous Status
Updated Status
Timestamp
💡 Future Improvements
Real-time notifications using WebSockets
Mobile application
AI model improvements
Analytics dashboard
Government department integration
Priority-based issue assignment
SMS notifications
Multilingual support
📷 Screenshots

Add screenshots here.

screenshots/
├── Home.png
├── Login.png
├── Dashboard.png
├── Report-Issue.png
├── Admin-Dashboard.png
└── Tracking.png
🚀 Installation
Clone Repository
git clone https://github.com/yourusername/Smart-City-Public-System.git

cd Smart-City-Public-System
Frontend
cd frontend
npm install
npm run dev
Backend
cd backend
npm install
npm start
AI Service
cd ai-service

pip install -r requirements.txt

uvicorn app:app --reload
