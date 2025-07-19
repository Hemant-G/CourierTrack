import express from 'express';
import { getUsers, deleteUser } from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get(
  '/', // This will correctly be GET /api/users
  protect,
  authorizeRoles(['admin']),
  getUsers
);

router.delete(
  '/:id', // This will correctly be DELETE /api/users/:id
  protect,
  authorizeRoles(['admin']),
  deleteUser
);

export default router;