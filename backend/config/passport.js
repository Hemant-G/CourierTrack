import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User.js';
import 'dotenv/config';

const configurePassport = (passport) => {
  // ✅ Declare and configure jwtOpts properly inside the function
  const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // ✅ Extract token from Authorization header
    secretOrKey: process.env.JWT_SECRET,
  };

  // ✅ JWT Strategy
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

  // ✅ Local Strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'identifier', // Accept email or username
        passwordField: 'password',
      },
      async (identifier, password, done) => {
        try {
          let user = await User.findOne({ email: identifier }).select('+password');

          if (!user) {
            user = await User.findOne({ username: identifier }).select('+password');
          }

          if (!user) {
            return done(null, false, { message: 'Invalid credentials' });
          }

          const isMatch = await user.matchPassword(password);

          if (!isMatch) {
            return done(null, false, { message: 'Invalid credentials' });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};

export default configurePassport;
