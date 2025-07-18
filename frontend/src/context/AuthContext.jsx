import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../utils/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Start with null, will be set after checks
  const [token, setToken] = useState(null); // Start with null, will be set after checks
  const [loading, setLoading] = useState(true); // Always true initially, until authentication check is complete

  // This useEffect runs once on mount to perform the initial authentication check
  useEffect(() => {
    const initializeAuth = async () => {
      let storedUser = null;
      let storedToken = null;

      try {
        storedUser = localStorage.getItem('user');
        storedToken = localStorage.getItem('token');

        if (storedUser) storedUser = JSON.parse(storedUser); // Parse only if not null
        
        // If there's a token in localStorage, set it on Axios headers immediately
        if (storedToken) {
          API.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          setToken(storedToken); // Set token state
        }
      } catch (error) {
        console.error("Failed to read from localStorage or parse user", error);
        // Clear anything bad from localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }

      // Now, try to validate the token/user with the backend if a token exists
      if (storedToken) {
        try {
          const res = await API.get('/auth/me'); // Validate token and get fresh user data
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data)); // Update localStorage with fresh user data
          // No need to set token here, it's already set from storedToken
        } catch (error) {
          console.error("Token validation failed or session expired:", error);
          // If validation fails, clear everything and log out
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          delete API.defaults.headers.common['Authorization'];
          setUser(null);
          setToken(null);
          toast.error("Your session has expired. Please log in again.");
        }
      }
      // Finally, set loading to false whether a user was loaded or not
      setLoading(false); 
    };

    initializeAuth();
  }, []); // Run only once on component mount

  // This useEffect ensures Axios header is updated whenever 'token' state changes
  // (e.g., after login/logout, or initial load)
  useEffect(() => {
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token); // Ensure it's stored if set by login/register
    } else {
      delete API.defaults.headers.common['Authorization'];
      localStorage.removeItem('token'); // Ensure it's removed if token becomes null
    }
  }, [token]);

  const login = async (identifier, password) => {
    setLoading(true); // Start loading state for login
    try {
      const res = await API.post('/auth/login', { identifier, password });
      setToken(res.data.token);
      setUser(res.data);
      // localStorage.setItem('user', JSON.stringify(res.data)); // Handled by initializeAuth and useEffect
      // localStorage.setItem('token', res.data.token); // Handled by useEffect
      toast.success('Login successful!');
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      console.error("Login error:", error.response || error);
      return false;
    } finally {
      setLoading(false); // End loading state for login
    }
  };

  const register = async (username, email, password, role) => {
    setLoading(true); // Start loading state for register
    try {
      const res = await API.post('/auth/register', { username, email, password, role });
      setToken(res.data.token);
      setUser(res.data);
      // localStorage.setItem('user', JSON.stringify(res.data)); // Handled by initializeAuth and useEffect
      // localStorage.setItem('token', res.data.token); // Handled by useEffect
      toast.success('Registration successful! You are now logged in.');
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      console.error("Registration error:", error.response || error);
      return false;
    } finally {
      setLoading(false); // End loading state for register
    }
  };

  const logout = () => {
    setLoading(true); // Set loading to true while logging out
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete API.defaults.headers.common['Authorization']; // Ensure header is cleared immediately
    toast.info('You have been logged out.');
    setLoading(false); // Set loading to false after logout
  };

  const authContextValue = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  };

  // Only render children when authentication process is complete
  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};