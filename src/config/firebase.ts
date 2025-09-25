import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKBMxzSdcqmZ98KCp_wS1ql70_tAPFEfE",
  authDomain: "family-meal-planner-be7f7.firebaseapp.com",
  projectId: "family-meal-planner-be7f7",
  storageBucket: "family-meal-planner-be7f7.firebasestorage.app",
  messagingSenderId: "1047699275735",
  appId: "1:1047699275735:web:457a7b55146dbcb91d5592",
  measurementId: "G-625QLLP6DP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Development mode: connect to emulators if needed
// if (__DEV__) {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }

export default app;
