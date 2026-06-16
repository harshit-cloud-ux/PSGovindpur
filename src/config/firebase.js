import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAJMC5E1jOmLk-z6g9x5DhTj5Oc-UxzwKY",
  authDomain: "ps-govindpur.firebaseapp.com",
  projectId: "ps-govindpur",
  storageBucket: "ps-govindpur.firebasestorage.app",
  messagingSenderId: "274491947776",
  appId: "1:274491947776:web:5afb5195f47dd1d8fe11e5",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export default app;