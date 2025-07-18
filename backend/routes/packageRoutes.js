// backend/routes/packageRoutes.js

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

// Routes for Admin access
router.route('/')
    // CORRECTED: Pass an array ['admin'] to authorizeRoles
    .post(protect, authorizeRoles(['admin', 'customer']), createPackage) 
    .get(protect, authorizeRoles(['admin', 'courier', 'customer']), getPackages); 

// Specific package routes (protected)
router.route('/:id')
    .get(protect, getPackageById)
    .put(protect, authorizeRoles(['admin', 'courier']), updatePackage)
    .delete(protect, authorizeRoles(['admin']), deletePackage);

export default router;