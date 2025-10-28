# Pamwechete - Barter Trading Platform

A comprehensive barter trading application with mobile app (React Native Expo), backend API (Node.js/Express), and merchant/admin dashboard (Next.js).

## Project Structure

```
pamwechete/
├── mobile/              # React Native Expo mobile app
├── backend/             # Node.js/Express API server
├── dashboard/           # Next.js merchant/admin dashboard
└── README.md
```

## Features

### Mobile App
- **Onboarding Flow**: 3-step registration with interests, offerings, and profile setup
- **Authentication**: Clerk integration with persistent sessions
- **Home Tab**: Browse trade cards, add trades, view trade details
- **Inbox Tab**: Pending/Active/Finished conversations with real-time chat
- **Search Tab**: Tinder-style swipe cards for discovering trades
- **Community Tab**: Feed of trades with categories, filters, and ratings
- **Profile**: User management, verification process, and settings
- **Trade Points System**: AI-calculated points based on item metrics
- **Verification**: Upload ID, proof of residence, phone verification

### Backend API
- **Authentication**: Clerk JWT verification
- **Trade Management**: CRUD operations, search, recommendations
- **User Management**: Profiles, verification, documents
- **Messaging**: Real-time conversations between traders
- **Trade Points**: Automated calculation algorithm
- **AI Integration**: Item recommendations, verification assistance
- **MongoDB**: Mongoose ODM for data persistence

### Dashboard
- **Admin Functions**: 
  - User management and verification approval
  - Trade oversight and moderation
  - System analytics and reporting
  - API management
- **Merchant Functions**:
  - Trade management
  - Inbox and notifications
  - Community engagement
  - Profile settings

## Technology Stack

### Mobile (React Native Expo)
- React Native 0.73
- Expo SDK 50
- Expo Router (file-based routing)
- Clerk Expo (authentication)
- Axios (API client)
- React Native Reanimated Carousel (swipe cards)
- Expo Secure Store (token storage)

### Backend (Node.js)
- Node.js 18+
- Express.js
- MongoDB with Mongoose
- Clerk (authentication)
- Socket.io (real-time messaging)
- Multer (file uploads)
- OpenAI API (AI features)

### Dashboard (Next.js)
- Next.js 14
- React 18
- Clerk Next.js (authentication)
- TailwindCSS
- Recharts (analytics)
- ShadcnUI (components)

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or Atlas)
- Clerk account with API keys
- Expo CLI (`npm install -g expo-cli`)

### 1. Clone and Install

```bash
# Install mobile dependencies
cd mobile
npm install
cp .env.example .env
# Edit .env with your Clerk keys

# Install backend dependencies
cd ../backend
npm install
cp .env.example .env
# Edit .env with MongoDB URI and Clerk keys

# Install dashboard dependencies
cd ../dashboard
npm install
cp .env.example .env.local
# Edit .env.local with API URL and Clerk keys
```

### 2. Configure Clerk

1. Create a Clerk application at https://clerk.com
2. Get your publishable and secret keys
3. Add keys to all three `.env` files
4. Configure OAuth providers if needed
5. Set up webhook for user events

### 3. Start MongoDB

```bash
# If using local MongoDB
mongod --dbpath=/path/to/data

# Or use MongoDB Atlas connection string in .env
```

### 4. Run Applications

```bash
# Terminal 1 - Backend API
cd backend
npm run dev
# Runs on http://localhost:3001

# Terminal 2 - Mobile App
cd mobile
npm start
# Scan QR code with Expo Go app

# Terminal 3 - Dashboard
cd dashboard
npm run dev
# Runs on http://localhost:3000
```

## Environment Variables

### Mobile (.env)
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend (.env)
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/pamwechete
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
JWT_SECRET=your_jwt_secret
NODE_ENV=development
OPENAI_API_KEY=sk-...
```

### Dashboard (.env.local)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify Clerk token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/update` - Update profile
- `POST /api/users/verification` - Submit verification
- `POST /api/users/verification/documents` - Upload documents

### Trades
- `GET /api/trades` - List all trades
- `POST /api/trades` - Create trade
- `GET /api/trades/:id` - Get trade details
- `PUT /api/trades/:id` - Update trade
- `DELETE /api/trades/:id` - Delete trade
- `GET /api/trades/search` - Search trades
- `GET /api/trades/recommendations` - Get AI recommendations

### Trade Requests
- `POST /api/trade-requests` - Initiate trade
- `GET /api/trade-requests` - List user's trade requests
- `PUT /api/trade-requests/:id/accept` - Accept trade
- `PUT /api/trade-requests/:id/reject` - Reject trade
- `PUT /api/trade-requests/:id/complete` - Mark completed

### Messages
- `GET /api/messages/conversations` - List conversations
- `POST /api/messages` - Send message
- `GET /api/messages/thread/:id` - Get conversation thread

### Community
- `GET /api/community/posts` - List community posts
- `POST /api/community/posts` - Create post
- `POST /api/community/posts/:id/like` - Like post
- `POST /api/community/posts/:id/comment` - Comment on post

## Trade Points Algorithm

Trade points are calculated based on:
- **Base Value**: Original price or estimated value
- **Condition**: Wear and tear assessment (multiplier 0.5-1.0)
- **Age**: Time-based depreciation
- **Quality**: Brand, materials, craftsmanship
- **Demand**: Category popularity and search frequency
- **Service Rating**: For services, user rating history
- **Market Trends**: AI-analyzed supply/demand

Formula:
```
TradePoints = (BaseValue × Condition × Quality) 
              - AgeDepreciation 
              + DemandBonus 
              + RatingBonus
```

## Verification Process

Users must verify to trade:
1. **Phone Verification**: SMS OTP via Clerk
2. **ID Upload**: Driver's license, passport, or national ID
3. **Proof of Residence** (optional): Utility bill or bank statement
4. **AI Review**: Automated document verification
5. **Admin Approval**: Manual review for flagged cases

## Development Roadmap

- [x] Project setup and architecture
- [x] Authentication with Clerk
- [x] Onboarding flow (mobile)
- [ ] Home screen with trade cards
- [ ] Trade creation and management
- [ ] Swipe interface for search
- [ ] Messaging system
- [ ] Community feed
- [ ] Verification system
- [ ] Trade points algorithm
- [ ] AI recommendations
- [ ] Admin dashboard
- [ ] Merchant dashboard
- [ ] Payment integration (for premium features)
- [ ] Push notifications
- [ ] Analytics and reporting

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact: support@pamwechete.com
