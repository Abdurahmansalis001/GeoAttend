import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import { ProtectedRoute } from './routes/ProtectedRoutes';

// Auth Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

// Dashboard
import { Dashboard } from './pages/Dashboard';

// Student Pages
import { StudentDashboard, StudentCourses } from './pages/student';

// Lecturer Pages
import { LecturerDashboard, LecturerCourses } from './pages/lecturer';

// Admin Pages
import { AdminDashboard, AdminUsers, AdminCourses } from './pages/admin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentCourses />
              </ProtectedRoute>
            }
          />

          {/* Lecturer Routes */}
          <Route
            path="/lecturer"
            element={
              <ProtectedRoute allowedRoles={['lecturer']}>
                <LecturerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/courses"
            element={
              <ProtectedRoute allowedRoles={['lecturer']}>
                <LecturerCourses />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCourses />
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
