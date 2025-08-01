import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

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
export const auth = getAuth(app);
export const storage = getStorage(app);
// 배열 → Firestore 필드 객체 변환
function socialLinksArrayToFields(arr: { type: string; url: string }[]) {
  return arr.reduce((acc, { type, url }) => {
    if (url) acc[`${type}Url`] = url;
    return acc;
  }, {} as Record<string, string>);
}

// Firestore 필드 객체 → 배열 변환
function socialLinksObjectToArray(obj: Record<string, any>) {
  return Object.entries(obj)
    .filter(([key, value]) => key.endsWith('Url') && !!value)
    .map(([key, url]) => ({
      type: key.replace(/Url$/, ''),
      url,
    }));
}
// import { db } from "./firebase";