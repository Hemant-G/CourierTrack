// backend/controllers/userController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js'; // Ensure your User model is imported

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}); // Fetch all users from the database
  res.json(users);
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot delete your own admin account.');
    }
    await user.deleteOne(); // Use deleteOne() for Mongoose 6+
    res.json({ message: 'User removed successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


export {
  getUsers,
  deleteUser,
};