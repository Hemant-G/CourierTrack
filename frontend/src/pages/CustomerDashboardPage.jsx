import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import { Link } from 'react-router'; 
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const CustomerDashboardPage = () => {
  const { user, loading: authLoading } = useAuth(); // <<<-- Import authLoading here
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerPackages = async () => {
      // Add a check to wait for AuthContext to finish its loading
      if (authLoading) { // <<<-- New check
        setLoading(true); // Keep loading state true while auth is loading
        return;
      }

      if (!user || user.role != 'customer') {
        setError('Not authorized to view this page.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get('/packages');
        setPackages(response.data);
      } catch (err) {
        console.error('Failed to fetch customer packages:', err);
        setError(err.response?.data?.message || 'Failed to load your packages.');
        toast.error('Failed to load your packages.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerPackages();
  }, [user, authLoading]); // <<<-- Add authLoading to dependency array

  // Adjust overall loading state to reflect both component loading and auth loading
  if (loading || authLoading) { // <<<-- Check both here
    return (
      <PageWrapper>
        <div className="text-center py-10">
          <h1 className="text-5xl font-bold mb-4 text-blue-900">Customer Dashboard</h1>
          <p className="text-lg text-gray-700">Loading your package information...</p>
          <div className="mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="text-center py-10 bg-red-100 text-red-800 rounded-lg p-4">
          <h1 className="text-4xl font-bold mb-4">Error</h1>
          <p className="text-lg">{error}</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">Customer Dashboard</h1>
        <p className="text-lg text-gray-700 mb-8 text-center">
          Welcome to your Customer Dashboard! Here you can view the status of your sent and received packages.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card for My Current Packages */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">My Current Packages</h2>
            {packages.length === 0 ? (
              <div className="text-center bg-blue-50 text-blue-900 rounded-lg p-4">
                <p className="text-md font-semibold">You don't have any packages associated with your account yet. 📦</p>
                <p className="mt-1 text-sm">Start by sending a new package!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {packages.map((pkg) => (
                  <div key={pkg._id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-blue-900">Tracking ID: {pkg.trackingId}</h3>
                    <p className="text-gray-700 text-sm mt-1">
                      <strong className="text-gray-800">Status:</strong>{' '}
                      <span className={`font-semibold ${
                        pkg.status === 'Delivered' ? 'text-green-600' :
                        pkg.status === 'In Transit' || pkg.status === 'Picked Up' || pkg.status === 'Out for Delivery' ? 'text-blue-600' :
                        pkg.status === 'Pending' || pkg.status === 'Out for Pickup' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {pkg.status}
                      </span>
                    </p>
                    <p className="text-gray-700 text-sm">
                      <strong className="text-gray-800">From:</strong> {pkg.senderInfo.name}
                    </p>
                    <p className="text-gray-700 text-sm">
                      <strong className="text-gray-800">To:</strong> {pkg.recipientInfo.name}
                    </p>
                    {pkg.currentLocation && (
                      <p className="text-gray-700 text-sm">
                        <strong className="text-gray-800">Current Location:</strong> {pkg.currentLocation}
                      </p>
                    )}
                    {pkg.eta && (
                      <p className="text-gray-700 text-sm">
                        <strong className="text-gray-800">ETA:</strong> {format(new Date(pkg.eta), 'PPP p')}
                      </p>
                    )}
                    <Link
                        to={`/track-package?trackingId=${pkg.trackingId}`}
                        className="mt-3 inline-block bg-blue-900 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded text-sm transition duration-150"
                    >
                        View Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card for Send New Package */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between items-center text-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Send New Package</h2>
            <p className="text-gray-700 mb-6">
              Ready to send something? Start a new shipment request by providing details for your package.
            </p>
            <Link
              to="/create-package"
              className="bg-blue-900 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-center text-lg shadow-md transition duration-150 ease-in-out w-full"
            >
              Request New Shipment ✨
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CustomerDashboardPage;