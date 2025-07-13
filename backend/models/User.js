import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // Keep this import for the matchPassword method

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // When fetching a user, the password won't be returned by default
    },
    role: {
        type: String,
        enum: ['customer', 'courier', 'admin'], // Define possible roles
        default: 'customer'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// --- REMOVE THIS ENTIRE SECTION ---
// UserSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) {
//         next();
//     }
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
// });
// --- END REMOVAL ---

// Method to compare entered password with hashed password (This part is correct)
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;