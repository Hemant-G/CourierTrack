// frontend/src/pages/AdminDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import PageWrapper from '../components/PageWrapper';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router'; // Make sure Link is imported

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users'); // Fetches all users for admin
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError(err.response?.data?.message || 'Failed to load users.');
        toast.error(err.response?.data?.message || 'Error fetching users.');
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchUsers();
    } else {
      setLoading(false);
      // Optional: Redirect if not admin, though ProtectedRoute should handle this
    }
  }, [user]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        if (userId === user._id) { // Prevent admin from deleting themselves
            toast.error("You cannot delete your own admin account.");
            return;
        }
        await api.delete(`/users/${userId}`); // Calls DELETE /api/users/:id
        setUsers(users.filter((u) => u._id !== userId));
        toast.success('User deleted successfully!');
      } catch (err) {
        console.error('Failed to delete user:', err);
        toast.error(err.response?.data?.message || 'Error deleting user.');
      }
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="text-center text-gray-600">Loading admin data...</div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="text-center text-red-600">Error: {error}</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 text-lg mb-8">
          Welcome, Admin! Here you can manage users and get an overview of all packages.
        </p>

        {/* User Management Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">User Management</h2>
          {users.length === 0 ? (
            <p className="text-gray-600">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left text-gray-600">ID</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Username</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Email</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Role</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b text-gray-800 text-sm truncate max-w-[100px]">{u._id}</td>
                      <td className="py-2 px-4 border-b text-gray-800">{u.username}</td>
                      <td className="py-2 px-4 border-b text-gray-800">{u.email}</td>
                      <td className="py-2 px-4 border-b text-gray-800">{u.role}</td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-2 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Other Admin Sections / Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Package Overview */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Package Overview</h2>
            <p className="text-gray-700">View and manage all packages in the system.</p>
            <Link
              to="/admin/packages"
              className="mt-4 inline-block bg-blue-900 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              View All Packages
            </Link>
          </div>

          
        </div>
      </div>
    </PageWrapper>
  );
};

export default AdminDashboardPage;