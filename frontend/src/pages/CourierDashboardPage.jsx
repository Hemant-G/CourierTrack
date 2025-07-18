import React, { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../components/PageWrapper';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const CourierDashboardPage = () => {
  // <<<--- IMPORTANT: Destructure 'loading' from useAuth() ---<<<
  const { user, loading: authLoading } = useAuth(); 

  const [assignedPackages, setAssignedPackages] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [loadingAssigned, setLoadingAssigned] = useState(true);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [error, setError] = useState(null);
  const [updatingPackageId, setUpdatingPackageId] = useState(null);
  const [activeTab, setActiveTab] = useState('assigned');

  const [newStatus, setNewStatus] = useState({});
  const [newLocationName, setNewLocationName] = {};
  const [newEta, setNewEta] = {};

  const fetchPackages = useCallback(async (type) => {
    // <<<--- IMPORTANT: Add check for authLoading ---<<<
    if (authLoading) {
      // If AuthContext is still loading, do nothing yet.
      // Keep local loading states true to show overall loading.
      if (type === 'assigned') setLoadingAssigned(true);
      else if (type === 'available') setLoadingAvailable(true);
      return;
    }

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
        const filteredPackages = response.data.filter(pkg => pkg.assignedCourier?._id === user.id);
        setAssignedPackages(filteredPackages);
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
  // <<<--- IMPORTANT: Add authLoading to dependency array ---<<<
  }, [user, authLoading]); 

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
    const locationChanged = newLocationName[packageId] !== undefined && newLocationName[packageId] !== '' && newLocationName[packageId] !== currentPackage.currentLocation;
    const etaChanged = newEta[packageId] && newEta[packageId] !== currentPackage.eta;

    if (statusChanged) {
        dataToUpdate.status = newStatus[packageId];
    }

    if (locationChanged) {
        dataToUpdate.currentLocation = newLocationName[packageId];
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
      toast.success('Package updated successfully! 🚀');
      setNewStatus(prev => ({ ...prev, [packageId]: undefined }));
      setNewLocationName(prev => ({ ...prev, [packageId]: undefined }));
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
      const response = await api.put(`/packages/${packageId}`, { assignedCourier: user.id }); // Using your direct update for assignedCourier
      setAvailablePackages(prev => prev.filter(pkg => pkg._id !== packageId));
      setAssignedPackages(prev => [...prev, response.data]);
      toast.success('Package successfully assigned to you! 🎉');
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

  // <<<--- IMPORTANT: Adjust loading checks in return statement ---<<<
  if (error) {
    return (
      <PageWrapper>
        <div className="min-h-[calc(100vh-120px)] flex flex-col justify-center items-center text-gray-800 p-6">
          <div className="bg-red-100 text-red-800 rounded-lg p-8 max-w-md w-full shadow-lg border border-red-200 text-center">
            <h1 className="text-4xl font-bold mb-4">Error 🚨</h1>
            <p className="text-lg">{error}</p>
          </div>
        </div>
      </PageWrapper>
    );
  }
  
  // Show a global loading spinner if AuthContext is still loading or if either package list is loading
  if (authLoading || loadingAssigned || loadingAvailable) { 
    return (
      <PageWrapper>
        <div className="min-h-[calc(100vh-120px)] flex flex-col justify-center items-center text-gray-800 p-6">
          <h1 className="text-4xl font-bold mb-4 text-blue-900">Courier Dashboard</h1>
          <p className="text-lg text-gray-700">Loading your courier dashboard...</p>
          <div className="mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const renderPackageCards = (pkgList, isLoading) => {
    // No need for isLoading parameter anymore in this function since global loading handles it
    // The check is now `authLoading || loadingAssigned || loadingAvailable` above
    if (pkgList.length === 0) {
      return (
        <div className="text-center text-blue-800 rounded-lg p-8 max-w-xl mx-auto shadow-md border border-blue-200">
          <p className="text-2xl font-bold mb-3">
            {activeTab === 'assigned' ? 'No packages currently assigned to you. 🚚' : 'No available packages for self-assignment. 🎉'}
          </p>
          <p className="mt-4 text-lg text-blue-700">
            {activeTab === 'assigned' ? 'Looks like your queue is empty! Take a break or check for new tasks.' : 'All packages are on the move or awaiting creation by the admin.'}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pkgList.map((pkg) => (
          <div key={pkg._id} className="bg-white p-6 rounded-lg shadow-lg border border-blue-100 flex flex-col justify-between transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div>
              <h2 className="text-2xl font-bold mb-3 text-blue-700">#<span className="text-blue-500">{pkg.trackingId}</span></h2>
              <div className="text-gray-700 text-sm mb-3 space-y-1">
                <p>
                  <strong className="text-blue-600">Status:</strong>{' '}
                  <span className={`font-semibold ${
                    pkg.status === 'Delivered' ? 'text-blue-900' :
                    pkg.status === 'In Transit' || pkg.status === 'Picked Up' || pkg.status === 'Out for Delivery' ? 'text-blue-600' :
                    pkg.status === 'Pending' || pkg.status === 'Out for Pickup' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {pkg.status}
                  </span>
                </p>
                <p>
                  <strong className="text-blue-600">From:</strong> {pkg.pickupAddress}
                </p>
                <p>
                  <strong className="text-blue-600">To:</strong> {pkg.deliveryAddress}
                </p>
                <p>
                  <strong className="text-blue-600">Current Loc:</strong> {pkg.currentLocation || 'N/A'}
                </p>
                {pkg.eta && (
                  <p>
                    <strong className="text-blue-600">ETA:</strong> {format(new Date(pkg.eta), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
                 <p>
                    <strong className="text-blue-600">Sender:</strong> {pkg.senderInfo.name}
                 </p>
                 <p>
                    <strong className="text-blue-600">Recipient:</strong> {pkg.recipientInfo.name}
                 </p>
              </div>

              {activeTab === 'assigned' && (
                <div className="border-t  pt-4 mt-4">
                  <h3 className="font-semibold text-blue-700 mb-3 text-lg">Update Status:</h3>
                  <div className="mb-3">
                    <label htmlFor={`status-${pkg._id}`} className="block text-gray-700 text-xs font-semibold mb-1">Package Status:</label>
                    <select
                      id={`status-${pkg._id}`}
                      className="shadow-sm border border-blue-200 rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-sm bg-white"
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

                  <div className="mb-3">
                    <label htmlFor={`location-${pkg._id}`} className="block text-gray-700 text-xs font-semibold mb-1">New Location:</label>
                    <input
                      type="text"
                      id={`location-${pkg._id}`}
                      className="shadow-sm appearance-none border border-blue-200 rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-sm"
                      placeholder="e.g., Delhi, India"
                      value={newLocationName[pkg._id] !== undefined ? newLocationName[pkg._id] : (pkg.currentLocation || '')}
                      onChange={(e) => setNewLocationName({ ...newLocationName, [pkg._id]: e.target.value })}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor={`eta-${pkg._id}`} className="block text-gray-700 text-xs font-semibold mb-1">Estimated Delivery:</label>
                    <input
                      type="datetime-local"
                      id={`eta-${pkg._id}`}
                      className="shadow-sm appearance-none border border-blue-200 rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-sm bg-white"
                      value={newEta[pkg._id] || (pkg.eta ? format(new Date(pkg.eta), "yyyy-MM-dd'T'HH:mm") : '')}
                      onChange={(e) => setNewEta({ ...newEta, [pkg._id]: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4">
              {activeTab === 'available' && (
                <button
                  onClick={() => handleSelfAssign(pkg._id)}
                  className="w-full bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline text-md transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={updatingPackageId === pkg._id}
                >
                  {updatingPackageId === pkg._id ? 'Assigning...' : 'Self-Assign Package'}
                </button>
              )}
              {activeTab === 'assigned' && (
                <button
                  onClick={() => handleUpdatePackage(pkg._id, pkg)}
                  className="w-full bg-blue-900 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline text-md transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={updatingPackageId === pkg._id}
                >
                  {updatingPackageId === pkg._id ? 'Updating...' : 'Save Package Updates'}
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
      <div className="container mx-auto p-6 min-h-[calc(100vh-120px)]">
        <h1 className="text-5xl font-extrabold mb-4 text-blue-900 text-center drop-shadow-sm">Courier Hub</h1>
        <p className="text-xl text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          Effortlessly manage your assigned deliveries and find new opportunities to keep things moving.
        </p>

        <div className="flex justify-center mb-10 bg-white rounded-lg shadow-md border border-blue-100 p-2">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-8 py-4 text-xl font-semibold rounded-lg mx-2 transition duration-300 ease-in-out transform hover:scale-105 ${
              activeTab === 'assigned' ? 'bg-blue-900 text-white shadow-lg' : 'bg-transparent text-blue-700 hover:bg-blue-50'
            }`}
          >
            My Assigned Packages
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-8 py-4 text-xl font-semibold rounded-lg mx-2 transition duration-300 ease-in-out transform hover:scale-105 ${
              activeTab === 'available' ? 'bg-blue-900 text-white shadow-lg' : 'bg-transparent text-blue-700 hover:bg-blue-50'
            }`}
          >
            Available for Pickup
          </button>
        </div>

        {activeTab === 'assigned' ? renderPackageCards(assignedPackages, loadingAssigned) : renderPackageCards(availablePackages, loadingAvailable)}
      </div>
    </PageWrapper>
  );
};

export default CourierDashboardPage;