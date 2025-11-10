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

### Phase 4 (Communication & Notifications) - ✅ Complete
- ✅ Real-time messaging with Socket.io
- ✅ Task-based chat conversations
- ✅ Conversations list screen
- ✅ Chat screen with message history
- ✅ Real-time notification system
- ✅ Notifications screen with filtering
- ✅ Notification types (bid, message, task status, review)
- ✅ Unread message and notification counters
- ✅ Message persistence and history

### Phase 5 (Social & Discovery) - ✅ Complete
- ✅ Enhanced user profiles (portfolio, social links, expertise, hourly rate)
- ✅ Follow/unfollow users functionality
- ✅ Followers and following counts
- ✅ Task bookmarking system
- ✅ Saved tasks screen
- ✅ Public profile viewing
- ✅ User search by name/skills/expertise/location
- ✅ Search users screen
- ✅ Personalized task recommendations based on skills and location
- ✅ User recommendation system
- ✅ Enhanced profile stats and verification badges

### Phase 6 (Advanced Features & Optimization) - ✅ Complete
- ✅ Payment/Escrow system with Transaction model
- ✅ Secure escrow payment flow (hold, release, refund)
- ✅ Automatic 10% platform fee calculation
- ✅ Transaction timeline tracking
- ✅ Payment status management (pending, held, released, refunded)
- ✅ Wallet screen with transaction history
- ✅ Dashboard screen with analytics
- ✅ User dashboard (task/bid/financial statistics)
- ✅ Task analytics (bid statistics, timing metrics)
- ✅ Marketplace insights (platform-wide statistics)
- ✅ User performance metrics (completion rates, earnings trends)
- ✅ Database optimization with indexes
- ✅ Payment provider integration ready (Stripe, Momo, ZaloPay)

### Phase 7 (Admin & Operations) - ✅ Complete
- ✅ Admin role system (user, admin, superadmin)
- ✅ Admin authentication middleware with role checks
- ✅ User management (view, suspend, verify, promote, delete)
- ✅ User suspension with reason and duration
- ✅ Identity verification system for users
- ✅ Task moderation (flag, unflag, remove)
- ✅ Flagged tasks review system
- ✅ Dispute resolution with multiple resolution types
- ✅ Partial refund support in dispute resolution
- ✅ Dispute priority management (low, medium, high, urgent)
- ✅ Admin messaging in disputes
- ✅ Platform statistics dashboard
- ✅ User growth trends analytics
- ✅ Revenue trends and financial analytics
- ✅ Category distribution statistics
- ✅ Top performers leaderboard
- ✅ Activity monitoring and reporting
- ✅ Admin dashboard screen (mobile)
- ✅ User management screen with search and filters
- ✅ Task moderation screen with flagged tasks
- ✅ Moderation notes for users and tasks
- ✅ Audit trails for admin actions
- ✅ 38 admin API endpoints for platform management

### Phase 8 (Content Management & Communication) - ✅ Complete
- ✅ File upload system with Multer middleware
- ✅ Image uploads (JPEG, JPG, PNG, GIF, WEBP)
- ✅ Document uploads (PDF, DOC, DOCX, TXT)
- ✅ Automatic file organization by type
- ✅ 5MB file size limit with validation
- ✅ Email notification service with Nodemailer
- ✅ 7 professional HTML email templates
- ✅ Transactional emails (welcome, bid, completion, review, dispute)
- ✅ Advanced search with multiple filters
- ✅ Task search by category, budget, location, skills
- ✅ User search by skills, rating, verification status
- ✅ Global search across platform
- ✅ Search suggestions and autocomplete
- ✅ Popular searches analytics
- ✅ API rate limiting middleware
- ✅ Tiered rate limits (auth, create, upload, search, admin)
- ✅ IP-based throttling
- ✅ Advanced search screen (mobile)
- ✅ Multi-filter search interface
- ✅ Static file serving for uploads
- ✅ File deletion utilities

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: Joi
- **File Upload**: Multer
- **Email Service**: Nodemailer
- **Rate Limiting**: express-rate-limit
- **Real-time**: Socket.io

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
- ✅ Real-time messaging with Socket.io
- ✅ Notification system with multiple types
- ✅ User following/followers system
- ✅ Task bookmarking and recommendations
- ✅ Payment/escrow system with transaction tracking
- ✅ Analytics dashboard with marketplace insights
- ✅ Admin role system with role-based access control
- ✅ User management (suspend, verify, promote, delete)
- ✅ Task moderation (flag, review, remove)
- ✅ Dispute resolution with admin controls
- ✅ Platform statistics and reporting
- ✅ Activity monitoring and audit trails
- ✅ File upload system (images, documents)
- ✅ Email notification service
- ✅ Advanced search with filters
- ✅ API rate limiting and security

**Mobile App (24+ Screens):**
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
- ✅ Conversations list (messages)
- ✅ Chat screen with real-time messaging
- ✅ Notifications screen with filtering
- ✅ Saved tasks screen
- ✅ Public profile viewing
- ✅ Search users screen
- ✅ Wallet and transaction history
- ✅ Dashboard with analytics
- ✅ Admin dashboard with platform stats
- ✅ User management screen
- ✅ Task moderation screen
- ✅ Advanced search screen with filters

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
- ✅ Real-time chat and messaging
- ✅ Push notifications for key events
- ✅ User following and social network
- ✅ Task bookmarking and recommendations
- ✅ User search and discovery
- ✅ Escrow payment system
- ✅ Transaction history and wallet
- ✅ Analytics dashboard with insights
- ✅ Admin role-based access control
- ✅ User moderation (suspend, verify users)
- ✅ Task moderation (flag, remove tasks)
- ✅ Dispute resolution with admin controls
- ✅ Platform statistics and monitoring
- ✅ Advanced search with multiple filters
- ✅ File uploads and management
- ✅ Email notifications

## 🚦 Current Status

**Phase 1 (MVP): COMPLETED** ✅
**Phase 2 (Enhanced Core): COMPLETED** ✅
**Phase 3 (Trust & Safety): COMPLETED** ✅
**Phase 4 (Communication & Notifications): COMPLETED** ✅
**Phase 5 (Social & Discovery): COMPLETED** ✅
**Phase 6 (Advanced Features & Optimization): COMPLETED** ✅
**Phase 7 (Admin & Operations): COMPLETED** ✅
**Phase 8 (Content Management & Communication): COMPLETED** ✅

The platform is now a fully-featured production-ready task bidding marketplace! Users can:
- Post tasks with full details (title, description, budget, location, deadline)
- Browse, search, and filter available tasks
- Place competitive bids with custom pricing
- Review and accept bids from qualified providers
- Track all their tasks and bids
- Communicate in real-time via task-based chat
- Receive notifications for all key events
- Complete tasks and leave detailed reviews with quality ratings
- View trust scores (0-100) and user reviews
- File and manage disputes with messaging
- Build reputation through quality work
- Follow other users and build a professional network
- Bookmark tasks for later
- Get personalized task recommendations
- Search and discover users by skills and location
- Manage finances with secure escrow payments
- View transaction history in wallet
- Track performance with analytics dashboard
- See marketplace insights and trends

**Admins can:**
- Access comprehensive platform dashboard with key metrics
- Manage users (suspend, verify, promote, delete)
- Moderate tasks (flag, review, remove inappropriate content)
- Resolve disputes with multiple resolution options
- Monitor platform health and user activity
- View detailed analytics and growth trends
- Track revenue and financial statistics
- Generate reports and performance metrics

**Ready for Production Deployment!** 🚀

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
