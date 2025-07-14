// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * ProtectedRoute component to guard routes based on authentication and roles.
 * @param {object} props - Component props.
 * @param {Array<string>} [props.allowedRoles] - Optional array of roles allowed to access this route.
 * @returns {JSX.Element} The child component if authorized, or a Navigate component for redirection.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth(); // Get user and loading state from AuthContext

  // While authentication state is loading, render nothing or a loading spinner
  if (loading) {
    return <div>Loading authentication...</div>; // Or a proper loading spinner/component
  }

  // If user is logged in
  if (user) {
    // If specific roles are required, check if user's role is in allowedRoles
    if (allowedRoles && allowedRoles.length > 0) {
      if (allowedRoles.includes(user.role)) {
        return <Outlet />; // User is allowed, render child routes
      } else {
        // User is authenticated but does not have the required role
        toast.error('You do not have permission to access this page!');
        // Redirect to a dashboard or a general unauthorized page
        if (user.role === 'admin') {
          return <Navigate to="/admin-dashboard" replace />;
        } else if (user.role === 'customer') {
          return <Navigate to="/customer-dashboard" replace />;
        } else if (user.role === 'courier') {
          return <Navigate to="/courier-dashboard" replace />;
        } else {
          // Fallback for unexpected roles
          return <Navigate to="/unauthorized" replace />;
        }
      }
    } else {
      // No specific roles required (just authenticated user)
      return <Outlet />; // Render child routes
    }
  } else {
    // User is not authenticated, redirect to login page
    toast.warn('You need to log in to access this page!');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;