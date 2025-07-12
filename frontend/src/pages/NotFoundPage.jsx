import React from 'react';
import { Link } from 'react-router';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
      <Link to="/" className="text-blue-500 hover:underline">
        Go to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;