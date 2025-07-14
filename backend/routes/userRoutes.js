import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { getUsers, deleteUser } from '../controllers/userController.js'; // <--- THIS LINE IS CRUCIAL
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get(
  '/', // This is GET /api/users
  protect,
  (req, res, next) => {
      console.log("Authenticated User Object:", req.user); // <-- THIS IS THE LINE I NEED OUTPUT FROM
      next();
  },
  authorizeRoles(['admin']), // Make sure 'admin' is lowercase here
  getUsers
);

router.delete(
  '/:id',
  protect,
  authorizeRoles(['admin']),
  deleteUser
);

export default router;