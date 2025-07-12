import mongoose from 'mongoose';

const PackageSchema = new mongoose.Schema({
    trackingId: {
        type: String,
        required: [true, 'Tracking ID is required'],
        unique: true,
        trim: true,
    },
    senderInfo: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
        email: String,
    },
    recipientInfo: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
        email: String,
    },
    pickupAddress: {
        type: String,
        required: [true, 'Pickup address is required'],
    },
    deliveryAddress: {
        type: String,
        required: [true, 'Delivery address is required'],
    },
    status: {
        type: String,
        enum: [
            'Pending',          
            'Out for Pickup',
            'Picked Up',
            'In Transit',
            'Out for Delivery',
            'Delivered',
            'Attempted Delivery',
            'Cancelled',
            'Returned'
        ],
        default: 'Pending',
        required: true,
    },
    assignedCourier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        },
    },
    eta: {
        type: Date,
        default: null,
    },
    history: [
        {
            status: { type: String, required: true },
            timestamp: {
                type: Date,
                default: Date.now,
            },
            location: {
                type: {
                    type: String,
                    enum: ['Point'],
                    default: 'Point',
                },
                coordinates: [Number],
            },
            description: String,
        },
    ],
}, {
    timestamps: true
});

// Create a geospatial index on currentLocation for efficient location-based queries
PackageSchema.index({ currentLocation: '2dsphere' });

// Middleware to add initial status to history when a new package is created
PackageSchema.pre('save', function (next) {
    if (this.isNew) { // Only run for new documents
        this.history.push({
            status: this.status,
            location: this.currentLocation,
            description: `Package created with status: ${this.status}`
        });
    }
    next();
});

const Package = mongoose.model('Package', PackageSchema);
export default Package;