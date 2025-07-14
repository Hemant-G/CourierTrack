// frontend/src/components/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <header className="bg-slate-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold">
          <Link to={user ? '/dashboard' : '/'}>CourierTracker</Link> {/* Adjust default link after login */}
        </div>
        <nav>
          <ul className="flex space-x-6">
            {user ? (
              <>
                {/* Conditional Links based on Role */}
                {user.role === 'admin' && (
                  <li>
                    <Link to="/admin-dashboard" className="hover:text-blue-200 transition-colors duration-200">
                      Admin Dashboard
                    </Link>
                  </li>
                )}
                {user.role === 'customer' && (
                  <li>
                    <Link to="/customer-dashboard" className="hover:text-blue-200 transition-colors duration-200">
                      My Packages
                    </Link>
                  </li>
                )}
                {user.role === 'courier' && (
                  <li>
                    <Link to="/courier-dashboard" className="hover:text-blue-200 transition-colors duration-200">
                      My Deliveries
                    </Link>
                  </li>
                )}
                <li>
                  <Link to="/profile" className="hover:text-blue-200 transition-colors duration-200">
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md transition-colors duration-200"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="hover:text-blue-200 transition-colors duration-200">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-blue-200 transition-colors duration-200">
                    Register
                  </Link>
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