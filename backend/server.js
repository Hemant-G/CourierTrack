import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
// import mongoose from 'mongoose'; // <-- No longer need to import mongoose here if connectDB handles it
import cors from 'cors';
import passport from 'passport';
import passportConfig from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import connectDB from './config/db.js';

const app = express();

app.use(express.json());
app.use(cors());

// Passport Middleware
app.use(passport.initialize());
passportConfig(passport);

app.get('/', (req, res) => {
    res.send('Courier Tracking App Backend API is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);

const PORT = process.env.PORT || 5000;

connectDB(); 

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});