# Quick Fix for White Screen

If you're seeing a white screen, it's likely because **Firebase is not installed**.

## Solution

Run this command in your terminal:

```bash
npm install firebase
```

Then refresh your browser. The app should load correctly.

## Alternative: Disable Firebase Temporarily

If you want to use the app without Firebase (localStorage only), you can temporarily comment out the Firebase imports in `src/App.jsx`:

1. Open `src/App.jsx`
2. Comment out lines 2-15 (the Firebase imports)
3. The app will work in localStorage-only mode (no real-time collaboration)

But the easiest solution is to just install Firebase with the command above!
