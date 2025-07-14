import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config'; // Load environment variables from .env
import User from './models/User.js'; // Adjust path if your User model is elsewhere
import connectDB from './config/db.js'; // Adjust path if your DB connection is elsewhere
import colors from 'colors'; // For colored console output, install if not already: npm install colors

// Connect to the database
connectDB();

// --- Admin Account Details (Read from .env or use fallbacks) ---
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'AdminUser';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Helper function to hash passwords
const generateHashedPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const importAdmin = async () => {
    try {
        const adminExists = await User.findOne({ email: ADMIN_EMAIL });

        if (adminExists) {
            console.log(`Admin user with email ${ADMIN_EMAIL} already exists. No action taken.`.blue);
            process.exit();
        }

        const hashedPassword = await generateHashedPassword(ADMIN_PASSWORD);

        await User.create({
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin',
        });

        console.log(`Admin user '${ADMIN_USERNAME}' (${ADMIN_EMAIL}) created successfully!`.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`Error importing admin user: ${error.message}`.red.inverse);
        process.exit(1);
    }
};

const destroyAdmin = async () => {
    try {
        const result = await User.deleteOne({ email: ADMIN_EMAIL, role: 'admin' });

        if (result.deletedCount === 0) {
            console.log(`Admin user with email ${ADMIN_EMAIL} not found or not an admin. No action taken.`.yellow);
        } else {
            console.log(`Admin user '${ADMIN_USERNAME}' (${ADMIN_EMAIL}) deleted successfully!`.red.inverse);
        }
        process.exit();
    } catch (error) {
        console.error(`Error deleting admin user: ${error.message}`.red.inverse);
        process.exit(1);
    }
};

// Command-line argument parsing
if (process.argv[2] === '-d') { // If '-d' argument is passed, destroy admin
    destroyAdmin();
} else { // Otherwise, import admin
    importAdmin();
}