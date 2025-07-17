// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js'; // This seems redundant if userRoutes has auth
import cors from 'cors';
import passport from 'passport'; // <--- ADD THIS
import configurePassport from './config/passport.js'; // <--- ADD THIS

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- ADD PASSPORT INITIALIZATION HERE ---
app.use(passport.initialize());
configurePassport(passport); // This will load your JWT strategy
// ----------------------------------------

// --- CRUCIAL LINES (Reviewing below) ---
app.use('/api/auth', authRoutes); // This will be reviewed
app.use('/api/users', userRoutes); // This will be reviewed
app.use('/api/packages', packageRoutes);
// -------------------------------------

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


export default app;
