import User from '../models/User.js';
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import asyncHandler from 'express-async-handler'; // Import asyncHandler
import bcrypt from 'bcryptjs'; // Import bcryptjs

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => { // Wrap with asyncHandler
    const { username, email, password, role } = req.body;

    // --- Validation (Added for robustness) ---
    if (!username || !email || !password || !role) {
        res.status(400); // Set status before throwing error for errorHandler
        throw new Error('Please enter all fields: username, email, password, role');
    }

    // Check if user exists (by email or username)
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
        res.status(400);
        throw new Error('User with that email or username already exists');
    }

    // --- HASH PASSWORD --- THIS IS CRITICAL ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with hashed password
    const user = await User.create({
        username,
        email,
        password: hashedPassword, // Use the HASHED password here
        role,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
                expiresIn: '1h', // Or process.env.JWT_EXPIRE if you use it
            }),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});


// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => { // Wrap with asyncHandler
    const { identifier, password } = req.body;

    // Validate input
    if (!identifier || !password) {
        res.status(400);
        throw new Error('Please enter identifier (email/username) and password');
    }

    let user;
    // Try to find the user by email first
    user = await User.findOne({ email: identifier }).select('+password'); // Ensure password is selected for matching

    // If not found by email, try to find by username
    if (!user) {
        user = await User.findOne({ username: identifier }).select('+password');
    }

    // If still no user found, then credentials are invalid
    if (!user) {
        res.status(400);
        throw new Error('Invalid credentials');
    }

    // Match password (using the method on the User model)
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid credentials');
    }

    // If credentials are valid, generate token
    const token = sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Or process.env.JWT_EXPIRE
    });

    res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token,
    });
});


export { registerUser, loginUser };