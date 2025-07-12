import express from 'express';
import {
    createPackage,
    getPackages,
    getPackageById,
    updatePackage,
    deletePackage,
    getPublicPackageDetails // Import the new function
} from '../controllers/packageController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Publicly accessible tracking route (NO 'protect' middleware)
router.get('/track/:trackingId', getPublicPackageDetails); // <--- New Route

// Routes for Admin access
router.route('/')
    .post(protect, authorizeRoles('admin'), createPackage)
    .get(protect, authorizeRoles('admin', 'courier'), getPackages);

// Specific package routes (protected)
router.route('/:id')
    .get(protect, getPackageById) // Protected for all authenticated users for now, further logic in controller
    .put(protect, authorizeRoles('admin', 'courier'), updatePackage)
    .delete(protect, authorizeRoles('admin'), deletePackage);

export default router;