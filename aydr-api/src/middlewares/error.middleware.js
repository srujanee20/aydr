const errorHandler = (err, req, res, next) => {
    // 1. Mongoose Duplicate Key Error (e.g., Email already exists)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            message: `Conflict: An account or record with that ${field} already exists.`
        });
    }

    // 2. Mongoose Validation Error (Schema constraints failed)
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            message: 'Validation failed',
            errors: messages
        });
    }

    // 3. Unauthorized access passed down
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Invalid token' });
    }

    // 4. Fallback to standard 400 Bad Request if it's a known service error
    // or 500 if it's an unhandled crash.
    const statusCode = err.statusCode || (err.message ? 400 : 500);
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;
