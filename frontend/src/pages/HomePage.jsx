import React from 'react';

const HomePage = () => {
  return (
    <div className="text-center py-10">
      <h1 className="text-4xl font-bold mb-4">Welcome to Courier Tracker!</h1>
      <p className="text-lg text-gray-700">Track your packages with ease.</p>
      <div className="mt-8">
        <a href="/track" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4">
          Track a Package
        </a>
        <a href="/login" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
          Login
        </a>
      </div>
    </div>
  );
};

export default HomePage;