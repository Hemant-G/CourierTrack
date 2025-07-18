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
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Always true initially until we finish checking localStorage

  // This useEffect runs once on mount to perform the initial authentication check from localStorage
  useEffect(() => {
    const initializeAuthFromLocalStorage = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedToken) {
          // If a token exists, set it on Axios headers immediately
          API.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          setToken(storedToken); // Set token state
          
          // If user data also exists, parse it and set user state
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            // Edge case: token exists but user data doesn't.
            // This might happen if user clears only 'user' from localStorage.
            // In a real app, you might re-fetch user data here if you had a /auth/me.
            // Since we don't, we'll just rely on the token for now.
            // The dashboard will still try to use 'user.role', so make sure login/register always store 'user'.
          }
        }
      } catch (error) {
        console.error("Failed to read from localStorage or parse user", error);
        // If there's any parsing error, clear localStorage to prevent future issues
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false); // Authentication check from localStorage is complete
      }
    };

    initializeAuthFromLocalStorage();
  }, []); // Run only once on component mount

  // This useEffect ensures Axios header is updated whenever the 'token' state changes
  // (e.g., after login/logout, or initial load from localStorage)
  useEffect(() => {
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token); // Ensure token is stored
    } else {
      delete API.defaults.headers.common['Authorization'];
      localStorage.removeItem('token'); // Ensure token is removed
    }
  }, [token]);

  // Effect to update localStorage for user whenever 'user' state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);


  const login = async (identifier, password) => {
    setLoading(true); // Indicate that an authentication process is starting
    try {
      const res = await API.post('/auth/login', { identifier, password });
      setToken(res.data.token);
      setUser(res.data); // Backend returns user data directly on login
      toast.success('Login successful!');
      return true; // Indicate success
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      console.error("Login error:", error.response || error);
      return false; // Indicate failure
    } finally {
      setLoading(false); // Authentication process is complete
    }
  };

  const register = async (username, email, password, role) => {
    setLoading(true); // Indicate that an authentication process is starting
    try {
      const res = await API.post('/auth/register', { username, email, password, role });
      setToken(res.data.token);
      setUser(res.data); // Backend returns user data directly on register
      toast.success('Registration successful! You are now logged in.');
      return true; // Indicate success
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      console.error("Registration error:", error.response || error);
      return false; // Indicate failure
    } finally {
      setLoading(false); // Authentication process is complete
    }
  };

  const logout = () => {
    // No need to set loading true for logout, it's a quick client-side operation
    setToken(null);
    setUser(null);
    // localStorage.removeItem is handled by the useEffects listening to token/user changes
    // delete API.defaults.headers.common['Authorization']; // Handled by useEffect listening to token
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

  // Render a loading indicator while AuthProvider is initializing from localStorage
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading application...
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 ml-3"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};