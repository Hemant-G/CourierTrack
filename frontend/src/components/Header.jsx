import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth(); // Destructure from useAuth
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          CourierTracker
        </Link>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li>
              <Link to="/" className="hover:text-gray-300">Home</Link>
            </li>
            <li>
              <Link to="/track" className="hover:text-gray-300">Track Package</Link>
            </li>
            {/* Conditional rendering based on authentication state */}
            {!isAuthenticated ? (
              <>
                <li>
                  <Link to="/login" className="hover:text-gray-300">Login</Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-gray-300">Register</Link>
                </li>
              </>
            ) : (
              <>
                {user?.role === 'admin' && ( // Use optional chaining for user
                  <li>
                    <Link to="/admin-dashboard" className="hover:text-gray-300">Admin Dashboard</Link>
                  </li>
                )}
                {user?.role === 'courier' && (
                  <li>
                    <Link to="/courier-dashboard" className="hover:text-gray-300">Courier Dashboard</Link>
                  </li>
                )}
                <li>
                  <span className="text-sm text-gray-400">Welcome, {user?.username} ({user?.role})</span>
                </li>
                <li>
                  <button onClick={handleLogout} className="hover:text-gray-300 bg-red-600 px-3 py-1 rounded">Logout</button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;