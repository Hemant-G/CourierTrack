// frontend/src/pages/CustomerDashboardPage.jsx
import React from 'react';
import PageWrapper from '../components/PageWrapper';

const CustomerDashboardPage = () => {
  return (
    <PageWrapper>
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Customer Dashboard</h1>
        <p className="text-gray-600 text-lg">
          Welcome to your Customer Dashboard! Here you can view the status of your sent and received packages.
        </p>
        {/* Future Customer content goes here */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">My Current Packages</h2>
            <p className="text-gray-700">View packages in transit or pending delivery.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Send New Package</h2>
            <p className="text-gray-700">Initiate a new shipment request.</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CustomerDashboardPage;