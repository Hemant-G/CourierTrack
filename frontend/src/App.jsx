// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router'; // Corrected import to react-router-dom
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
import CreatePackagePage from './pages/CreatePackagePage';
import UserProfilePage from './pages/UserProfilePage';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading application...</div>;
  }

  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin-dashboard';
      case 'customer':
        return '/customer-dashboard';
      case 'courier':
        return '/courier-dashboard';
      default:
        return '/';
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
                    <Route path="/track-package" element={<TrackingPage />} /> 
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Login and Register Pages - Redirect if user is already authenticated */}
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

          {/* Protected Routes */}

          {/* User Profile  */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'customer', 'courier']} />}>
            <Route path="/profile" element={<UserProfilePage />} /> {/* <-- ADD THIS ROUTE */}
          </Route>

          {/* Admin Dashboard and Admin-specific routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
            {/* Add other admin-specific nested routes here */}
          </Route>

          {/* Customer Dashboard and Customer-specific routes */}
          <Route element={<ProtectedRoute allowedRoles={['customer']} />}> 
            <Route path="/customer-dashboard" element={<CustomerDashboardPage />} />
            <Route path="/create-package" element={<CreatePackagePage />} />
            {/* Add other customer-specific nested routes here */}
          </Route>

          {/* Courier Dashboard and Courier-specific routes */}
          <Route element={<ProtectedRoute allowedRoles={['courier']} />}>
            <Route path="/courier-dashboard" element={<CourierDashboardPage />} />
            {/* Add other courier-specific nested routes here */}
          </Route>

          {/* Fallback for undefined routes - keep it at the end */}
          <Route path="*" element={<NotFoundPage />} />

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