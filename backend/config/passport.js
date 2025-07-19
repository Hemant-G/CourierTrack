import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local'; 
import User from '../models/User.js';
import 'dotenv/config';

const configurePassport = (passport) => {
  // JWT Strategy (already done above)
  const jwtOpts = {};
  jwtOpts.jwtFromRequest = ExtractJwt.fromExtractors([
    (req) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies.jwt;
      }
      return token;
    },
  ]);
  jwtOpts.secretOrKey = process.env.JWT_SECRET;

  passport.use(
    new JwtStrategy(jwtOpts, async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id).select('-password');
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (err) {
        console.error(err);
        return done(err, false);
      }
    })
  );

  // --- ADD LOCAL STRATEGY FOR LOGIN ---
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'identifier', // This allows using email or username
        passwordField: 'password',
      },
      async (identifier, password, done) => {
        try {
          let user;
          // Try to find the user by email first
          user = await User.findOne({ email: identifier }).select('+password');

          // If not found by email, try to find by username
          if (!user) {
            user = await User.findOne({ username: identifier }).select('+password');
          }

          if (!user) {
            return done(null, false, { message: 'Invalid credentials' });
          }

          // Compare password
          const isMatch = await user.matchPassword(password); // Assumes User.js has this method

          if (!isMatch) {
            return done(null, false, { message: 'Invalid credentials' });
          }

          return done(null, user); // Authentication successful
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};

export default configurePassport;