// backend/controllers/authController.js
import User from '../models/User.js';
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import passport from 'passport'; // <--- ADD THIS

// Helper function to generate a JWT token
const generateToken = (id, role) => {
    return sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

// @desc    Register a new user (Keep as is, it's fine)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
        res.status(400);
        throw new Error('Please enter all fields: username, email, password, role');
    }
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
        res.status(400);
        throw new Error('User with that email or username already exists');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role,
    });
    if (user) {
        // Note: Token for registration response is for immediate client use if desired
        // The primary auth token will be set by login via cookie
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role), // Still generate for immediate response
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});


// @desc    Authenticate user & get token (Now fully using Passport)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => { // IMPORTANT: Ensure 'next' is here
    // Passport's local strategy will handle finding user and password comparison
    passport.authenticate('local', { session: false }, async (err, user, info) => {
        if (err) {
            // If there's an internal error during authentication (e.g., DB error), pass it to general error handler
            return next(err);
        }
        if (!user) {
            // If user is not found or credentials invalid (info.message will contain details)
            res.status(401); // Unauthorized
            throw new Error(info ? info.message : 'Invalid credentials');
        }

        // If Passport authenticates successfully, generate JWT
        const token = generateToken(user._id, user.role);

        // Set HTTP-only cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: false, // Use secure in production
            sameSite: 'strict', // Protect against CSRF
            maxAge: 3600000, // 1 hour in milliseconds (adjust as needed)
        });

        // Send user details and token in response (token in body is optional, for client-side state management)
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: token, // Optionally send in body, the cookie is the primary auth
        });

    })(req, res, next); // Make sure to call authenticate with req, res, next
});

export { registerUser, loginUser };