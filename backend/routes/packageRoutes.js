import express from 'express';
import {
    createPackage,
    getPackages,
    getPackageById,
    updatePackage,
    deletePackage,
    getPublicPackageDetails
} from '../controllers/packageController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Publicly accessible tracking route (NO 'protect' middleware)
router.get('/track/:trackingId', getPublicPackageDetails);

// Routes for Admin/Customer/Courier access (protected)
router.route('/')
    // Example: Only admin can create packages. Adjust roles as per your app's logic.
    .post(protect, authorizeRoles(['admin']), createPackage)
    // Admin, courier, and customer can get packages (filtered by their role/email in controller)
    .get(protect, authorizeRoles(['admin', 'courier', 'customer']), getPackages);

// Specific package routes (protected)
router.route('/:id')
    .get(protect, getPackageById)
    .put(protect, authorizeRoles(['admin', 'courier']), updatePackage)
    .delete(protect, authorizeRoles(['admin']), deletePackage);

export default router;