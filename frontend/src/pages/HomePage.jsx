// frontend/src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router'; // Use Link from react-router-dom for SPA navigation
import Header from '../components/Header';

const HomePage = () => {
  // Replace this URL with your desired background image URL
  const heroImageUrl = 'https://images.pexels.com/photos/5025643/pexels-photo-5025643.jpeg'; 

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center bg-gray-900 text-white bg-cover bg-center relative" style={{ backgroundImage: `url(${heroImageUrl})` }}>
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