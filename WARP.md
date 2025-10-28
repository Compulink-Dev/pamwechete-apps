# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Pamwechete is a barter trading platform with three components:
- **Mobile App**: React Native Expo app for traders (users)
- **Backend API**: Node.js/Express server with MongoDB
- **Dashboard**: Next.js admin/merchant dashboard (placeholder only)

The platform uses a trade points system to value items and facilitate fair exchanges between users.

## Commands

### Mobile App (React Native Expo)
```bash
cd mobile
npm install                    # Install dependencies
npm start                      # Start Expo dev server
npm run android               # Run on Android emulator
npm run ios                   # Run on iOS simulator
```

**Testing mobile:**
- Use Expo Go app on physical device (scan QR code)
- Press `a` for Android emulator, `i` for iOS simulator
- Clear cache: `npx expo start -c`

### Backend API
```bash
cd backend
npm install                    # Install dependencies
npm run dev                    # Start with nodemon (auto-reload)
npm start                      # Start production server
npm test                       # Run Jest tests
```

**Backend runs on:** `http://localhost:3001`

### Dashboard (Not Yet Implemented)
The dashboard directory exists but has no implementation yet. When created, it will be a Next.js 14 app.

## Architecture

### Mobile App Structure
- **File-based routing**: Uses Expo Router (similar to Next.js App Router)
- **App directory structure**:
  - `app/_layout.tsx` - Root layout with Clerk provider
  - `app/index.tsx` - Entry point
  - `app/onboarding/` - 3-step onboarding flow (interests → offerings → registration)
  - `app/(tabs)/` - Main app (home, inbox, search, community, profile)
- **Theme system**: Centralized in `constants/theme.ts` with brand colors (Navy #003C5C, Orange #F89E1B)
- **API client**: Axios with interceptors in `utils/api.ts` handles auth tokens automatically

### Backend Structure
- **Entry point**: `src/server.js` sets up Express + Socket.IO
- **Models**: Mongoose schemas in `src/models/`
  - `User.js` - User profiles with verification system
  - `Trade.js` - Trade items with auto-calculated trade points
- **Routes**: RESTful API in `src/routes/`
- **Controllers**: Business logic in `src/controllers/`
- **Middleware**: Auth (Clerk JWT) and error handling in `src/middleware/`

### Trade Points Algorithm
The core valuation system is in `Trade.js` model:
- **Formula**: `(BaseValue × Condition × Quality × DemandBonus) - AgeDepreciation`
- **Factors**:
  - Condition multipliers: new (1.0) → poor (0.4)
  - Age depreciation: 5% per year for first 5 years
  - Quality: 1-10 scale affects 0.5x to 1.5x multiplier
  - Category demand bonuses: Electronics (1.2x), Vehicles (1.5x), Jewelry (1.3x), etc.
- **Calculated automatically** on save via Mongoose pre-save hook

## Key Technical Details

### Authentication Flow
- **Clerk** handles all authentication (phone, email/password, OAuth)
- **Mobile**: Clerk Expo SDK stores tokens in Expo SecureStore
- **Backend**: Verifies Clerk JWT tokens via middleware at `src/middleware/auth.js`
- **Token handling**: API client auto-injects tokens from SecureStore on every request

### Real-time Messaging
- **Socket.IO** configured in `server.js`
- **Events**: `join-conversation`, `send-message`, `new-message`
- **Connection**: Mobile app should connect to `http://localhost:3001` with Socket.IO client

### Data Models
**User model** includes:
- Clerk ID for authentication sync
- Interests and offerings from onboarding
- Verification status (phone, identity documents, proof of residence)
- Trade statistics (points, rating, completed trades)

**Trade model** includes:
- Owner reference, title, description, category
- Valuation details (base value, age, quality, brand)
- Auto-calculated trade points
- Location with geospatial index (2dsphere)
- Status lifecycle (active → pending → completed/cancelled)
- Stats (views, likes, wishlist)

### Environment Variables
**Mobile** (`.env`):
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

**Backend** (`.env`):
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/pamwechete
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
JWT_SECRET=your_jwt_secret
NODE_ENV=development
OPENAI_API_KEY=sk-...
```

## Development Workflow

### Starting Development
1. **Start MongoDB** (if using local): `mongod` or verify Atlas connection
2. **Terminal 1** - Backend: `cd backend && npm run dev`
3. **Terminal 2** - Mobile: `cd mobile && npm start`
4. Mobile app will display QR code for testing

### Making Changes

**Adding a new mobile screen:**
1. Create file in `app/(tabs)/` or appropriate directory
2. Follow Expo Router file-based routing conventions
3. Import theme constants from `constants/theme.ts`
4. Use API client from `utils/api.ts` for backend calls

**Adding a new API endpoint:**
1. Define route in `src/routes/[resource].routes.js`
2. Create controller in `src/controllers/[resource].controller.js`
3. Add middleware if needed (auth, validation)
4. Update `src/routes/index.js` to register route
5. Update mobile `utils/api.ts` endpoints object

**Database schema changes:**
1. Modify Mongoose model in `src/models/`
2. Consider data migration for existing records
3. Update related controllers and API documentation

### Testing
- **Mobile**: Currently uses mock data for UI testing
- **Backend**: Jest configured but tests not yet written
- **Manual testing**: Use Expo Go app + backend dev server

## Project Status

### Completed
- ✅ Mobile app with all 5 tab screens (home, inbox, search, community, profile)
- ✅ 3-step onboarding flow
- ✅ Clerk authentication integration (mobile + backend)
- ✅ Backend API with trade and auth routes
- ✅ Trade points calculation algorithm
- ✅ MongoDB models (User, Trade)
- ✅ Socket.IO setup for real-time messaging

### In Progress / Not Yet Implemented
- ⏳ User routes (profile update, verification submission)
- ⏳ Message routes and chat functionality
- ⏳ Community post routes
- ⏳ Trade request model and routes
- ⏳ File upload with Multer (for images and documents)
- ⏳ Mobile app integration with real backend API (currently using mock data)
- ⏳ Dashboard implementation (directory exists but empty)

## Important Patterns

### Mobile API Integration Pattern
The mobile app uses a centralized API client:
```typescript
import api, { endpoints } from '@/utils/api';

// Making API calls
const response = await api.get(endpoints.trades.list);
const trade = await api.get(endpoints.trades.details(tradeId));
```

### Error Handling
- Backend uses centralized error handler middleware
- API client intercepts 401s and clears auth tokens
- Mobile screens should handle loading/error states

### Database Queries
- Use Mongoose query methods with proper indexing
- Trade model has indexes on: owner, status, category, tradePoints, location (geospatial)
- Always populate user references when needed

### Styling Pattern (Mobile)
```typescript
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
    ...SHADOWS.medium,
  },
});
```

## Common Issues

### Mobile Development
- **"Cannot connect to Metro"**: Clear cache with `npx expo start -c`
- **Auth token not persisting**: Check SecureStore permissions
- **API calls failing**: Verify `EXPO_PUBLIC_API_URL` in `.env` and backend is running

### Backend Development
- **MongoDB connection errors**: Check MongoDB is running (`sudo systemctl status mongodb`) or verify Atlas connection string
- **Clerk JWT verification fails**: Ensure `CLERK_SECRET_KEY` matches your Clerk dashboard
- **Port 3001 in use**: Kill existing process or change PORT in `.env`

### General
- **Changes not reflecting**: Restart dev server (especially backend with `npm run dev`)
- **Module not found**: Delete `node_modules` and `package-lock.json`, run `npm install`
