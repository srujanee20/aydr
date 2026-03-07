const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;

const ISSUER = "aydr-backend";
const AUDIENCE = "aydr-frontend";
const EXPIRES_IN = '15m';
const ALGORITHM = 'HS256';

/**
 * Generates a secure Access Token
 * @param {Object} user - The user object
 * @param {Array} roles - The array of user roles/permissions
 * @returns {string} The signed JWT token
 */
const generateAccessToken = (user, roles = []) => {
    const payloadClaims = {
        scp: roles
    }

    const signOptions = {
        subject: user._id.toString(),
        issuer: ISSUER,
        audience: AUDIENCE,
        expiresIn: EXPIRES_IN,
        jwtid: crypto.randomUUID(),
        algorithm: ALGORITHM
    };

    const token = jwt.sign(payloadClaims, JWT_SECRET, signOptions);
    return token;
};

/**
 * Verifies the Access Token and extracts the decoded payload
 * @param {string} encodedToken - The JWT string
 * @returns {Object} The decoded token payload
 * @throws {Error} If the token is invalid, expired, or malformed
 */
const verifyAccessToken = encodedToken => {
    const verifyOptions = {
        issuer: ISSUER,
        audience: AUDIENCE,
        algorithm: [ALGORITHM]
    }

    try {
        const decodedToken = jwt.verify(encodedToken, JWT_SECRET, verifyOptions);
        return decodedToken;
    } catch (error) {
        throw error;
    }
};

module.exports = { generateAccessToken, verifyAccessToken };