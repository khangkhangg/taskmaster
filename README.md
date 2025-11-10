# TaskMaster - Task Bidding Platform

A mobile platform where anyone can list tasks and service providers can bid to complete them.

## 🎯 Features

### Phase 1 (MVP) - ✅ Complete
- ✅ User registration and authentication
- ✅ Multi-role support (Task Poster / Task Doer)
- ✅ User profiles with ratings and stats
- ✅ Multi-language support (Vietnamese default, English)
- ✅ Complete backend API with all core endpoints

### Phase 2 (Enhanced Core) - ✅ Complete
- ✅ Task creation with full form (title, description, category, budget, location, deadline)
- ✅ Browse tasks with filters (category, status, search)
- ✅ Task details view with all information
- ✅ Place bids on tasks with custom pricing and timeline
- ✅ View received bids on your tasks (bidder profiles, ratings)
- ✅ Accept bids (assigns task, updates statuses)
- ✅ My Tasks screen (manage all posted tasks)
- ✅ My Bids screen (track all submitted bids)
- ✅ 5-tab navigation (Home, Tasks, My Tasks, My Bids, Profile)
- ✅ Pull-to-refresh on all lists
- ✅ Form validation and error handling
- ✅ Empty states and loading indicators

### Phase 3 (Trust & Safety) - ✅ Complete
- ✅ Review and rating system (mutual reviews with detailed quality metrics)
- ✅ Trust score calculation (0-100 score with factor breakdown)
- ✅ Trust levels and achievement badges
- ✅ User reviews display with trust score visualization
- ✅ Task completion workflow with instant review
- ✅ Dispute filing and management system
- ✅ Dispute messaging between parties
- ✅ Review responses (reviewees can respond)
- ✅ Quality ratings (communication, professionalism, timeliness, quality)
- ✅ Complete task and review screen

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: Joi

### Mobile App
- **Framework**: React Native (Expo)
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **UI Library**: React Native Paper
- **API Client**: Axios
- **i18n**: react-i18next

## 📁 Project Structure

```
taskmaster/
├── backend/              # Node.js API server
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── models/      # MongoDB models
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Route handlers
│   │   ├── middleware/  # Custom middleware
│   │   ├── utils/       # Utility functions
│   │   └── server.js    # Entry point
│   ├── package.json
│   └── .env.example
│
├── mobile/              # React Native app
│   ├── src/
│   │   ├── screens/     # App screens
│   │   ├── components/  # Reusable components
│   │   ├── navigation/  # Navigation config
│   │   ├── redux/       # State management
│   │   ├── services/    # API services
│   │   ├── locales/     # Translations
│   │   └── utils/       # Utilities
│   ├── App.js
│   └── package.json
│
└── docs/                # Documentation
    ├── ROADMAP.md       # Development phases
    └── API.md           # API documentation
```

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

### Mobile App Setup

```bash
cd mobile
npm install
npm start
# Scan QR code with Expo Go app
```

## 📱 Default Language

- **Default**: Vietnamese (vi)
- **Available**: English (en)

## 📋 Documentation

- **[Getting Started Guide](docs/GETTING_STARTED.md)** - Step-by-step setup instructions
- **[Development Roadmap](docs/ROADMAP.md)** - Complete phased development plan
- **[API Documentation](docs/API.md)** - Full API reference
- **[Phase 2 Summary](docs/PHASE2_SUMMARY.md)** - Phase 2 features and implementation details

## 🎯 What's Included

This fully functional task bidding platform includes:

**Backend API:**
- ✅ Complete REST API with authentication, tasks, and bidding endpoints
- ✅ User management with roles, ratings, and verification tracking
- ✅ Task CRUD with filtering and status management
- ✅ Bidding system with accept/reject functionality
- ✅ JWT authentication and authorization
- ✅ Review and rating system with quality metrics
- ✅ Trust score calculation algorithm
- ✅ Dispute management system

**Mobile App (10+ Screens):**
- ✅ Authentication (Login/Register)
- ✅ Home screen with recent tasks and categories
- ✅ Tasks list with search and filters
- ✅ Task details view
- ✅ Task creation form
- ✅ Bid placement screen
- ✅ My Tasks management
- ✅ My Bids tracking
- ✅ Task Bids review (for owners)
- ✅ User profile with stats
- ✅ Complete task and review screen
- ✅ User reviews and trust score display
- ✅ File dispute screen

**Features:**
- ✅ Complete task posting workflow
- ✅ Browse and search tasks
- ✅ Place and manage bids
- ✅ Accept bids and assign tasks
- ✅ Multi-language support (Vietnamese & English)
- ✅ Pull-to-refresh on all lists
- ✅ Form validation and error handling
- ✅ Redux state management
- ✅ Responsive navigation
- ✅ Mutual review system with quality ratings
- ✅ Trust score visualization (0-100)
- ✅ Dispute filing and tracking
- ✅ Task completion workflow

## 🚦 Current Status

**Phase 1 (MVP): COMPLETED** ✅
**Phase 2 (Enhanced Core): COMPLETED** ✅
**Phase 3 (Trust & Safety): COMPLETED** ✅

The platform now has a complete trust and safety system! Users can:
- Post tasks with full details
- Browse and filter available tasks
- Place competitive bids
- Review and accept bids
- Track all their tasks and bids
- Complete tasks and leave detailed reviews
- View trust scores and user reviews
- File and manage disputes
- Build reputation through quality work

**Ready for Phase 4: Communication & Notifications** 🚀

## 🔑 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmaster
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## 📄 License

MIT
