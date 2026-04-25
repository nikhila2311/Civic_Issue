import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'


import ReportPage from './pages/ReportPage'
import TrackPage from './pages/TrackPage'

import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

import AuthPage from './pages/AuthPage'
import UserDashboard from './pages/UserDashboard'
import PublicMap from './pages/PublicMap'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import UserProtectedRoute from './components/ProtectedRoute'

export default function App() {

  const adminToken = localStorage.getItem('adminToken')
  const userToken = localStorage.getItem('userToken')

  return (
    <Routes>

      {/* 🔥 ROOT → ALWAYS LOGIN FIRST */}
      <Route
        path="/"
        element={
          adminToken
            ? <Navigate to="/admin/dashboard" replace />
            : userToken
            ? <Navigate to="/dashboard" replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* PUBLIC */}
      <Route path="/report" element={<ReportPage />} />
      <Route path="/track" element={<TrackPage />} />
      <Route path="/track/:ticketId" element={<TrackPage />} />

      {/* USER */}
      <Route path="/login" element={<AuthPage />} />

      <Route
        path="/dashboard"
        element={
          <UserProtectedRoute>
            <UserDashboard />
          </UserProtectedRoute>
        }
      />
    {/* USER */}
<Route path="/login" element={<AuthPage />} />

<Route
  path="/dashboard"
  element={
    <UserProtectedRoute>
      <UserDashboard />
    </UserProtectedRoute>
  }
/>
<Route path="/public" element={<PublicMap />} />
      {/* ADMIN */}
      <Route path="/admin" element={<AdminLogin />} />

      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}