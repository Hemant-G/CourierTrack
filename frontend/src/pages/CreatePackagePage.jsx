// frontend/src/pages/CreatePackagePage.jsx
import React, { useState } from 'react';
import PageWrapper from '../components/PageWrapper';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router'; // Corrected import for useNavigate

const CreatePackagePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    senderInfo: { name: '', address: '', phone: '', email: '' },
    recipientInfo: { name: '', address: '', phone: '', email: '' },
    // pickupAddress and deliveryAddress are now implied from sender/recipient addresses or set by backend
    // eta is removed
    // currentLocation and status will be defaulted by backend
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('senderInfo.') || name.startsWith('recipientInfo.')) {
      const [parent, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client-side validation (Adjusted for removed fields)
    if (!formData.senderInfo.name || !formData.senderInfo.address || !formData.senderInfo.phone ||
        !formData.recipientInfo.name || !formData.recipientInfo.address || !formData.recipientInfo.phone) {
      toast.error('Please fill in all required sender and recipient information.');
      setLoading(false);
      return;
    }

    try {
      const packageDataToSend = {
        ...formData,
        // Backend will default status, currentLocation, pickupAddress, deliveryAddress, and eta
        // based on senderInfo and recipientInfo, or other backend logic.
      };

      const response = await api.post('/packages', packageDataToSend); // Ensure API path is correct
      toast.success('Package created successfully!');
      // Redirect to customer dashboard or a tracking page for the new package
      navigate(`/customer-dashboard`); // Or `/track-package?trackingId=${response.data.trackingId}`
    } catch (err) {
      console.error('Package creation failed:', err);
      setError(err.response?.data?.message || 'Failed to create package.');
      toast.error(err.response?.data?.message || 'Failed to create package.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">Create New Shipment</h1>
        <p className="text-lg text-gray-700 mb-8 text-center">
          Enter the sender and recipient details for your new package.
        </p>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              {error}
            </div>
          )}

          <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Sender Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="senderName" className="block text-gray-700 text-sm font-bold mb-2">Name *</label>
              <input type="text" id="senderName" name="senderInfo.name" value={formData.senderInfo.name} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div>
              <label htmlFor="senderEmail" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input type="email" id="senderEmail" name="senderInfo.email" value={formData.senderInfo.email} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="senderAddress" className="block text-gray-700 text-sm font-bold mb-2">Address *</label>
              <input type="text" id="senderAddress" name="senderInfo.address" value={formData.senderInfo.address} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div>
              <label htmlFor="senderPhone" className="block text-gray-700 text-sm font-bold mb-2">Phone *</label>
              <input type="tel" id="senderPhone" name="senderInfo.phone" value={formData.senderInfo.phone} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Recipient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="recipientName" className="block text-gray-700 text-sm font-bold mb-2">Name *</label>
              <input type="text" id="recipientName" name="recipientInfo.name" value={formData.recipientInfo.name} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div>
              <label htmlFor="recipientEmail" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input type="email" id="recipientEmail" name="recipientInfo.email" value={formData.recipientInfo.email} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="recipientAddress" className="block text-gray-700 text-sm font-bold mb-2">Address *</label>
              <input type="text" id="recipientAddress" name="recipientInfo.address" value={formData.recipientInfo.address} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div>
              <label htmlFor="recipientPhone" className="block text-gray-700 text-sm font-bold mb-2">Phone *</label>
              <input type="tel" id="recipientPhone" name="recipientInfo.phone" value={formData.recipientInfo.phone} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
          </div>

          {/* Removed Package Details section: pickupAddress, deliveryAddress, and eta */}
          {/* <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Package Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-1">
              <label htmlFor="pickupAddress" className="block text-gray-700 text-sm font-bold mb-2">Pickup Address *</label>
              <input type="text" id="pickupAddress" name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="deliveryAddress" className="block text-gray-700 text-sm font-bold mb-2">Delivery Address *</label>
              <input type="text" id="deliveryAddress" name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="eta" className="block text-gray-700 text-sm font-bold mb-2">Estimated Delivery Date & Time</label>
              <input type="datetime-local" id="eta" name="eta" value={formData.eta} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
          </div> */}

          <button
            type="submit"
            className="bg-blue-900 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-center text-lg shadow-md transition duration-150 ease-in-out w-full"
            disabled={loading}
          >
            {loading ? 'Creating Package...' : 'Submit New Package'}
          </button>
        </form>
      </div>
    </PageWrapper>
  );
};

export default CreatePackagePage;