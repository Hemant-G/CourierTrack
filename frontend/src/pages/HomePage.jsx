// frontend/src/pages/HomePage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router';
// import Header from '../components/Header'; // Uncomment if you're using this component elsewhere

const HomePage = () => {
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState(null); // State for API response
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(''); // State for error messages

  const heroImageUrl = 'https://images.pexels.com/photos/5025643/pexels-photo-5025643.jpeg'; 

  const handleTrack = async () => {
    if (trackingId.trim() === '') {
      setError('Please enter a tracking ID.');
      setTrackingResult(null);
      return;
    }

    setLoading(true);
    setError('');
    setTrackingResult(null); // Clear previous results

    try {
      // Assuming your backend is deployed at a base URL (e.g., https://your-backend.vercel.app)
      // You'll need to replace '/api/packages/track/' with your actual backend URL + path
      const backendBaseUrl = process.env.NODE_ENV === 'production' 
                             ? 'https://your-backend-url.vercel.app' // <<-- REPLACE THIS WITH YOUR DEPLOYED BACKEND URL
                             : 'http://localhost:5000'; // For local development

      const response = await fetch(`${backendBaseUrl}/api/packages/track/${trackingId}`);
      
      const data = await response.json();

      if (!response.ok) {
        // If the response is not 2xx, it's an error from the API
        setError(data.message || 'Failed to fetch tracking details. Please try again.');
        return;
      }

      setTrackingResult(data);
    } catch (err) {
      console.error('Error tracking package:', err);
      setError('Network error. Could not connect to the tracking service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center bg-gray-900 text-white bg-cover bg-center relative" style={{ backgroundImage: `url(${heroImageUrl})` }}>
      {/* Hero Section - Centered content */}
      <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-900/80 bg-opacity-60 rounded-lg shadow-2xl z-10 mx-4 max-w-lg">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animate-fadeIn">
          Track Your Deliveries <span className="text-blue-400">Effortlessly</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 leading-relaxed animate-fadeIn animation-delay-200">
          Get real-time updates on your packages, from our door to yours.
        </p>
        
        {/* Track by ID Section */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <input
            type="text"
            placeholder="Enter Tracking ID"
            className="p-3 w-full sm:w-2/3 md:w-3/4 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleTrack();
              }
            }}
          />
          <button
            onClick={handleTrack}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 w-full sm:w-1/3 md:w-auto"
            disabled={loading} // Disable button during loading
          >
            {loading ? 'Tracking...' : 'Track Package'}
          </button>
        </div>

        {/* Display Tracking Result or Error */}
        {loading && <p className="text-blue-400 mt-4">Loading tracking details...</p>}
        {error && <p className="text-red-400 mt-4">{error}</p>}
        {trackingResult && (
          <div className="bg-gray-800 p-6 rounded-lg mt-6 w-full text-left shadow-lg animate-fadeIn">
            <h3 className="text-2xl font-bold mb-4 text-blue-300">Package Details:</h3>
            <p className="mb-2"><span className="font-semibold">Tracking ID:</span> {trackingResult.trackingId}</p>
            <p className="mb-2"><span className="font-semibold">Status:</span> <span className={`font-bold ${trackingResult.status === 'Delivered' ? 'text-green-400' : 'text-yellow-400'}`}>{trackingResult.status}</span></p>
            <p className="mb-2"><span className="font-semibold">Current Location:</span> {trackingResult.currentLocation}</p>
            {trackingResult.eta && <p className="mb-2"><span className="font-semibold">Estimated Delivery:</span> {new Date(trackingResult.eta).toLocaleDateString()}</p>}
            
            {trackingResult.history && trackingResult.history.length > 0 && (
              <div className="mt-4 border-t border-gray-700 pt-4">
                <h4 className="text-xl font-semibold mb-3 text-blue-200">Tracking History:</h4>
                <ul className="list-disc pl-5">
                  {trackingResult.history.map((item, index) => (
                    <li key={index} className="mb-1 text-sm">
                      <span className="font-semibold">{new Date(item.timestamp).toLocaleString()}:</span> {item.status} at {item.location} ({item.description || 'No description'})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!trackingResult.history || trackingResult.history.length === 0 && <p className="mt-2 text-sm text-gray-400">No detailed history available yet.</p>}
          </div>
        )}

        <p className="text-lg animate-fadeIn animation-delay-400 mt-8">
          Already have an account? <Link to="/login" className="text-blue-400 hover:underline font-semibold">Log In</Link>
        </p>
      </div>

      {/* Optional: Add a section below the hero for features or more info */}
      <section className="w-full py-16 bg-slate-800/60 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-10">Why Choose Courier Tracker?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-6 bg-slate-700 rounded-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-blue-300">Real-Time Updates</h3>
              <p className="text-slate-300">Get instant notifications on your package's journey from dispatch to delivery.</p>
            </div>
            <div className="p-6 bg-slate-700 rounded-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-blue-300">Secure & Reliable</h3>
              <p className="text-slate-300">Your data and package information are protected with industry-leading security.</p>
            </div>
            <div className="p-6 bg-slate-700 rounded-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-blue-300">User-Friendly Interface</h3>
              <p className="text-slate-300">Our intuitive design makes tracking simple for everyone.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;