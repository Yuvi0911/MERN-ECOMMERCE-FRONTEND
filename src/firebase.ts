// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: "mern-ecommerce-40672",
  storageBucket: "mern-ecommerce-40672.appspot.com",
  messagingSenderId: "397659531269",
  appId: "1:397659531269:web:f88acea1b5cf989f61146c",
  measurementId: "G-7RZGTQBVH7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);