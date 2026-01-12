# Firebase Setup Guide for Real-Time Collaboration

This guide will help you set up Firebase Firestore to enable real-time collaboration features for the Season 2 Map Planner.

## Why Firebase?

Firebase Firestore provides:
- **Real-time synchronization**: See changes from other alliances instantly
- **No backend server needed**: Everything runs from the frontend
- **Free tier**: Generous free tier for small to medium projects
- **Automatic conflict resolution**: Last write wins strategy

## Step-by-Step Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "lastwar-map-planner")
4. Optionally disable Google Analytics (not needed for this)
5. Click "Create project"

### 2. Register a Web App

1. In your Firebase project, click the web icon (`</>`) to add a web app
2. Register your app with a nickname (e.g., "Map Planner Web")
3. Copy the Firebase configuration object that appears
   - It will look like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

### 3. Configure Firestore Database

1. In Firebase Console, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
   - **Important**: For production, set up proper security rules (see below)
4. Choose a location (select one closest to your users)
5. Click "Enable"

### 4. Update Firebase Configuration

1. Open `src/firebase.js` in your project
2. Replace the placeholder values with your actual Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_ACTUAL_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

### 5. Install Dependencies

If you haven't already, install Firebase:

```bash
npm install firebase
```

### 6. Test the Connection

1. Run your development server: `npm run dev`
2. Open the app in your browser
3. You should see "🟢 Online" in the toolbar when connected
4. Open the app in multiple browser tabs/windows to test real-time sync

## Security Rules (Production)

For production use, set up proper Firestore security rules. In Firebase Console:

1. Go to "Firestore Database" > "Rules"
2. Replace with these rules (allows read/write for authenticated users, or public read/write for testing):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to rooms
    match /rooms/{roomId} {
      allow read, write: if true; // Public access (for testing)
      // For production, use: allow read, write: if request.auth != null;
    }
    
    // Allow read/write access to presence
    match /presence/{userId} {
      allow read: if true;
      allow write: if request.resource.data.userId == request.auth.uid 
                   || request.resource.data.userId == userId;
      // For testing without auth, use: allow read, write: if true;
    }
  }
}
```

## Features Enabled

Once set up, you'll have:

1. **Real-time Sync**: Changes made by any alliance are instantly visible to all users
2. **Active User Tracking**: See who else is currently working on the map
3. **Automatic Conflict Resolution**: Last write wins (simplest approach)
4. **Offline Support**: Falls back to localStorage if Firebase is unavailable
5. **Presence Indicators**: See online users in the toolbar

## Troubleshooting

### "Firebase unavailable - using localStorage"
- Check your Firebase configuration in `src/firebase.js`
- Verify your Firestore database is enabled
- Check browser console for error messages

### "Multiple tabs open, persistence can only be enabled in one tab"
- This is a warning, not an error
- The app will still work, but offline persistence works best with one tab

### Changes not syncing
- Check your Firestore security rules
- Verify you're connected (look for "🟢 Online" status)
- Check browser console for errors

### Too many reads/writes
- Firestore free tier: 50K reads/day, 20K writes/day
- Consider implementing debouncing (already done) and caching
- Monitor usage in Firebase Console > Usage

## Fallback Mode

The app automatically falls back to localStorage if:
- Firebase is not configured
- Firebase connection fails
- Database is unavailable

In fallback mode, features still work but without real-time collaboration.

## Cost Considerations

Firebase Free Tier (Spark Plan):
- 1 GB storage
- 50K reads/day
- 20K writes/day
- 20K deletes/day

For most alliance planning use cases, this is more than sufficient. Monitor your usage in the Firebase Console.
