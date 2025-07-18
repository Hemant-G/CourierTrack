// frontend/src/pages/UserProfilePage.jsx
import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import { useAuth } from '../context/AuthContext';

const UserProfilePage = () => {
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true); // Manages loading state for this component
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = () => {
      if (authLoading) return; // Wait until AuthContext has finished loading the user

      if (!user) {
        // If authLoading is false and user is null, it means not logged in
        setError('You must be logged in to view your profile.');
        setLoading(false);
        return;
      }

      // If user is loaded and authenticated, set their data as profileData
      setProfileData(user);
      setLoading(false);
    };

    loadProfile();
  }, [user, authLoading]); // Re-run when 'user' or 'authLoading' state changes

  if (loading || authLoading) {
    return (
      <PageWrapper>
        <div className="text-center py-10 min-h-[calc(100vh-120px)] flex flex-col justify-center items-center text-gray-800">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-700">Your Profile</h1>
          <p className="text-lg text-gray-600">Loading your profile information...</p>
          <div className="mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="text-center py-10 min-h-[calc(100vh-120px)] flex flex-col justify-center items-center  text-gray-800">
          <div className="bg-red-100 text-red-800 rounded-lg p-6 max-w-md w-full shadow-lg border border-red-200">
            <h1 className="text-4xl font-bold mb-4">Error</h1>
            <p className="text-lg">{error}</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!profileData) {
    // This case should ideally be caught by the error handler, but as a safeguard
    return (
      <PageWrapper>
        <div className="text-center py-10 min-h-[calc(100vh-120px)] flex flex-col justify-center items-center text-gray-800">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-700">Your Profile</h1>
          <p className="text-lg text-gray-600">No profile data available. Please log in.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center py-8  text-gray-800">
        <div className="container mx-auto p-6 max-w-2xl bg-white rounded-lg shadow-xl border border-blue-100">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-blue-900 text-center">Your Profile</h1>

          <div className="space-y-6"> {/* Increased space between items */}
            {/* Display Profile Information */}
            <div className="flex items-center space-x-4 p-5 bg-blue-50 rounded-lg shadow-md border border-blue-100 transition-transform duration-200 hover:scale-[1.01]">
              <span className="text-blue-500 text-3xl">👤</span> {/* Adjusted icon color/size */}
              <div>
                <p className="text-sm font-semibold text-gray-600">Username</p>
                <p className="text-xl font-medium text-gray-900">{profileData.username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-5 bg-blue-50 rounded-lg shadow-md border border-blue-100 transition-transform duration-200 hover:scale-[1.01]">
              <span className="text-green-600 text-3xl">📧</span> {/* Adjusted icon color/size */}
              <div>
                <p className="text-sm font-semibold text-gray-600">Email</p>
                <p className="text-xl font-medium text-gray-900">{profileData.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-5 bg-blue-50 rounded-lg shadow-md border border-blue-100 transition-transform duration-200 hover:scale-[1.01]">
              <span className="text-purple-600 text-3xl">👑</span> {/* Adjusted icon color/size */}
              <div>
                <p className="text-sm font-semibold text-gray-600">Role</p>
                <p className="text-xl font-medium text-gray-900 capitalize">{profileData.role}</p>
              </div>
            </div>

            {profileData.phone && ( // Display phone if available
              <div className="flex items-center space-x-4 p-5 bg-blue-50 rounded-lg shadow-md border border-blue-100 transition-transform duration-200 hover:scale-[1.01]">
                <span className="text-orange-600 text-3xl">📞</span> {/* Adjusted icon color/size */}
                <div>
                  <p className="text-sm font-semibold text-gray-600">Phone Number</p>
                  <p className="text-xl font-medium text-gray-900">{profileData.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default UserProfilePage;