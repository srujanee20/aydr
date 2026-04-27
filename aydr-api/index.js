require("./src/configs/init");
require("./src/configs/database");
const path = require("path");
const express = require("express");
const session = require("express-session");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");

const apiRouter = require("./src/routers/api.router");
const errorHandler = require("./src/middlewares/error.middleware");
const mvcRouter = require("./src/routers/mvc.router");
const passport = require("./src/configs/passport");

const PORT = process.env.PORT || 8000;

const app = express();

app.use(helmet({ contentSecurityPolicy: false })); // Secure HTTP headers, CSP disabled to allow CDNs
app.use(cors()); // Enable Cross-Origin Resource Sharing
// Prevent NoSQL injection (sanitize body & params only — req.query is read-only in Express 5)
app.use((req, res, next) => {
    if (req.body) req.body = mongoSanitize.sanitize(req.body);
    if (req.params) req.params = mongoSanitize.sanitize(req.params);
    next();
});
app.use(compression()); // GZIP compress JSON and HTML responses
app.use(morgan("dev")); // Request Logging

// Global API Rate Limiting (100 requests per 15 mins per IP)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 1000, 
    message: { message: "Too many requests from this IP, please try again later." }
});

// Static files
app.use(express.static(path.join(__dirname, "public")));

// View Engine - EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Skip body parsers for multipart/form-data — multer handles those.
// express.json/urlencoded touching the stream first corrupts the file buffer.
app.use((req, res, next) => {
    if (req.headers['content-type']?.startsWith('multipart/form-data')) return next();
    express.json()(req, res, next);
});
app.use((req, res, next) => {
    if (req.headers['content-type']?.startsWith('multipart/form-data')) return next();
    express.urlencoded({ extended: true })(req, res, next);
});

// Remove null values from JSON responses
app.set("json replacer", (key, value) => (value === null ? undefined : value));

// Session Configuration for Admin Portal
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport (must come AFTER session setup)
app.use(passport.initialize());

// Mount Master Routers
app.use("/api", apiLimiter, apiRouter);
app.use("/", mvcRouter);
// 404 — Catch-all for unmatched routes
app.use((req, res) => {
    if (req.path.startsWith('/api') || req.headers.accept?.includes('application/json'))
        return res.status(404).json({ message: 'Route not found' });
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));