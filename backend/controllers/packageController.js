import mongoose from 'mongoose'; // Import mongoose for ObjectId validation
import Package from '../models/Package.js';
import User from '../models/User.js'; // User model is imported but not directly used in these functions. Keep if planned for future use.

const generateUniqueTrackingId = () => {
    return 'PKG-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 7).toUpperCase();
};

const createPackage = async (req, res) => {
    try {
        const packageData = req.body;

        // --- Critical Input Validation Checks for Sender/Recipient Info ---
        // Ensure senderInfo and recipientInfo objects and their required properties exist AND are non-empty
        if (!packageData.senderInfo || !packageData.senderInfo.name || !packageData.senderInfo.address || !packageData.senderInfo.phone ||
            packageData.senderInfo.name.trim() === '' || packageData.senderInfo.address.trim() === '' || packageData.senderInfo.phone.trim() === '') {
            return res.status(400).json({ message: 'Sender name, address, and phone are required and cannot be empty.' });
        }
        if (!packageData.recipientInfo || !packageData.recipientInfo.name || !packageData.recipientInfo.address || !packageData.recipientInfo.phone ||
            packageData.recipientInfo.name.trim() === '' || packageData.recipientInfo.address.trim() === '' || packageData.recipientInfo.phone.trim() === '') {
            return res.status(400).json({ message: 'Recipient name, address, and phone are required and cannot be empty.' });
        }

        // Auto-fill pickup and delivery addresses from sender/recipient addresses
        // These lines should now reliably set the addresses due to the validation above
        packageData.pickupAddress = packageData.senderInfo.address;
        packageData.deliveryAddress = packageData.recipientInfo.address;

        // Generate trackingId if not provided (recommended)
        if (!packageData.trackingId) {
            packageData.trackingId = generateUniqueTrackingId();
        }

        // Set initial status and current location (defaults from schema will also apply)
        packageData.status = packageData.status || 'Pending';
        packageData.currentLocation = packageData.currentLocation || packageData.pickupAddress; // Will now be valid

        // Set a default ETA (e.g., 3 days from current date and time if not provided)
        if (!packageData.eta) {
            const defaultEta = new Date();
            defaultEta.setDate(defaultEta.getDate() + 3);
            packageData.eta = defaultEta;
        }

        // Remove the manual history push here, as it's handled by Mongoose pre('save') middleware
        // packageData.history = [{ ... }];

        const newPackage = await Package.create(packageData);
        res.status(201).json(newPackage);

    } catch (error) {
        console.error("Error creating package:", error); // Logs the full error object

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Package validation failed: ${messages.join(', ')}` }); // More informative
        }
        if (error.code === 11000 && error.keyPattern && error.keyPattern.trackingId) {
            return res.status(409).json({ message: 'A package with this tracking ID already exists. Please try again.' });
        }
        res.status(500).json({ message: 'Server error during package creation.' });
    }
};

// @desc    Get all packages (admin), assigned/unassigned packages (courier), or user's packages (customer)
// @route   GET /api/packages
// @access  Private (Admin, Courier, Customer)
const getPackages = async (req, res) => {
    try {
        let query = {};
        const { assigned } = req.query; 

        // Determine query based on user role
        if (req.user.role === 'courier') {
            if (assigned === 'false') {
                // Courier requests unassigned packages
                query = { assignedCourier: null };
            } else {
                // Courier requests packages assigned to them
                query = { assignedCourier: req.user.id };
            }
        } else if (req.user.role === 'admin') {
            if (assigned === 'false') {
                // Admin requests unassigned packages
                query = { assignedCourier: null };
            }
            // If 'assigned' is not 'false', admin sees all packages (query remains empty)
        } else if (req.user.role === 'customer') {
            // Customer sees packages where they are the sender or recipient
            query = {
                $or: [
                    { 'senderInfo.email': req.user.email },
                    { 'recipientInfo.email': req.user.email },
                ]
            };
        } else {
            // Fallback for roles not explicitly handled (should be caught by authMiddleware)
            return res.status(403).json({ message: 'Not authorized to access package list.' });
        }

        const packages = await Package.find(query).populate('assignedCourier', 'username email');
        res.status(200).json(packages);

    } catch (error) {
        console.error("Error fetching packages:", error); // Added context to console error
        res.status(500).json({ message: 'Server error fetching packages.' });
    }
};

// @desc    Get single package by ID or Tracking ID
// @route   GET /api/packages/:id
// @access  Private (Admin, Courier, Customer)
const getPackageById = async (req, res) => {
    try {
        let packageItem;
        const idParam = req.params.id;

        // Check if the ID parameter is a valid MongoDB ObjectId or a trackingId
        if (mongoose.Types.ObjectId.isValid(idParam) && idParam.length === 24) {
            packageItem = await Package.findById(idParam).populate('assignedCourier', 'username email');
        } else {
            packageItem = await Package.findOne({ trackingId: idParam }).populate('assignedCourier', 'username email');
        }

        if (!packageItem) {
            return res.status(404).json({ message: 'Package not found.' });
        }

        // Authorization check for non-admin users
        if (req.user && req.user.role !== 'admin') {
            const isSenderOrRecipient = (
                (packageItem.senderInfo.email && packageItem.senderInfo.email === req.user.email) ||
                (packageItem.recipientInfo.email && packageItem.recipientInfo.email === req.user.email) ||
                // Include phone checks if req.user has phone and it's used for identification
                (packageItem.senderInfo.phone && packageItem.senderInfo.phone === req.user.phone) ||
                (packageItem.recipientInfo.phone && packageItem.recipientInfo.phone === req.user.phone)
            );
            const isAssignedCourier = (packageItem.assignedCourier && packageItem.assignedCourier._id.toString() === req.user.id);

            // If user is not admin AND is neither a sender/recipient NOR an assigned courier, deny access.
            if (!isSenderOrRecipient && !isAssignedCourier) {
                return res.status(403).json({ message: 'Not authorized to view this package.' });
            }
        }

        res.status(200).json(packageItem);

    } catch (error) {
        console.error("Error fetching package by ID/Tracking ID:", error); // Added context
        // Do not use error.kind === 'ObjectId' as `findOne({ trackingId: ... })` doesn't throw this
        res.status(500).json({ message: 'Server error fetching package details.' });
    }
};

// @desc    Get public package details by Tracking ID
// @route   GET /api/track/:trackingId
// @access  Public
const getPublicPackageDetails = async (req, res, next) => {
    try {
        const { trackingId } = req.params;

        // Select only non-sensitive fields for public view
        const packageItem = await Package.findOne({ trackingId })
            .select('trackingId status currentLocation eta history.status history.timestamp history.location history.description assignedCourier')
            .populate('assignedCourier', 'username'); // Only populate username for courier

        if (!packageItem) {
            // Return 404 JSON response for consistency
            return res.status(404).json({ message: 'Package not found or invalid tracking ID.' });
        }

        res.status(200).json(packageItem);

    } catch (error) {
        console.error("Error fetching public package details:", error); // Added context
        next(error); // Pass to general error handling middleware
    }
};

// @desc    Update a package
// @route   PUT /api/packages/:id
// @access  Private (Admin, Courier)
const updatePackage = async (req, res) => {
    try {
        const { status, currentLocation, eta, assignedCourier, ...otherUpdates } = req.body;
        const packageId = req.params.id;

        let packageItem = await Package.findById(packageId);

        if (!packageItem) {
            return res.status(404).json({ message: 'Package not found.' });
        }

        // Authorization and update logic based on user role
        if (req.user.role === 'courier') {
            // Couriers can only update specific fields
            const allowedCourierUpdateFields = ['status', 'currentLocation', 'eta', 'assignedCourier'];
            const disallowedUpdates = Object.keys(otherUpdates).filter(key =>
                !allowedCourierUpdateFields.includes(key)
            );

            if (disallowedUpdates.length > 0) {
                return res.status(400).json({ message: `Couriers cannot update fields: ${disallowedUpdates.join(', ')}.` });
            }

            // Handle courier self-assignment
            if (assignedCourier && assignedCourier.toString() === req.user.id) {
                // Allow self-assignment if package is unassigned or already assigned to self
                if (!packageItem.assignedCourier || packageItem.assignedCourier._id.toString() !== req.user.id) {
                    packageItem.assignedCourier = assignedCourier;
                    packageItem.history.push({
                        status: packageItem.status, // Current status before other updates
                        location: packageItem.currentLocation, // Current location before other updates
                        description: `Package assigned to courier ${req.user.username || req.user.email}.`
                    });
                }
            } else if (assignedCourier && assignedCourier.toString() !== req.user.id) {
                // Courier trying to assign to someone else or take someone else's package
                return res.status(403).json({ message: 'Couriers cannot change assigned courier or assign packages to others.' });
            }

            // Update allowed fields and add history only if values have genuinely changed
            if (status && packageItem.status !== status) {
                packageItem.status = status;
                packageItem.history.push({ status, location: currentLocation || packageItem.currentLocation, description: `Status updated to ${status} by courier.` });
            }
            if (currentLocation && packageItem.currentLocation !== currentLocation) {
                packageItem.currentLocation = currentLocation;
                packageItem.history.push({ status: packageItem.status, location: currentLocation, description: `Location updated to ${currentLocation} by courier.` });
            }
            if (eta && new Date(packageItem.eta).getTime() !== new Date(eta).getTime()) { // Compare date values for change
                packageItem.eta = eta;
            }

        } else if (req.user.role === 'admin') {
            // Admin can update any field from the request body
            Object.assign(packageItem, req.body);

            // Add history entry if status or location was modified by the admin
            if (req.body.status && packageItem.isModified('status')) {
                packageItem.history.push({
                    status: req.body.status,
                    location: req.body.currentLocation || packageItem.currentLocation, // Use new location if provided
                    description: `Status updated to ${req.body.status} by admin.`
                });
            } else if (req.body.currentLocation && packageItem.isModified('currentLocation')) {
                // Only add location history if location changed AND status wasn't simultaneously changed (covered by above)
                packageItem.history.push({
                    status: packageItem.status, // Keep current status
                    location: req.body.currentLocation,
                    description: `Location updated to ${req.body.currentLocation} by admin.`
                });
            }

        } else {
            // Should be caught by authMiddleware, but as a safeguard
            return res.status(403).json({ message: 'Not authorized to update this package.' });
        }

        const updatedPackage = await packageItem.save();
        res.status(200).json(updatedPackage);

    } catch (error) {
        console.error("Error updating package:", error); // Added context
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error updating package.' });
    }
};

// @desc    Delete a package
// @route   DELETE /api/packages/:id
// @access  Private (Admin)
const deletePackage = async (req, res) => {
    try {
        const packageId = req.params.id;

        const packageItem = await Package.findById(packageId);

        if (!packageItem) {
            return res.status(404).json({ message: 'Package not found.' });
        }

        // Authorization check is handled by `authorizeRoles(['admin'])` middleware in routes
        // If additional internal logic is needed, add it here.

        await Package.deleteOne({ _id: packageId }); // Clearer way to delete by ID

        res.status(200).json({ message: 'Package removed successfully.' });

    } catch (error) {
        console.error("Error deleting package:", error); // Added context
        res.status(500).json({ message: 'Server error deleting package.' });
    }
};

export {
    createPackage,
    getPackages,
    getPackageById,
    getPublicPackageDetails,
    updatePackage,
    deletePackage
};