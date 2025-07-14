// frontend/src/pages/UnauthorizedPage.jsx
import React from 'react';
import { Link } from 'react-router';
import PageWrapper from '../components/PageWrapper';

const UnauthorizedPage = () => {
  return (
    <PageWrapper>
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-5xl font-bold text-red-600 mb-4">403</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600 text-lg mb-6">
          You do not have the necessary permissions to view this page.
        </p>
        <Link
          to="/login"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
        >
          Go to Login
        </Link>
      </div>
    </PageWrapper>
  );
};

export default UnauthorizedPage;