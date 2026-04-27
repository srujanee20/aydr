![Aydr Logo](aydr-ui/public/images/logo.ico)

# Aydr — Expert Help, Right Around the Corner

A full-stack local services marketplace that connects customers with trusted service providers in their area.
Built with **React**, **Express**, **MongoDB**, and **Leaflet** maps.

[Live Demo](#-live-demo) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [API Reference](#-api-reference) • [License](#-license)

---

## 🌐 Live Demo

| Module   | URL                              |
| -------- | -------------------------------- |
| Frontend | `<YOUR_FRONTEND_DEPLOYMENT_URL>` |
| Backend  | `<YOUR_BACKEND_DEPLOYMENT_URL>`  |
| Admin    | `<YOUR_BACKEND_DEPLOYMENT_URL>/admin` |

> _Replace the placeholders above with your actual deployment URLs._

---

## 📖 About

**Aydr** is a location-aware services booking platform where customers can discover nearby service providers on an interactive map, browse their offered services, and place bookings — all in real time. Providers get their own dashboard to manage services, bookings, and business profiles, while an admin portal handles provider verification and platform moderation.

The project follows a **monorepo** structure with two independent modules:

- **`aydr-api`** — RESTful Express backend with an embedded server-rendered admin portal (EJS).
- **`aydr-ui`** — React SPA (Vite) serving the customer and provider interfaces.

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based stateless authentication for the REST API (Passport.js + `passport-jwt`).
- Scope-based authorization (`scp` claim) for fine-grained endpoint access control.
- Session-based authentication for the server-rendered Admin Portal.
- Role-based access: **Customer**, **Provider**, and **Admin**.
- Protected routes on the frontend with role-specific route guards.

### 🗺️ Location-Aware Discovery
- Interactive Leaflet map on the Home page and Customer Dashboard.
- Providers are plotted as map markers with popup previews (name, category, rating).
- Area search with geocoding fallback via the Nominatim API.
- Browser Geolocation API integration for providers setting their business location.

### 👤 Customer Experience
- **Explore tab** — browse providers on a map + filterable list, with category filters.
- **Provider Detail page** — full provider profile with services grid and inline booking modal.
- **My Bookings tab** — view, track, and cancel bookings with status lifecycle (`REQUESTED → ACCEPTED → IN_PROGRESS → COMPLETED`).
- **Customer Profile** — update personal information and profile picture.

### 🛠️ Provider Experience
- **Provider Dashboard** — booking stats (total, pending, active, completed) with quick-action cards.
- **Provider Settings** — comprehensive multi-section settings page:
  - Personal account profile (name, phone, avatar upload).
  - Business branding profile (name, bio, email, phone, base price, banner upload).
  - Interactive map-based location picker with address field.
  - Service CRUD with flexible availability scheduling (24/7, specific days, specific hours, or both).
- **Booking Management** — accept, reject, mark in-progress, or complete incoming bookings.
- **Setup Progress Bars** — visual indicators for branding, location, pricing, and category setup status.

### 🏢 Admin Portal (Server-Rendered)
- Session-protected EJS admin dashboard.
- **Provider Verification** — approve or reject provider applications with admin messages.
- **Category Management** — create, rename, and toggle categories.
- **Review Moderation** — view and delete inappropriate reviews.
- Dashboard overview with pending-provider and total-booking stats.

### 📸 File Uploads
- Image uploads via **ImageKit** CDN (base64-encoded, with file-type inference).
- Multer middleware for multipart form handling.
- Avatar uploads for user profiles and banner/logo uploads for provider branding.

### 🔒 Security & Performance
- **Helmet** — secure HTTP headers.
- **express-rate-limit** — API rate limiting (1000 requests / 15 min per IP).
- **express-mongo-sanitize** — NoSQL injection prevention.
- **compression** — GZIP response compression.
- **Joi** — request payload validation across all endpoints.
- **bcryptjs** — password hashing with salt rounds.
- Centralized error handler (Mongoose duplicate key, validation errors, unauthorized access).

### ⭐ Reviews & Ratings
- Customers can review completed bookings (1–5 star rating + comment).
- Provider average rating auto-computed via Mongoose `post('save')` aggregation hook.
- One review per booking enforced at the schema level.

---

## 🛠 Tech Stack

### Frontend (`aydr-ui`)

| Technology            | Purpose                         |
| --------------------- | ------------------------------- |
| React 19              | UI library                      |
| Vite 7                | Build tooling & dev server      |
| React Router 7        | Client-side routing             |
| Leaflet / React-Leaflet | Interactive maps              |
| Axios                 | HTTP client                     |
| SCSS                  | Styling (variables + mixins)    |
| React Compiler (Babel)| Automatic memoization           |

### Backend (`aydr-api`)

| Technology            | Purpose                         |
| --------------------- | ------------------------------- |
| Express 5             | HTTP server framework           |
| MongoDB / Mongoose 9  | Database & ODM                  |
| Passport.js           | JWT authentication strategy     |
| Joi                   | Schema-based request validation |
| ImageKit SDK          | Cloud image storage & CDN       |
| Multer                | Multipart file upload handling  |
| EJS                   | Server-rendered admin views     |
| Helmet                | Security headers                |
| Morgan                | Request logging                 |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **ImageKit** account — for image uploads ([imagekit.io](https://imagekit.io/))

### 1. Clone the repository

```bash
git clone https://github.com/srujanee20/aydr.git
cd aydr
```

### 2. Setup the Backend (`aydr-api`)

```bash
cd aydr-api
npm install
```

Create a `.env.local` file (or copy from the example):

```bash
cp .env.example .env.local
```

Fill in the required values:

```env
PORT=8000
NODE_ENV=local

# MongoDB connection string
MONGO_URI=mongodb://127.0.0.1:27017/aydr

# JWT Configuration
JWT_SECRET=<your-strong-random-secret>
JWT_EXPIRES_IN=24h
JWT_ISSUER=aydr-api
JWT_AUDIENCE=aydr-client

# Session secret for Admin Portal
SESSION_SECRET=<your-session-secret>

# ImageKit credentials
IMAGEKIT_PUBLIC_KEY=<your-imagekit-public-key>
IMAGEKIT_PRIVATE_KEY=<your-imagekit-private-key>
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/<your-endpoint>
```

Start the development server:

```bash
npm run dev          # Loads .env + .env.local
# or
npm run dev:watch    # With auto-restart via nodemon
```

The API will be available at `http://localhost:8000`.

### 3. Setup the Frontend (`aydr-ui`)

```bash
cd ../aydr-ui
npm install
```

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Set the API base URL:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Start the dev server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

## 📁 Project Structure

```
aydr/
├── aydr-api/                    # Express backend
│   ├── index.js                 # Server entry point
│   ├── public/                  # Static assets (404 page, CSS, images)
│   ├── views/                   # EJS templates (admin portal)
│   │   ├── admin/               # Admin pages (dashboard, providers, categories, reviews)
│   │   └── partials/            # Shared header & footer
│   └── src/
│       ├── configs/             # Environment init, database, passport, ImageKit
│       ├── controllers/
│       │   ├── rest/            # API controllers (user, provider, booking, service, etc.)
│       │   └── admin/           # Admin portal controllers
│       ├── middlewares/         # Auth guards, error handler, file upload, validation
│       ├── models/              # Mongoose schemas (User, Provider, Service, Booking, Review, Category)
│       ├── routers/             # Route definitions (api, auth, admin, resource routers)
│       ├── services/            # Business logic (user, provider, booking, upload, etc.)
│       └── validators/          # Joi validation schemas
│
├── aydr-ui/                     # React frontend (Vite)
│   ├── index.html               # HTML entry with splash screen
│   ├── vite.config.js           # Vite + React Compiler config
│   ├── public/                  # Static assets (images, splash CSS)
│   └── src/
│       ├── App.jsx              # Route definitions
│       ├── main.jsx             # React entry point
│       ├── configs/             # Axios instance configuration
│       ├── context/             # AuthContext (JWT state management)
│       ├── hooks/               # useApi custom hook
│       ├── components/
│       │   ├── common/          # Reusable (Modal, ServiceCard, BookingCard, AvatarUpload, etc.)
│       │   ├── layouts/         # Navbar
│       │   └── pages/           # Page components
│       │       ├── Home.jsx     # Landing page with map
│       │       ├── auth/        # Login, Register
│       │       ├── customer/    # Dashboard, ProviderDetail, Profile
│       │       └── provider/    # Dashboard, Bookings, Settings
│       └── styles/              # SCSS (variables, mixins, component-scoped sheets)
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## 📡 API Reference

All API endpoints are prefixed with `/api`. Authentication is done via `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint          | Description               | Auth |
| ------ | ----------------- | ------------------------- | ---- |
| POST   | `/api/auth/register` | Register a new user    | ❌   |
| POST   | `/api/auth/login`    | Login and receive JWT  | ❌   |

### Users

| Method | Endpoint            | Description                  | Auth |
| ------ | ------------------- | ---------------------------- | ---- |
| GET    | `/api/users/me`     | Get current user profile     | ✅   |
| PUT    | `/api/users/:id`    | Update user profile          | ✅   |

### Providers

| Method | Endpoint              | Description                       | Auth |
| ------ | --------------------- | --------------------------------- | ---- |
| GET    | `/api/providers`      | List all providers (search/filter)| ❌   |
| GET    | `/api/providers/:id`  | Get provider details              | ❌   |
| PUT    | `/api/providers/:id`  | Update provider profile           | ✅   |

### Services

| Method | Endpoint                       | Description                   | Auth |
| ------ | ------------------------------ | ----------------------------- | ---- |
| GET    | `/api/services/provider/:id`   | List services by provider     | ❌   |
| POST   | `/api/services`                | Create a new service          | ✅   |
| PUT    | `/api/services/:id`            | Update a service              | ✅   |

### Bookings

| Method | Endpoint                       | Description                      | Auth |
| ------ | ------------------------------ | -------------------------------- | ---- |
| GET    | `/api/bookings/my`             | Get current user's bookings      | ✅   |
| POST   | `/api/bookings`                | Create a new booking             | ✅   |
| PATCH  | `/api/bookings/:id/status`     | Update booking status            | ✅   |

### Reviews

| Method | Endpoint          | Description            | Auth |
| ------ | ----------------- | ---------------------- | ---- |
| POST   | `/api/reviews`    | Submit a review        | ✅   |
| GET    | `/api/reviews`    | List reviews           | ❌   |

### Categories

| Method | Endpoint            | Description          | Auth |
| ------ | ------------------- | -------------------- | ---- |
| GET    | `/api/categories`   | List all categories  | ❌   |

### Uploads

| Method | Endpoint               | Description             | Auth |
| ------ | ---------------------- | ----------------------- | ---- |
| POST   | `/api/uploads/single`  | Upload a single image   | ✅   |

---

## 🧪 Available Scripts

### Backend (`aydr-api`)

| Script              | Command                  | Description                              |
| ------------------- | ------------------------ | ---------------------------------------- |
| `npm run dev`       | `node index`             | Start server with default env            |
| `npm run dev:lcl`   | `node index --env=local` | Start server with `.env.local` overrides |
| `npm run dev:watch` | `nodemon index`          | Start with file-watching auto-restart    |
| `npm run lint`      | `eslint .`               | Run ESLint checks                        |

### Frontend (`aydr-ui`)

| Script              | Command        | Description                      |
| ------------------- | -------------- | -------------------------------- |
| `npm run dev`       | `vite`         | Start dev server on port 3000    |
| `npm run build`     | `vite build`   | Production build to `dist/`      |
| `npm run preview`   | `vite preview` | Preview production build (3030)  |
| `npm run lint`      | `eslint .`     | Run ESLint checks                |

---

## 🚢 Deployment

<!-- TODO: Add deployment details -->

| Service   | Platform                     | URL                              |
| --------- | ---------------------------- | -------------------------------- |
| Frontend  | `<YOUR_HOSTING_PLATFORM>`    | `<YOUR_FRONTEND_DEPLOYMENT_URL>` |
| Backend   | `<YOUR_HOSTING_PLATFORM>`    | `<YOUR_BACKEND_DEPLOYMENT_URL>`  |
| Database  | `<YOUR_DB_HOSTING_PLATFORM>` | _Managed via environment variables_ |

> **Environment variables** listed in each module's `.env.example` must be configured on your hosting platform.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Srujanee Nayak](https://github.com/srujanee20)
