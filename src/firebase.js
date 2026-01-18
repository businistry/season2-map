// Firebase configuration
// IMPORTANT: Install Firebase first with: npm install firebase

import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration object
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
let app = null;
let db = null;
let auth = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  
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
  app = null;
  db = null;
  auth = null;
}

export { db, auth };
export default app;
