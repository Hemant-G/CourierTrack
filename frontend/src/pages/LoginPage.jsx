import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext'; 

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const { login, user, isAuthenticated } = useAuth(); // Auth state and functions
  const navigate = useNavigate(); // Navigation hook

  // Replace this URL with your desired background image URL for the login page
  const bgImageUrl = 'https://images.pexels.com/photos/5025643/pexels-photo-5025643.jpeg'; 
  // This is the same as the HomePage. If you want a different one, change it here.

  // Effect to redirect after successful login or if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'customer') {
        navigate('/customer-dashboard'); // Assuming you have a customer dashboard
      } else if (user.role === 'courier') {
        navigate('/courier-dashboard'); // Assuming you have a courier dashboard
      } else {
        // Fallback for any other roles or default login
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]); // Dependencies for effect re-run

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      await login(identifier, password); // Call login function from AuthContext
    } catch (error) {
      // Error handling is managed by AuthContext via toastify (or handled explicitly here if needed)
      console.error('Login attempt failed:', error);
    }
  };

  return (
    // Apply background image and color scheme to the main container
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-gray-900 text-white bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImageUrl})` }}
    >
      {/* Overlay for better readability of the form */}
      <div className="absolute inset-0 bg-slate-900 opacity-70"></div>

      {/* Login Form Container - place it above the overlay with z-index */}
      <div className="relative z-10 bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h2 className="text-4xl font-bold text-slate-800 mb-6">Welcome Back!</h2>
        <p className="text-slate-600 mb-8 text-lg">Sign in to access your account.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 text-left mb-1">
              Username or Email
            </label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800"
              placeholder="Enter your username or email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Login
          </button>
        </form>

        <p className="mt-8 text-md text-slate-600">
          Don't have an account?{' '}
          <Link // Use Link component for SPA navigation
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition duration-150 ease-in-out"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;