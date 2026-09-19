# Wanderlust — Airbnb Clone

A full-stack Airbnb-style listing and booking web app built as a portfolio/resume project.

## Features

- User authentication (signup / login / logout) with Passport + sessions, strong-password policy enforced on signup
- Listings: create, view, edit, delete (owner-protected), with Cloudinary image upload
- Search and booking features: instant booking with all-inclusive transparent pricing (no hidden fees), plus a "pay 20% deposit to lock this price and finish later" price-lock option
- Wishlist ("Saved homes") with price tracking — get shown a price-drop alert when a saved home gets cheaper
- English / हिन्दी language toggle with INR-first rupee pricing, and a dark-mode toggle
- Booking system with date-collision detection, nightly price totals, and a Trips page
- Animated marketing landing page (`/`) with crossfading hero imagery, scroll-reveal sections, animated counters, and a word rotor — all pure CSS/vanilla JS
- User profiles with bio, avatar, stats, and their listings/reviews
- Star-rating reviews with animated starability widget
- Interactive Mapbox map showing each listing's location (geoJSON)
- Security: Helmet, CSP, auth rate-limiting, input validation (Joi), env-driven config

## Tech Stack

- Node.js + Express 5
- MongoDB + Mongoose 9
- EJS + ejs-mate templating
- Passport.js (passport-local, passport-local-mongoose)
- Multer + Cloudinary (image uploads)
- Mapbox GL JS + Geocoding API
- Helmet, express-rate-limit, connect-flash, Joi

## Getting Started

Prerequisites: Node.js 18+, MongoDB running locally.

```bash
npm install
cp .env.example .env   # fill in your own keys (see below)
npm run dev            # nodemon, or: npm start
```

Seed the database (wipes and re-creates sample listings):

```bash
node init/index.js
```

Demo login: `demouser` / `demopassword`

Run the app at http://localhost:8080

## Environment Variables

| Variable | Description | Required |
| --- | --- | --- |
| `SESSION_SECRET` | Session signing secret | Yes |
| `MONGODB_URL` | MongoDB connection string | No (defaults to local) |
| `PORT` | HTTP port | No (defaults to 8080) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary creds for image uploads. Without them the app falls back to image-URL inputs | Optional |
| `MAPBOX_TOKEN` | Mapbox public token for geocoding + maps. Without it listings show no map | Optional |

## Deployment Notes

1. Host MongoDB on Atlas and set `MONGODB_URL`.
2. Set all env vars in your platform (Render/Railway/Vercel/Hostinger).
3. Start command: `npm start` (Node). Seed once with `node init/index.js` against the production DB.
4. `app.set("trust proxy",1)` is already enabled so `express-rate-limit` counts IPs correctly behind a reverse proxy.

## Project Structure

```
app.js               Express setup, middleware, routers
routes/              Route definitions (listings, reviews, users, bookings, wishlist)
controllers/         Route handlers / business logic
models/              Mongoose schemas (Listing, Review, User, Booking)
middleware.js        Validation, auth, ownership, id checks
config/              Cloudinary + Mapbox geocoding setup
views/               EJS templates (ejs-mate layouts)
public/              Static assets (CSS, JS)
init/                Database seeder (node init/index.js)
```