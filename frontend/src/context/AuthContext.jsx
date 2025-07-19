import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../utils/api'; // Make sure this imports your configured API
import { toast } from 'react-toastify';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuthFromLocalStorage = () => {
            try {
                const storedUser = localStorage.getItem('user');
                const storedToken = localStorage.getItem('token');

                if (storedToken) {
                    // Ensure this is EXACTLY as below:
                    const trimmedToken = storedToken.trim(); // <--- CRITICAL (when reading from LS)
                    API.defaults.headers.common['Authorization'] = `Bearer ${trimmedToken}`;
                    setToken(trimmedToken);

                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }
                }
            } catch (error) {
                console.error("Failed to read from localStorage or parse user", error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setUser(null);
                setToken(null);
            } finally {
                setLoading(false);
            }
        };
        initializeAuthFromLocalStorage();
    }, []);

    useEffect(() => {
        if (token) {
            // Ensure this is EXACTLY as below:
            const trimmedToken = token.trim(); // <--- CRITICAL (when token state changes)
            API.defaults.headers.common['Authorization'] = `Bearer ${trimmedToken}`;
            localStorage.setItem('token', trimmedToken); // <--- CRITICAL (store clean token)
        } else {
            delete API.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const login = async (identifier, password) => {
        setLoading(true);
        try {
            const res = await API.post('/auth/login', { identifier, password });
            // Ensure this is EXACTLY as below:
            const receivedToken = res.data.token.trim(); // <--- CRITICAL (when receiving from API)
            setToken(receivedToken);
            setUser(res.data);
            toast.success('Login successful!');
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
            toast.error(errorMessage);
            console.error("Login error:", error.response || error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, email, password, role) => {
        setLoading(true);
        try {
            const res = await API.post('/auth/register', { username, email, password, role });
            // Ensure this is EXACTLY as below:
            const receivedToken = res.data.token.trim(); // <--- CRITICAL (when receiving from API)
            setToken(receivedToken);
            setUser(res.data);
            toast.success('Registration successful! You are now logged in.');
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(errorMessage);
            console.error("Registration error:", error.response || error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        toast.info('You have been logged out.');
    };

    const authContextValue = { user, token, loading, isAuthenticated: !!user && !!token, login, register, logout };

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