# Getting Started with TaskMaster

This guide will help you set up and run the TaskMaster MVP on your local machine.

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn**
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git**

### For Mobile Development
- **Expo Go app** on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- Or iOS Simulator / Android Emulator

---

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd taskmaster
```

---

## Step 2: Set Up MongoDB

### Option A: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # macOS
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows
   # MongoDB should start automatically as a service
   ```

3. Verify it's running:
   ```bash
   mongosh
   ```

### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Whitelist your IP address

---

## Step 3: Set Up Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` file with your settings:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/taskmaster
   # Or use MongoDB Atlas URI:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmaster

   JWT_SECRET=your_super_secret_jwt_key_change_this
   NODE_ENV=development
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

6. You should see:
   ```
   🚀 Server running on port 5000
   MongoDB Connected: localhost
   ```

7. Test the API:
   ```bash
   curl http://localhost:5000/health
   ```

---

## Step 4: Set Up Mobile App

1. Open a new terminal and navigate to mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update API URL (if needed):

   Open `mobile/src/services/api.js` and update the `API_URL`:

   ```javascript
   // For local testing on physical device, use your computer's IP
   const API_URL = 'http://192.168.1.X:5000/api';

   // For emulator:
   // iOS Simulator: http://localhost:5000/api
   // Android Emulator: http://10.0.2.2:5000/api
   ```

4. Start Expo:
   ```bash
   npm start
   ```

5. You'll see a QR code in the terminal

6. Scan the QR code:
   - **iOS**: Use Camera app
   - **Android**: Use Expo Go app

---

## Step 5: Test the App

### Register a New User

1. Open the app on your phone
2. Tap "Don't have an account?"
3. Fill in the registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Phone: 0123456789
4. Tap "Register"

### Switch Language

1. Go to Profile tab
2. Toggle the language switch
3. App should switch between Vietnamese and English

### Explore the MVP Features

Currently available:
- ✅ User registration and login
- ✅ Home screen with welcome message
- ✅ Profile screen with user stats
- ✅ Language switching (Vietnamese ⟷ English)
- ✅ Logout functionality

---

## Development Tips

### Backend Development

**Watch for changes:**
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

**Check logs:**
- Server logs appear in the terminal
- Look for MongoDB connection status
- API requests are logged automatically

**Test API endpoints:**
Use curl, Postman, or Insomnia to test endpoints. See `docs/API.md` for full documentation.

### Mobile Development

**View logs:**
```bash
# In the Expo terminal, press:
# - 'r' to reload
# - 'j' to open debugger
# - 'i' to open iOS simulator
# - 'a' to open Android emulator
```

**Debug in browser:**
1. Press `j` in Expo terminal
2. Open React DevTools
3. View Redux state and actions

**Clear cache if needed:**
```bash
expo start -c
```

---

## Common Issues & Solutions

### Backend Issues

**MongoDB connection failed:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod  # Linux
```

**Port 5000 already in use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change the port in `.env` or kill the process:
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Mobile Issues

**Can't connect to backend:**
- Make sure backend is running
- Check API_URL in `mobile/src/services/api.js`
- Use your computer's local IP, not localhost (for physical devices)
- Make sure phone and computer are on the same WiFi network

**Find your local IP:**
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

**App crashes on startup:**
```bash
# Clear cache and restart
cd mobile
rm -rf node_modules
npm install
expo start -c
```

---

## Project Structure Reference

```
taskmaster/
├── backend/              # Node.js API
│   ├── src/
│   │   ├── config/      # Database config
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Business logic
│   │   ├── middleware/  # Auth, validation
│   │   └── server.js    # Entry point
│   └── package.json
│
├── mobile/              # React Native app
│   ├── src/
│   │   ├── screens/     # App screens
│   │   ├── components/  # Reusable components
│   │   ├── redux/       # State management
│   │   ├── services/    # API calls
│   │   ├── locales/     # Translations (vi/en)
│   │   └── navigation/  # Navigation config
│   ├── App.js           # App entry point
│   └── package.json
│
└── docs/                # Documentation
    ├── ROADMAP.md       # Development phases
    ├── API.md           # API documentation
    └── GETTING_STARTED.md
```

---

## Next Steps

Once you have the MVP running:

1. **Explore the Code**
   - Read through the backend models
   - Understand the Redux store structure
   - Check out the i18n translations

2. **Start Phase 2 Development**
   - See `docs/ROADMAP.md` for the next features
   - Start with task creation screen
   - Add task listing and filtering

3. **Test Thoroughly**
   - Test user registration and login
   - Test language switching
   - Report any bugs

4. **Contribute**
   - Follow the code style
   - Write clear commit messages
   - Update documentation as needed

---

## Useful Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm start            # Start production server
```

### Mobile
```bash
cd mobile
npm install          # Install dependencies
npm start            # Start Expo
npm run android      # Open on Android
npm run ios          # Open on iOS
expo start -c        # Clear cache and start
```

### MongoDB
```bash
mongosh                           # Open MongoDB shell
use taskmaster                    # Switch to database
db.users.find()                   # View all users
db.tasks.find()                   # View all tasks
db.dropDatabase()                 # Delete database (careful!)
```

---

## Resources

- [Node.js Docs](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

---

## Need Help?

- Check `docs/API.md` for API documentation
- Check `docs/ROADMAP.md` for development phases
- Review the code comments
- Create an issue in the repository

---

## Happy Coding! 🚀
