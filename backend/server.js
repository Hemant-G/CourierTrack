import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import passportConfig from './config/passport.js';
import userRoutes from './routes/userRoutes.js';
import packageRoutes from './routes/packageRoutes.js';

const app = express();

app.use(express.json());
app.use(cors());

// Passport Middleware
app.use(passport.initialize());
passportConfig(passport);

app.get('/', (req, res) => {
    res.send('Courier Tracking App Backend API is running!');
});

// Use User Routes
app.use('/api/auth', userRoutes);

// Package Management Routes
app.use('/api/packages', packageRoutes); 

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB Connected Successfully!');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });