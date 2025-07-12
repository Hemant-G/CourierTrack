import Package from '../models/Package.js';
import User from '../models/User.js'; 

const createPackage = async (req, res) => {
    try {
        const packageData = req.body;
        // Optionally, generate trackingId here if not provided in body
        // if (!packageData.trackingId) {
        //     packageData.trackingId = generateUniqueTrackingId(); // Implement this function
        // }

        const newPackage = await Package.create(packageData);
        res.status(201).json(newPackage);
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

const getPackages = async (req, res) => {
    try {
        let query = {};

        // If the user is a courier, only show packages assigned to them
        if (req.user.role === 'courier') {
            query = { assignedCourier: req.user.id };
        }
        // For 'admin' role, query remains empty to fetch all packages

        const packages = await Package.find(query).populate('assignedCourier', 'username email'); // Populate courier info
        res.status(200).json(packages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getPackageById = async (req, res) => {
    try {
        let packageItem;
        if (req.params.id.length === 24 && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            // Assume it's a MongoDB ObjectId
            packageItem = await Package.findById(req.params.id).populate('assignedCourier', 'username email');
        } else {
            // Assume it's a tracking ID
            packageItem = await Package.findOne({ trackingId: req.params.id }).populate('assignedCourier', 'username email');
        }


        if (!packageItem) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Authorization check for non-admin users
        // A customer can only see their package if they are a sender/recipient
        // A courier can only see their assigned packages (handled by getPackages already if list, but specific ID too)
        if (req.user && req.user.role !== 'admin') {
            // If the user is a customer and their ID is not in sender/recipient info (assuming email/phone as identifier)
            // For simplicity, let's assume `req.user`'s email/username is used as identifier in sender/recipient info
            const isSenderOrRecipient = (
                packageItem.senderInfo.email === req.user.email ||
                packageItem.recipientInfo.email === req.user.email ||
                packageItem.senderInfo.phone === req.user.phone || // Add phone to user schema if using it for identification
                packageItem.recipientInfo.phone === req.user.phone
            );
            const isAssignedCourier = (packageItem.assignedCourier && packageItem.assignedCourier._id.toString() === req.user.id);

            if (!isSenderOrRecipient && !isAssignedCourier) {
                return res.status(403).json({ message: 'Not authorized to view this package' });
            }
        }


        res.status(200).json(packageItem);
    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};


const getPublicPackageDetails = async (req, res, next) => {
    try {
        const { trackingId } = req.params;

        const packageItem = await Package.findOne({ trackingId }).select('-senderInfo.email -senderInfo.phone -recipientInfo.email -recipientInfo.phone -_id -__v').populate('assignedCourier', 'username');
        // .select() is used here to explicitly exclude sensitive information
        // -_id and -__v are excluded to return only tracking-relevant fields.
        // populate only `username` from assignedCourier, not email/other sensitive info.

        if (!packageItem) {
            res.status(404);
            throw new Error('Package not found or invalid tracking ID');
        }

        res.status(200).json(packageItem);
    } catch (error) {
        next(error);
    }
};


const updatePackage = async (req, res) => {
    try {
        const { status, currentLocation, eta, assignedCourier, ...otherUpdates } = req.body;
        const packageId = req.params.id;

        let packageItem = await Package.findById(packageId);

        if (!packageItem) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Authorization logic based on role
        if (req.user.role === 'courier') {
            // Courier can only update status, currentLocation, and eta
            if (otherUpdates && Object.keys(otherUpdates).length > 0) {
                return res.status(403).json({ message: 'Couriers can only update status, location, and ETA.' });
            }
            if (assignedCourier && assignedCourier.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Couriers cannot change assigned courier or take unassigned packages.' });
            }
            if (assignedCourier && assignedCourier.toString() === req.user.id && !packageItem.assignedCourier) {
                 // Courier self-assigns an unassigned package
                packageItem.assignedCourier = assignedCourier;
            }

            if (status && packageItem.status !== status) {
                packageItem.status = status;
                packageItem.history.push({ status, location: currentLocation || packageItem.currentLocation, description: `Status updated to ${status} by courier.` });
            }
            if (currentLocation) {
                packageItem.currentLocation = currentLocation;
            }
            if (eta) {
                packageItem.eta = eta;
            }

        } else if (req.user.role === 'admin') {
            // Admin can update any field
            Object.assign(packageItem, req.body); // Directly assign all updates

            // If status is updated, add to history
            if (status && packageItem.isModified('status')) {
                packageItem.history.push({ status, location: currentLocation || packageItem.currentLocation, description: `Status updated to ${status} by admin.` });
            }
        } else {
            return res.status(403).json({ message: 'Not authorized to update this package' });
        }

        const updatedPackage = await packageItem.save();
        res.status(200).json(updatedPackage);

    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error' });
    }
};


const deletePackage = async (req, res) => {
    try {
        const packageId = req.params.id;

        const packageItem = await Package.findById(packageId);

        if (!packageItem) {
            return res.status(404).json({ message: 'Package not found' });
        }

        await Package.deleteOne({ _id: packageId }); // Use deleteOne for clarity

        res.status(200).json({ message: 'Package removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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