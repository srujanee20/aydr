const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
};

passport.use(new JwtStrategy(options, async (jwtPayload, done) => {
    try {
        // Standard JWTs use 'sub' (subject) for the unique user identifier
        const user = await User.findById(jwtPayload.sub);
        
        if (user && user.isActive) {
            // Attach the raw payload to the request user so we can evaluate the 'scp' claim later
            user.jwtPayload = jwtPayload;
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));

module.exports = passport;
