// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBimWRCY4lE6B-mhBQsRzUeelGYuWQzWM4",
    authDomain: "nyang-log.firebaseapp.com",
    projectId: "nyang-log",
    storageBucket: "nyang-log.firebasestorage.app",
    messagingSenderId: "673198103347",
    appId: "1:673198103347:web:98bbc46f332f214645bc46",
    measurementId: "G-QJT19V2K6T"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
