// frontend/src/pages/TrackPackagePage.jsx
import React, { useState, useEffect } from 'react';
import API from '../utils/api'; // Our configured Axios instance
import { toast } from 'react-toastify';
import { format } from 'date-fns'; // For better date formatting
import { useSearchParams } from 'react-router'; // Import useSearchParams

const TrackPackagePage = () => {
  const [trackingId, setTrackingId] = useState(''); // Holds the ID from input or URL
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams(); // Initialize useSearchParams hook

  // useEffect to handle initial loading from URL query parameter
  useEffect(() => {
    const idFromUrl = searchParams.get('trackingId'); // Get trackingId from URL query
    if (idFromUrl && idFromUrl !== trackingId) { // Check if ID exists and is different from current state
      setTrackingId(idFromUrl); // Set the input field with the ID from URL
      // Immediately fetch package details if ID is found in URL
      const fetchInitialPackage = async () => {
        setLoading(true);
        setPackageData(null); // Clear previous results
        setError(null);       // Clear previous errors
        try {
          // Use the ID directly from the URL for the API call
          const response = await API.get(`/packages/track/${idFromUrl}`);
          setPackageData(response.data);
          toast.success('Package details fetched successfully!');
        } catch (err) {
          const errorMessage = err.response?.data?.message || 'Failed to fetch package details. Please check the tracking ID.';
          setError(errorMessage);
          toast.error(errorMessage);
          console.error('Initial tracking error:', err.response || err);
        } finally {
          setLoading(false);
        }
      };
      fetchInitialPackage();
    } else if (!idFromUrl && trackingId) {
      // Optional: Clear the state if navigating to /track-package without an ID
      // This provides a clean slate if the user manually removes the ID from the URL
      setTrackingId('');
      setPackageData(null);
      setError(null);
    }
  }, [searchParams, trackingId]); // Dependencies: re-run if searchParams or local trackingId state changes

  // Handles form submission (when user manually enters ID and clicks Track)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPackageData(null); // Clear previous results
    setError(null);       // Clear previous errors

    try {
      // Use the trackingId state (which holds either URL ID or user input ID)
      const response = await API.get(`/packages/track/${trackingId}`);
      setPackageData(response.data);
      toast.success('Package details fetched successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch package details. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Tracking error:', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mb-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-900">Track Your Package</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="trackingId" className="block text-gray-700 text-sm font-semibold mb-2">
              Enter Tracking ID
            </label>
            <input
              type="text"
              id="trackingId"
              className="shadow-sm border border-gray-300 rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., PKG-ABC-123"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition duration-200 ease-in-out"
            disabled={loading}
          >
            {loading ? 'Tracking...' : 'Track Package'}
          </button>
        </form>
      </div>

      {loading && <p className="text-blue-600">Loading package details...</p>}
      {error && <p className="text-red-600 text-center font-medium mt-4">{error}</p>}

      {packageData && (
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mt-8 border border-blue-200">
          <h3 className="text-2xl font-bold mb-4 text-gray-700 border-b pb-2">Package Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="font-semibold">Tracking ID:</p>
              <p>{packageData.trackingId}</p>
            </div>
            <div>
              <p className="font-semibold">Current Status:</p>
              <p className="font-bold text-lg text-blue-700">{packageData.status}</p>
            </div>
            <div>
              <p className="font-semibold">Pickup Address:</p>
              <p>{packageData.pickupAddress}</p>
            </div>
            <div>
              <p className="font-semibold">Delivery Address:</p>
              <p>{packageData.deliveryAddress}</p>
            </div>
            {packageData.assignedCourier && (
              <div>
                <p className="font-semibold">Assigned Courier:</p>
                <p>{packageData.assignedCourier.username}</p>
              </div>
            )}
            {/* Display currentLocation as a string */}
            {packageData.currentLocation && (
              <div>
                <p className="font-semibold">Current Location:</p>
                <p>{packageData.currentLocation}</p>
              </div>
            )}
            {packageData.eta && (
              <div>
                <p className="font-semibold">Estimated Delivery:</p>
                <p>{format(new Date(packageData.eta), 'PPP p')}</p> {/* Formats date nicely */}
              </div>
            )}
          </div>

          {packageData.history && packageData.history.length > 0 && (
            <div className="mt-8 border-t pt-4">
              <h4 className="text-xl font-bold mb-3 text-gray-700">Tracking History</h4>
              <ul className="space-y-3">
                {packageData.history.map((entry, index) => (
                  <li key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="font-semibold text-gray-700">
                      {entry.status}{' '}
                      <span className="text-sm text-gray-500 float-right">
                        {format(new Date(entry.timestamp), 'PPP p')}
                      </span>
                    </p>
                    {/* Display history location as a string */}
                    {entry.location && (
                      <p className="text-sm text-gray-600">Location: {entry.location}</p>
                    )}
                    {/* Display history description (was 'note' in your old code) */}
                    {entry.description && (
                      <p className="text-sm text-gray-600">Details: {entry.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackPackagePage;