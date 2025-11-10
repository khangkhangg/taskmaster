# TaskMaster - Task Bidding Platform

A mobile platform where anyone can list tasks and service providers can bid to complete them.

## 🎯 Features (MVP - Phase 1)

### Core Functionality
- ✅ User registration and authentication
- ✅ Multi-role support (Task Poster / Task Doer)
- ✅ Create and browse tasks
- ✅ Bidding system
- ✅ User profiles with ratings
- ✅ Multi-language support (Vietnamese default, English)

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

## 🎯 What's Included in This MVP

This prototype includes:
- ✅ Complete backend API with authentication, tasks, and bidding
- ✅ React Native mobile app with core screens
- ✅ Multi-language support (Vietnamese & English)
- ✅ User profiles with ratings and stats
- ✅ Redux state management
- ✅ Fully documented API endpoints
- ✅ Clear development roadmap for next phases

## 🚦 Current Status

**Phase 1 (MVP): COMPLETED** ✅

Ready to start Phase 2! See the roadmap for next steps.

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
