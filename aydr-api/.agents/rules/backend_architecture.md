# Aydr Backend Architecture & Coding Standards

This project follows a strict, decoupled MVC + REST architecture using Node.js, Express, and MongoDB. When contributing to this codebase, you **must** adhere to the following directory structures, architectural patterns, and security principles.

## 📁 Directory Structure
All application logic is strictly contained within the `src/` directory.
*   **`src/configs/`**: Configuration initializations (e.g., `database.js`, `passport.js`, `imagekit.js`).
*   **`src/models/`**: Mongoose schemas defining the database layer.
*   **`src/services/`**: The Core Business Logic layer. All database queries, transaction orchestrations, and external API calls (e.g., ImageKit uploads) live here. Controllers should be thin and call Services.
*   **`src/controllers/rest/`**: API endpoint handlers. They receive requests, call the appropriate Service, and return standardized JSON responses.
*   **`src/controllers/admin/`**: MVC controllers strictly for the Admin Portal. They call Services and return rendered EJS views.
*   **`src/middlewares/`**: Express interceptors (e.g., `validate.middleware.js`, `auth.middleware.js`, `error.middleware.js`).
*   **`src/routers/`**: Route definitions.
*   **`src/validators/`**: Joi validation schemas.
*   **`src/views/`**: Server-side rendered EJS templates (e.g., Admin Portal views and partials).
*   **`public/`**: Static assets (CSS, JS, images) served by Express.

## 🛣️ Routing Conventions
1.  **Master Separation**: `index.js` manages top-level routing. All RESTful API routes are mounted under `/api` via `api.router.js`. All server-rendered MVC pages are mounted under `/` via `mvc.router.js`.
2.  **Pluralization**: Resource routes must be pluralized (e.g., `/api/providers`, `/api/bookings`).
3.  **Explicit > Implicit**: Do not merge distinct business flows into a single dynamic endpoint (e.g., keep `/register/customer` and `/register/provider` separate rather than passing a role parameter).
4.  **RESTful Identifiers**: Strictly differentiate between intrinsic state (`/me` or `/my` - deriving context exclusively from the JWT) and explicit state (`/:id`). When exposing explicit `/:id` endpoints for `PUT` or `PATCH` updates, controllers **must** strictly validate that the `req.params.id` matches the token's identity (or that the token possesses an `admin` scope) to prevent Broken Object Level Authorization (BOLA).

## 🔐 Security & Authentication
1.  **API (Stateless)**: Uses JWTs via `passport-jwt`.
    *   Tokens contain standard OIDC claims: `sub` (user ID), `scp` (array of roles/scopes), and `jti` (unique UUID).
    *   Protect endpoints using the `requireAuth` (validates token signature) and `requireScope(['admin', 'provider'])` (validates permissions) middlewares.
2.  **MVC (Stateful)**: Uses `express-session` cookies.
    *   Protect Admin Portal routes using the `requireAdminSession` middleware.

## 🛑 Error Handling (REST API)
Controllers must **never** manually return 4xx or 5xx status codes for thrown exceptions.
*   **Correct Pattern**: Wrap controller logic in `try/catch` and pass errors to the global error handler using `next(error)`.
    ```javascript
    const exampleController = async (req, res, next) => {
        try {
            const data = await exampleService.doWork();
            res.status(200).json({ data });
        } catch (error) {
            next(error); // Route to error.middleware.js
        }
    };
    ```
*   **Global Handling**: `src/middlewares/error.middleware.js` automatically maps Mongoose errors to appropriate HTTP codes (e.g., `err.code === 11000` becomes `409 Conflict`).

## ✅ Validations
*   All incoming `POST`, `PUT`, and `PATCH` payloads must be verified by `Joi` schemas.
*   Apply the `validate(validatorSchema)` middleware directly in the router definition before the controller.

## ⚡ File System & Configuration Rules
1.  **Absolute Paths**: When configuring static directories or view engines in Express, always use `path.join(__dirname, '...')` instead of relative strings to prevent execution-context bugs.
2.  **File Uploads**: All file uploads (e.g., images) must use `multer.memoryStorage()` to buffer data in RAM. Files are streamed directly to external providers (ImageKit) without touching the local disk.
