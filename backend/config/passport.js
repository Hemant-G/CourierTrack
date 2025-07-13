import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js'; 
import 'dotenv/config'

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;


const passportConfig = (passport) => {
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
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
};

export default passportConfig;