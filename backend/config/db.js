import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI; // Make sure MONGODB_URI is available in .env

        const conn = await mongoose.connect(MONGODB_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.underline.bold); 
        process.exit(1); 
    }
};

export default connectDB;