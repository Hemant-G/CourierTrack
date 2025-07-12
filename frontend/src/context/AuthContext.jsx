import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../utils/api';
import { toast } from 'react-toastify';

// Create the Auth Context
const AuthContext = createContext();

// Create a custom hook to use the Auth Context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage for persistent login
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      if (storedUser && storedToken) {
        // Basic check if token is expired, or re-validate on mount
        // For simplicity, we'll just parse and set.
        // A more robust solution would validate the token with the backend on app load.
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true); // To indicate if initial loading is done

  // Effect to set the Axios Authorization header whenever the token changes
  useEffect(() => {
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete API.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Effect to load user data on component mount if token exists but user object doesn't
  // Or to re-validate user role etc. (e.g., if admin changes your role)
  useEffect(() => {
    const loadUser = async () => {
      if (token && !user) {
        try {
          const res = await API.get('/auth/me'); // Get user profile
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
          setLoading(false);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
          toast.error("Session expired or invalid. Please log in again.");
          setLoading(false);
        }
      } else {
        setLoading(false); // No token, no user to load
      }
    };
    loadUser();
  }, [token, user]); // Depend on token and user to re-fetch if needed

  const login = async (identifier, password) => {
    try {
      const res = await API.post('/auth/login', { identifier, password });
      setToken(res.data.token);
      setUser(res.data); // Backend returns user data directly on login
      localStorage.setItem('user', JSON.stringify(res.data)); // Store user data
      toast.success('Login successful!');
      return true; // Indicate success
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      console.error("Login error:", error.response || error);
      return false; // Indicate failure
    }
  };

  const register = async (username, email, password, role) => {
    try {
      const res = await API.post('/auth/register', { username, email, password, role });
      // After successful registration, automatically log them in
      setToken(res.data.token);
      setUser(res.data); // Backend returns user data directly on register
      localStorage.setItem('user', JSON.stringify(res.data)); // Store user data
      toast.success('Registration successful! You are now logged in.');
      return true; // Indicate success
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      console.error("Registration error:", error.response || error);
      return false; // Indicate failure
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('You have been logged out.');
  };

  const authContextValue = {
    user,
    token,
    loading, // Expose loading state
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};