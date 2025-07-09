import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDTXtMsBp2Fsd9nysD3Am-ZUfYBdkpVHuk",
  authDomain: "numeric-vehicle-453915-j9.firebaseapp.com",
  projectId: "numeric-vehicle-453915-j9",
  storageBucket: "numeric-vehicle-453915-j9.firebasestorage.app",
  messagingSenderId: "433589901353",
  appId: "1:433589901353:web:bf3b5ec1d91ed83620e438",
  measurementId: "G-30M1SNNBDR"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// import { db } from "./firebase";