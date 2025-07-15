// frontend/src/pages/CourierDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../components/PageWrapper';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const CourierDashboardPage = () => {
  const { user } = useAuth();
  const [assignedPackages, setAssignedPackages] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [loadingAssigned, setLoadingAssigned] = useState(true);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [error, setError] = useState(null);
  const [updatingPackageId, setUpdatingPackageId] = useState(null);
  const [activeTab, setActiveTab] = useState('assigned');

  // State for individual package updates, now using newLocationName
  const [newStatus, setNewStatus] = useState({});
  const [newLocationName, setNewLocationName] = useState({}); // Changed from Lat/Lon
  const [newEta, setNewEta] = useState({});

  const fetchPackages = useCallback(async (type) => {
    if (!user || user.role !== 'courier') {
      setError('Not authorized to view this page.');
      setLoadingAssigned(false);
      setLoadingAvailable(false);
      return;
    }

    try {
      if (type === 'assigned') {
        setLoadingAssigned(true);
        const response = await api.get('/packages');
        setAssignedPackages(response.data);
      } else if (type === 'available') {
        setLoadingAvailable(true);
        const response = await api.get('/packages?assigned=false');
        setAvailablePackages(response.data);
      }
    } catch (err) {
      console.error(`Failed to fetch ${type} packages:`, err);
      setError(err.response?.data?.message || `Failed to load ${type} packages.`);
      toast.error(`Failed to load ${type} packages.`);
    } finally {
      if (type === 'assigned') setLoadingAssigned(false);
      else if (type === 'available') setLoadingAvailable(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPackages('assigned');
  }, [fetchPackages]);

  useEffect(() => {
    if (activeTab === 'available') {
      fetchPackages('available');
    }
  }, [activeTab, fetchPackages]);


  const handleUpdatePackage = async (packageId, currentPackage) => {
    setUpdatingPackageId(packageId);
    setError(null);

    const dataToUpdate = {};
    const statusChanged = newStatus[packageId] && newStatus[packageId] !== currentPackage.status;
    const locationChanged = newLocationName[packageId] !== undefined && newLocationName[packageId] !== '' && newLocationName[packageId] !== currentPackage.currentLocation; // Compare with current string location
    const etaChanged = newEta[packageId] && newEta[packageId] !== currentPackage.eta;

    if (statusChanged) {
        dataToUpdate.status = newStatus[packageId];
    }

    if (locationChanged) {
        dataToUpdate.currentLocation = newLocationName[packageId]; // Assign the string directly
    }

    if (etaChanged) {
        try {
            dataToUpdate.eta = new Date(newEta[packageId]).toISOString();
        } catch (e) {
            toast.error('Invalid ETA date format.');
            setUpdatingPackageId(null);
            return;
        }
    }
    
    if (Object.keys(dataToUpdate).length === 0) {
        toast.info('No changes to save.');
        setUpdatingPackageId(null);
        return;
    }

    try {
      const response = await api.put(`/packages/${packageId}`, dataToUpdate);
      setAssignedPackages(prevPackages =>
        prevPackages.map(pkg => (pkg._id === packageId ? response.data : pkg))
      );
      toast.success('Package updated successfully!');
      // Clear specific package update states
      setNewStatus(prev => ({ ...prev, [packageId]: undefined }));
      setNewLocationName(prev => ({ ...prev, [packageId]: undefined })); // Clear new location name
      setNewEta(prev => ({ ...prev, [packageId]: undefined }));
    } catch (err) {
      console.error('Update failed:', err);
      setError(err.response?.data?.message || 'Failed to update package.');
      toast.error(err.response?.data?.message || 'Failed to update package.');
    } finally {
      setUpdatingPackageId(null);
    }
  };

  const handleSelfAssign = async (packageId) => {
    setUpdatingPackageId(packageId);
    try {
      const response = await api.put(`/packages/${packageId}`, { assignedCourier: user.id });
      setAvailablePackages(prev => prev.filter(pkg => pkg._id !== packageId));
      setAssignedPackages(prev => [...prev, response.data]);
      toast.success('Package successfully assigned to you!');
    } catch (err) {
      console.error('Self-assign failed:', err);
      toast.error(err.response?.data?.message || 'Failed to assign package.');
    } finally {
      setUpdatingPackageId(null);
    }
  };

  const PACKAGE_STATUSES = [
    'Pending',          
    'Out for Pickup',
    'Picked Up',
    'In Transit',
    'Out for Delivery',
    'Delivered',
    'Attempted Delivery',
    'Cancelled',
    'Returned'
  ];

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

  const renderPackageCards = (pkgList, isLoading) => {
    if (isLoading) {
      return (
        <div className="text-center py-10">
          <p className="text-lg text-gray-700">Loading packages...</p>
          <div className="mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        </div>
      );
    }

    if (pkgList.length === 0) {
      return (
        <div className="text-center bg-yellow-100 text-yellow-800 rounded-lg p-6 max-w-xl mx-auto">
          <p className="text-xl font-semibold">
            {activeTab === 'assigned' ? 'No packages currently assigned to you. 🚚' : 'No available packages for self-assignment. 🎉'}
          </p>
          <p className="mt-2 text-md">
            {activeTab === 'assigned' ? 'Check the "Available Packages" tab or contact your admin for assignments.' : 'All packages are currently assigned or awaiting creation.'}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pkgList.map((pkg) => (
          <div key={pkg._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-3 text-blue-700">ID: {pkg.trackingId}</h2>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Current Status:</strong>{' '}
                <span className={`font-semibold ${
                  pkg.status === 'Delivered' ? 'text-green-600' :
                  pkg.status === 'In Transit' || pkg.status === 'Picked Up' || pkg.status === 'Out for Delivery' ? 'text-blue-600' :
                  pkg.status === 'Pending' || pkg.status === 'Out for Pickup' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {pkg.status}
                </span>
              </p>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Sender:</strong> {pkg.senderInfo.name} ({pkg.pickupAddress})
              </p>
              <p className="text-gray-700 text-sm mb-4">
                <strong>Recipient:</strong> {pkg.recipientInfo.name} ({pkg.deliveryAddress})
              </p>
              <p className="text-gray-700 text-sm mb-4">
                <strong>Current Location:</strong> {pkg.currentLocation || 'N/A'} {/* Display the string location */}
              </p>

              {pkg.eta && (
                <p className="text-gray-700 text-sm mb-4">
                  <strong>ETA:</strong> {format(new Date(pkg.eta), 'PPP p')}
                </p>
              )}

              {activeTab === 'assigned' && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Update Package:</h3>
                  <div className="mb-3">
                    <label htmlFor={`status-${pkg._id}`} className="block text-gray-700 text-xs font-bold mb-1">Status:</label>
                    <select
                      id={`status-${pkg._id}`}
                      className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                      value={newStatus[pkg._id] || pkg.status}
                      onChange={(e) => setNewStatus({ ...newStatus, [pkg._id]: e.target.value })}
                    >
                      {PACKAGE_STATUSES.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Single input for location name */}
                  <div className="mb-3">
                    <label htmlFor={`location-${pkg._id}`} className="block text-gray-700 text-xs font-bold mb-1">Current Location (City, State):</label>
                    <input
                      type="text" // Changed to text
                      id={`location-${pkg._id}`}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                      placeholder="e.g., Bengaluru, Karnataka"
                      value={newLocationName[pkg._id] !== undefined ? newLocationName[pkg._id] : (pkg.currentLocation || '')} // Use newLocationName
                      onChange={(e) => setNewLocationName({ ...newLocationName, [pkg._id]: e.target.value })}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor={`eta-${pkg._id}`} className="block text-gray-700 text-xs font-bold mb-1">ETA (Date & Time):</label>
                    <input
                      type="datetime-local"
                      id={`eta-${pkg._id}`}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                      value={newEta[pkg._id] || (pkg.eta ? format(new Date(pkg.eta), "yyyy-MM-dd'T'HH:mm") : '')}
                      onChange={(e) => setNewEta({ ...newEta, [pkg._id]: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {activeTab === 'available' && (
                <button
                  onClick={() => handleSelfAssign(pkg._id)}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm transition duration-150 ease-in-out"
                  disabled={updatingPackageId === pkg._id}
                >
                  {updatingPackageId === pkg._id ? 'Assigning...' : 'Self-Assign This Package'}
                </button>
              )}
              {activeTab === 'assigned' && (
                <button
                  onClick={() => handleUpdatePackage(pkg._id, pkg)}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm transition duration-150 ease-in-out"
                  disabled={updatingPackageId === pkg._id}
                >
                  {updatingPackageId === pkg._id ? 'Updating...' : 'Save Updates'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <PageWrapper>
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">Courier Dashboard</h1>
        <p className="text-lg text-gray-700 mb-8 text-center">Manage your assigned packages.</p>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-6 py-3 text-lg font-medium rounded-l-lg ${
              activeTab === 'assigned' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition duration-200`}
          >
            My Assigned Packages
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-3 text-lg font-medium rounded-r-lg ${
              activeTab === 'available' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition duration-200`}
          >
            Available Packages
          </button>
        </div>

        {activeTab === 'assigned' ? renderPackageCards(assignedPackages, loadingAssigned) : renderPackageCards(availablePackages, loadingAvailable)}
      </div>
    </PageWrapper>
  );
};

export default CourierDashboardPage;