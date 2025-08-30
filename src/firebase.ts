// src/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration is read from the environment variables
const firebaseConfig = {
  apiKey: "AIzaSyCvh4pgmfDqak0HjsRHtkTc71qsBXsmibE",
  authDomain: "my-finance-9c1c4.firebaseapp.com",
  projectId: "my-finance-9c1c4",
  storageBucket: "my-finance-9c1c4.firebasestorage.app",
  messagingSenderId: "640428858611",
  appId: "1:640428858611:web:dfbceab24902eaea092b86",
  measurementId: "G-ZJVR28KDC1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you'll need throughout your app
export const auth = getAuth(app);
export const db = getFirestore(app);