// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router'; // <--- Ensure this is 'react-router-dom'
import { useAuth } from '../context/AuthContext'; // Custom hook for authentication

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const { login, user, isAuthenticated } = useAuth(); // Auth state and functions
  const navigate = useNavigate(); // Navigation hook

  // Effect to redirect after successful login or if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        // Redirect to a default path for other roles
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]); // Dependencies for effect re-run

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      await login(identifier, password); // Call login function from AuthContext
    } catch (error) {
      // Error handling is managed by AuthContext via toastify
      console.error('Login attempt failed:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome Back!</h2>
        <p className="text-gray-600 mb-8">Sign in to access your account.</p>

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
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-blue-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out"
          >
            Login
          </button>
        </form>

        <p className="mt-8 text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition duration-150 ease-in-out"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;