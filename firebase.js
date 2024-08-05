// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: apiKey,
  authDomain: "pantryapp-f1ab4.firebaseapp.com",
  projectId: "pantryapp-f1ab4",
  storageBucket: "pantryapp-f1ab4.appspot.com",
  messagingSenderId: "300441795765",
  appId: "1:300441795765:web:6e2f76da3e99b9d5a712fc",
  measurementId: "G-6YDRJ91YLX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, firestore, auth, googleProvider };