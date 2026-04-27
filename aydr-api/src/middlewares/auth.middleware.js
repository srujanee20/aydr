const passport = require('../configs/passport');

// Core API authentication guard (Stateless JWT)
const requireAuth = passport.authenticate('jwt', { session: false });

// Optional auth for public endpoints that have elevated views for owners
const optionalAuth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (user) req.user = user;
        next();
    })(req, res, next);
};

// Scope-based authorization — checks JWT 'scp' claim
const requireScope = (requiredScopes) => {
    return (req, res, next) => {
        if (!req.user || !req.user.jwtPayload || !req.user.jwtPayload.scp) {
            return res.status(401).json({ message: 'Unauthorized: Missing token scopes' });
        }
        const userScopes = req.user.jwtPayload.scp;
        const hasScope = requiredScopes.some(scope => userScopes.includes(scope));
        if (hasScope) {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden: Insufficient scope' });
        }
    };
};

// Admin Portal session guard (Stateful Cookie)
const requireAdminSession = (req, res, next) => {
    if (req.session && req.session.adminId) {
        return next();
    }
    res.redirect('/admin/login');
};

module.exports = {
    requireAuth,
    optionalAuth,
    requireScope,
    requireAdminSession
};

