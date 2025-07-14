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
const authorizeRoles = (roles) => (req, res, next) => { // <--- ENSURE THERE IS NO "..." SPREAD OPERATOR HERE
    // --- KEEP THESE DEBUG LOGS FOR NOW TO CONFIRM FIX ---
    console.log("--- AuthorizeRoles Check ---");
    console.log("  Expected Roles (roles array):", roles); // This line is causing the error if `roles` isn't an array
    console.log("  User Role (req.user.role):", req.user ? req.user.role : 'N/A - req.user is null/undefined');
    console.log("  Is req.user present?", !!req.user);
    console.log("  Comparison Result (roles.includes(req.user.role)):", roles.includes(req.user.role));
    console.log("----------------------------");
    // ---------------------------------------------------

    if (!req.user || !roles.includes(req.user.role)) {
        console.warn(`Authorization Failed: User role '${req.user ? req.user.role : 'N/A'}' is not in allowed roles [${roles.join(', ')}]`); // This line
        res.status(403);
        throw new Error(`User role ${req.user ? req.user.role : 'unauthenticated'} is not authorized to access this route`);
    }
    next();
};

export { protect, authorizeRoles };