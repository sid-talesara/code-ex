// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "code-ex.firebaseapp.com",
  projectId: "code-ex",
  storageBucket: "code-ex.appspot.com",
  messagingSenderId: "936392309885",
  appId: "1:936392309885:web:12d6d6e55326fc9a74c514",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
