# Getting Started with Pamwechete

## Quick Start Guide

### Step 1: Install Dependencies

```bash
# Install mobile dependencies
cd mobile && npm install

# Install backend dependencies
cd ../backend && npm install

# Install dashboard dependencies (to be created)
cd ../dashboard && npm install
```

### Step 2: Set Up Environment Variables

#### Mobile App
```bash
cd mobile
cp .env.example .env
```

Edit `mobile/.env`:
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

#### Backend
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/pamwechete
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
JWT_SECRET=your_random_jwt_secret
OPENAI_API_KEY=your_openai_key (optional for now)
```

### Step 3: Set Up Clerk

1. Go to https://clerk.com and create an account
2. Create a new application
3. Copy your publishable key and secret key
4. Enable email/password authentication
5. Enable phone number (for verification)
6. Add the keys to your `.env` files

### Step 4: Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# Start MongoDB
sudo systemctl start mongodb
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Add to `backend/.env` as `MONGODB_URI`

### Step 5: Run the Applications

#### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```
Backend runs on http://localhost:3001

#### Terminal 2: Start Mobile App
```bash
cd mobile
npm start
```
Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator  
- Scan QR code with Expo Go app on your phone

### Step 6: Test the Application

1. Open the mobile app
2. You'll see the onboarding flow
3. Select your interests
4. Select what you can offer
5. Complete registration with Clerk

## Current Project Status

### ✅ Completed
- Project structure created
- Mobile app base setup with Expo Router
- Clerk authentication integration
- Onboarding flow (3 screens):
  - Interests selection
  - Offerings selection
  - Registration (to be completed)
- Backend API structure
- MongoDB models:
  - User model with verification
  - Trade model with points calculation
- Theme and constants
- API client configuration

### 🚧 In Progress
- Registration screen (onboarding step 3)
- Tab navigation (Home, Inbox, Search, Community, Profile)
- Backend API routes and controllers

### 📋 To Do
- Complete all mobile screens
- Backend API endpoints
- Real-time messaging
- File upload functionality
- AI recommendations
- Verification system
- Admin dashboard (Next.js)
- Merchant dashboard features

## Project Architecture

```
pamwechete/
├── mobile/                      # React Native Expo
│   ├── app/                    # Expo Router pages
│   │   ├── _layout.tsx         # Root layout with Clerk
│   │   ├── index.tsx           # Entry point
│   │   ├── onboarding/         # Onboarding screens
│   │   │   ├── index.tsx       # Step 1: Interests
│   │   │   ├── offering.tsx    # Step 2: Offerings
│   │   │   └── register.tsx    # Step 3: Registration (to create)
│   │   └── (tabs)/             # Main app tabs (to create)
│   │       ├── home.tsx
│   │       ├── inbox.tsx
│   │       ├── search.tsx
│   │       ├── community.tsx
│   │       └── profile.tsx
│   ├── constants/
│   │   └── theme.ts            # Colors, fonts, sizes
│   └── utils/
│       └── api.ts              # API client
│
├── backend/                     # Node.js/Express API
│   ├── src/
│   │   ├── server.js           # Entry point
│   │   ├── config/
│   │   │   └── database.js     # MongoDB connection
│   │   ├── models/             # Mongoose models
│   │   │   ├── User.js         # User with verification
│   │   │   ├── Trade.js        # Trade with points
│   │   │   ├── TradeRequest.js # (to create)
│   │   │   ├── Message.js      # (to create)
│   │   │   └── Community.js    # (to create)
│   │   ├── routes/             # (to create)
│   │   ├── controllers/        # (to create)
│   │   ├── middleware/         # (to create)
│   │   └── services/           # (to create)
│   └── package.json
│
└── dashboard/                   # Next.js (to create)
    ├── app/
    ├── components/
    └── package.json
```

## Key Features Implemented

### Trade Points Calculation Algorithm
The system automatically calculates trade points based on:
- Base value of the item
- Condition (new, like_new, good, fair, poor)
- Age with depreciation
- Quality rating (1-10)
- Category demand bonus
- Market trends

Formula implemented in `backend/src/models/Trade.js`

### Clerk Authentication
- Secure token storage with Expo Secure Store
- Automatic token refresh
- Protected routes
- User session persistence

### Theme System
- Pamwechete brand colors:
  - Primary: #003C5C (Navy blue)
  - Secondary: #F89E1B (Orange)
- Consistent spacing and typography
- Pre-defined shadows for elevation

## Next Steps

1. **Complete Registration Screen**
   - Add form fields for name, phone, email, password
   - Integrate with Clerk signup
   - Store user preferences in backend

2. **Create Tab Navigation**
   - Set up bottom tab navigator
   - Create placeholder screens

3. **Build Home Screen**
   - Trade card components
   - Add trade modal
   - Trade details modal

4. **Implement Backend Routes**
   - Auth routes with Clerk verification
   - Trade CRUD operations
   - User management

5. **Add Real-time Messaging**
   - Socket.io integration
   - Chat interface
   - Conversation management

## Troubleshooting

### Mobile App Won't Start
- Ensure you have Node.js 18+ installed
- Clear Expo cache: `npx expo start -c`
- Delete `node_modules` and `package-lock.json`, then reinstall

### Backend Connection Issues
- Check MongoDB is running: `sudo systemctl status mongodb`
- Verify `.env` file has correct MongoDB URI
- Check port 3001 is not in use

### Clerk Authentication Errors
- Verify API keys are correct in `.env`
- Check Clerk dashboard for application status
- Ensure environment variables are prefixed with `EXPO_PUBLIC_` for mobile

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Clerk Documentation](https://clerk.com/docs)
- [React Native](https://reactnative.dev/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/docs/)
- [Next.js](https://nextjs.org/docs)

## Support

For questions or issues:
1. Check the main README.md
2. Review the GETTING_STARTED.md (this file)
3. Check individual component files for inline documentation
4. Contact: dev@pamwechete.com
