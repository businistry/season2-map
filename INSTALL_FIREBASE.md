# Install Firebase to Fix Initialization Error

If you're seeing a Firebase initialization error, you need to install Firebase first.

## Quick Fix

Run this command in your terminal:

```bash
npm install firebase
```

Then restart your development server:

```bash
npm run dev
```

## Why This Happens

The app uses Firebase Firestore for real-time collaboration. If Firebase isn't installed, the imports will fail and you'll see initialization errors.

## After Installation

Once Firebase is installed:
- The app will connect to Firebase automatically
- You'll see real-time collaboration features
- Multiple alliances can work on the map simultaneously
- You'll see online status and active users

## If You Don't Want to Use Firebase

If you want to use the app without Firebase (localStorage only):
1. The app will automatically fall back to localStorage if Firebase isn't available
2. You just need Firebase installed so the imports don't fail
3. You can leave Firebase unconfigured and it will use localStorage

The easiest solution is to just install Firebase with: `npm install firebase`
