// frontend/src/pages/TrackingPage.jsx
import React, { useState } from 'react';
import PageWrapper from '../components/PageWrapper';
import api from '../utils/api'; // Your Axios instance
import { toast } from 'react-toastify';
import { format } from 'date-fns'; // For date formatting, install if you don't have: npm install date-fns

const TrackingPage = () => {
  const [trackingId, setTrackingId] = useState('');
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPackageData(null);
    setError(null);

    if (!trackingId.trim()) {
      toast.error('Please enter a tracking ID.');
      setLoading(false);
      return;
    }

    try {
      // This will call your backend endpoint: GET /api/public/track/:trackingId
      const response = await api.get(`/packages/track/${trackingId}`); // Make sure your backend has this route!
      setPackageData(response.data);
      toast.success('Package found!');
    } catch (err) {
      console.error('Tracking error:', err);
      setError(err.response?.data?.message || 'Failed to fetch package details. Please check the tracking ID.');
      toast.error(err.response?.data?.message || 'Package not found or error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">Track Your Package</h1>

        <form onSubmit={handleTrack} className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mb-8">
          <div className="mb-4">
            <label htmlFor="trackingId" className="block text-gray-700 text-sm font-bold mb-2">
              Tracking ID:
            </label>
            <input
              type="text"
              id="trackingId"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter tracking ID (e.g., PKG-XYZ-789)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            disabled={loading}
          >
            {loading ? 'Tracking...' : 'Track Package'}
          </button>
        </form>

        {error && (
          <div className="max-w-md mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {packageData && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Package Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div>
                <strong>Tracking ID:</strong> {packageData.trackingId}
              </div>
              <div>
                <strong>Status:</strong> <span className={`font-semibold ${
                  packageData.status === 'delivered' ? 'text-green-600' :
                  packageData.status === 'in-transit' ? 'text-blue-600' :
                  packageData.status === 'pending' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>{packageData.status.toUpperCase()}</span>
              </div>
              <div>
                <strong>Sender:</strong> {packageData.senderInfo.name}
              </div>
              <div>
                <strong>Recipient:</strong> {packageData.recipientInfo.name}
              </div>
              <div className="col-span-2">
                <strong>Pickup Address:</strong> {packageData.pickupAddress}
              </div>
              <div className="col-span-2">
                <strong>Delivery Address:</strong> {packageData.deliveryAddress}
              </div>
              {packageData.eta && (
                <div className="col-span-2">
                  <strong>Estimated Delivery:</strong> {format(new Date(packageData.eta), 'PPP')}
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold mt-6 mb-3 text-gray-800">Tracking History</h3>
            {packageData.history && packageData.history.length > 0 ? (
              <ul className="space-y-4">
                {packageData.history
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort by newest first
                  .map((entry, index) => (
                    <li key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex justify-between items-center text-sm font-semibold text-gray-600">
                        <span>{format(new Date(entry.timestamp), 'PPP p')}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          entry.status === 'delivered' ? 'bg-green-200 text-green-800' :
                          entry.status === 'in-transit' ? 'bg-blue-200 text-blue-800' :
                          entry.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>{entry.status.toUpperCase()}</span>
                      </div>
                      <p className="text-gray-800 mt-2">{entry.note}</p>
                      {entry.location && entry.location.coordinates && (
                        <p className="text-gray-500 text-sm mt-1">
                          Location: {entry.location.coordinates[0]}, {entry.location.coordinates[1]}
                        </p>
                      )}
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-gray-600">No tracking history available yet.</p>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default TrackingPage;