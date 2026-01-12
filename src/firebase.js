// Firebase configuration
// IMPORTANT: Replace these with your Firebase project credentials
// Get them from: https://console.firebase.google.com/

import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Your Firebase configuration object
// Get this from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyB0CC74Hv3QIsLwClw5RbPVMQfpVQUmvmI",
  authDomain: "lastwarseason2map.firebaseapp.com",
  projectId: "lastwarseason2map",
  storageBucket: "lastwarseason2map.firebasestorage.app",
  messagingSenderId: "560862344896",
  appId: "1:560862344896:web:018a6dd9b114f81b605f25",
  measurementId: "G-LJ4QVNBEDJ"
};

// Initialize Firebase
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  
  // Enable offline persistence (optional but recommended)
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required for persistence.');
    }
  });
} catch (error) {
  console.warn('Firebase initialization failed. Using localStorage fallback:', error);
}

export { db };
export default app;
