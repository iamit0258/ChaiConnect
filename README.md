# ☕ Chai Connect — Chai Shop Discovery & Rewards Platform

> **Discover. Review. Earn.** — Find chai shops near you, get directions, leave reviews, earn points, and redeem coupons!

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## 🔗 Live Demo

- **Frontend**: [Coming soon — deploy to Vercel]
- **Backend**: [Coming soon — deploy to Render]

---

## 🚀 Quick Setup (Under 5 minutes)

### Prerequisites
- Node.js v18+ 
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Git

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd chaiconnect

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
# In /server, copy the example env file
cp .env.example .env
# Edit .env with your MongoDB URI
```

**Environment Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/chaiconnect` |
| `JWT_SECRET` | Secret key for JWT tokens | (set a strong random string) |
| `POINTS_NORMAL_REVIEW` | Points for a standard review | `10` |
| `POINTS_FIRST_REVIEW` | Points for first review on a shop | `15` |
| `POINTS_REDEMPTION_COST` | Points needed to redeem a coupon | `50` |

### 3. Run Locally

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

- Backend runs on: `http://localhost:5000`
- Frontend runs on: `http://localhost:5173`

---

## 🏗️ Architecture

```
chaiconnect/
├── client/                # React (Vite) frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── context/       # Auth context (React Context API)
│   │   ├── services/      # API service layer (Axios)
│   │   └── index.css      # Design system
│   └── index.html
├── server/                # Express.js backend
│   ├── config/            # Database connection
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routes
│   ├── controllers/       # Route handlers / business logic
│   ├── middleware/         # Auth (JWT), error handling
│   ├── utils/             # Geocoding, coupon generation
│   └── server.js          # Entry point
└── README.md
```

---

## 📊 Data Model

### Why this structure?

```
User ──< Review >── Shop
  │                    │
  └──< PointTransaction (audit trail)
```

| Model | Key Design Decision |
|-------|-------------------|
| **User** | `points` field stores current balance (source of truth). Updated atomically with `$inc` to prevent race conditions. |
| **Shop** | `averageRating` and `reviewCount` are **denormalized** on the Shop document for performance — recalculating from all reviews on every map load would be expensive. Updated when reviews are added/edited. Uses GeoJSON `Point` for `2dsphere` indexing. |
| **Review** | **Compound unique index** on `{user, shop}` prevents duplicate reviews at the database level (not just UI level). This is the strongest guarantee. |
| **PointTransaction** | Full audit trail of all point changes (earnings + redemptions). The `type` field (`REVIEW`, `FIRST_REVIEW`, `REDEMPTION`) makes it easy to query history and build the leaderboard. |

---

## 🗺️ Map & Directions

- **Map**: Leaflet + OpenStreetMap (100% free, no API key needed)
- **Geocoding**: Nominatim (OpenStreetMap) — converts addresses to lat/lng **server-side**
- **Routing/Directions**: OSRM — draws route polylines between two points

### Why not Mapbox?
The assignment allows "any alternative to Mapbox." This stack is completely free with no API key management, no rate limit concerns during demos, and is production-ready. The assignment cares about correct API integration, not which specific API.

---

## ✅ Edge Cases Handled

| Edge Case | Implementation |
|-----------|---------------|
| **Duplicate reviews** | Compound unique index `{user, shop}` + controller check |
| **Points going negative** | Server-side balance check before redemption |
| **Redemption exceeding balance** | Atomic `$inc` with `$gte` guard in MongoDB query |
| **Race conditions** | Mongoose atomic operations (`$inc`) for all point changes |
| **Bad address** | Nominatim returns empty → 400 error with helpful message |
| **No route found** | OSRM returns no routes → 400 with "No route found" |
| **Unhandled promise rejections** | `asyncHandler` wrapper on all controllers |
| **Invalid tokens** | JWT middleware returns 401, Axios interceptor clears auth |
| **Spam prevention** | Rate limiting on review endpoints (5 per 5 minutes) |

---

## 🎯 Features

### Core
- [x] **Auth** — JWT-based signup/login with bcrypt password hashing
- [x] **Shop Listings** — Add shops with address (auto-geocoded to coordinates)
- [x] **Map View** — All shops as markers, popups with rating & directions
- [x] **Directions** — OSRM routing from user location OR manual address
- [x] **Reviews** — Rate 1-5, text, one per shop per user, editable
- [x] **Points & Rewards** — +10/+15 points, 50-point coupon redemption

### Stretch Goals
- [x] **Search/Filter** — By name, minimum rating
- [x] **Leaderboard** — Top point earners with podium display
- [x] **Spam Prevention** — Rate limiting on review submission
- [ ] **Testing** — Would add with more time (see below)

---

## 🔧 Known Limitations

1. **No real-time updates** — Shop ratings don't update live for other users viewing the same page. Would need WebSockets.
2. **No image upload** — Photos are URL-based only. Would add Cloudinary/S3 integration.
3. **Nominatim rate limits** — Free geocoding service has a 1 req/sec limit. Fine for demo, would need a paid service for production.
4. **No email verification** — Auth is basic email/password without confirmation emails.
5. **No pagination** — Shop listings load all at once. Would add cursor-based pagination for scale.

---

## 🚀 What I'd Do Differently With More Time

1. **Testing** — Unit tests for points logic (earning, first review bonus, redemption, negative balance prevention) using Jest/Vitest
2. **Pagination** — Cursor-based pagination for shops and reviews
3. **Image uploads** — Cloudinary integration instead of URL-only photos
4. **WebSocket updates** — Real-time rating updates across connected clients
5. **PWA** — Service worker for offline map caching
6. **CI/CD** — GitHub Actions pipeline for linting, testing, and auto-deploy
7. **Monitoring** — Error tracking (Sentry) and API metrics

---

## 📝 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Get current user |

### Shops
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/shops` | No | List all shops (search, filter, sort) |
| GET | `/api/shops/:id` | No | Get shop details |
| POST | `/api/shops` | Yes | Add new shop |
| POST | `/api/shops/directions` | No | Get route between two points |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reviews/shop/:shopId` | No | Get reviews for a shop |
| POST | `/api/reviews/:shopId` | Yes | Add review (rate limited) |
| PUT | `/api/reviews/:reviewId` | Yes | Edit own review |

### Rewards
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/rewards/balance` | Yes | Get points + history |
| POST | `/api/rewards/redeem` | Yes | Redeem coupon |
| GET | `/api/rewards/leaderboard` | No | Top earners |

---

## 📄 License

MIT
