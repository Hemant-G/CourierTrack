import passport from 'passport';

// Middleware to protect routes (ensure user is logged in)
const protect = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Authentication error' });
        }
        if (!user) {
            // No user means token was invalid or not provided
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
        req.user = user; // Attach the user object to the request
        next(); // Proceed to the next middleware/route handler
    })(req, res, next);
};

// Middleware for authorization (check user role)
const authorizeRoles = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: `User role ${req.user ? req.user.role : 'none'} is not authorized to access this route` });
    }
    next();
};

export { protect, authorizeRoles };