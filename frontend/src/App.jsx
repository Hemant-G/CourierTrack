// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router'; // <--- CORRECTED IMPORT
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

import AdminDashboardPage from './pages/AdminDashboardPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import CourierDashboardPage from './pages/CourierDashboardPage';

import ProtectedRoute from './components/ProtectedRoute'; // Your ProtectedRoute component
import TrackingPage from './pages/TrackingPage';

const AppContent = () => {
  const { user, loading } = useAuth(); // Get user and loading from AuthContext

  if (loading) {
    // A more visually appealing loader could be used here
    return <div className="flex justify-center items-center h-screen text-xl">Loading application...</div>;
  }

  // Helper function to get the correct dashboard path based on user role
  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin-dashboard';
      case 'customer':
        return '/customer-dashboard';
      case 'courier':
        return '/courier-dashboard';
      default:
        return '/'; // Fallback for unhandled roles or no role
    }
  };

  return (
    <>
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/track" element={<TrackingPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} /> {/* Page for unauthorized access */}
          {/* Fallback for undefined routes - keep it at the end */}
          <Route path="*" element={<NotFoundPage />} />


          {/* Login and Register Pages - Redirect if user is already authenticated */}
          {/* If user is logged in, they are redirected to their respective dashboard based on role */}
          <Route
            path="/login"
            element={user ? <Navigate to={getDashboardPath(user.role)} replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to={getDashboardPath(user.role)} replace /> : <RegisterPage />}
          />

          {/* Generic /dashboard route - Redirects to specific dashboard or login */}
          <Route
            path="/dashboard"
            element={
              user ? (
                <Navigate to={getDashboardPath(user.role)} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Protected Routes - Specific Dashboards */}

          {/* Admin Dashboard */}
          {/* Wrapped by ProtectedRoute and has a specific path */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
            {/* Add other admin-specific nested routes here later, e.g., /admin/users, /admin/packages */}
          </Route>

          {/* Customer Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route path="/customer-dashboard" element={<CustomerDashboardPage />} />
            {/* Add other customer-specific nested routes here later, e.g., /my-packages, /send-package */}
          </Route>

          {/* Courier Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['courier']} />}>
            <Route path="/courier-dashboard" element={<CourierDashboardPage />} />
            {/* Add other courier-specific nested routes here later, e.g., /my-deliveries, /update-status/:id */}
          </Route>

        </Routes>
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <AppContent />
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </AuthProvider>
    </Router>
  );
}

export default App;