import User from '../models/User.js';
import pkg from 'jsonwebtoken';
const { sign } = pkg;

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = await User.create({
            username,
            email,
            password,
            role
        });

        const token = sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const loginUser = async (req, res) => {
    // We expect either 'email' or 'username' for identification, and 'password'
    const { identifier, password } = req.body;

    try {
        let user;

        // Try to find the user by email first
        user = await User.findOne({ email: identifier }).select('+password');

        // If not found by email, try to find by username
        if (!user) {
            user = await User.findOne({ username: identifier }).select('+password');
        }

        // If still no user found, then credentials are invalid
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


export { registerUser, loginUser };