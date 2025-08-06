import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCsIbR_8Y5tS8f46FpED60Wq08Lie4RAHQ",
    authDomain: "fitlook-79f7d.firebaseapp.com",
    projectId: "fitlook-79f7d",
    storageBucket: "fitlook-79f7d.firebasestorage.app",
    messagingSenderId: "625157786271",
    appId: "1:625157786271:web:caf9ef480ce91c624470aa"
};

// Firebase app'ı sadece bir kere initialize et
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

let auth;

try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
} catch (error) {
    if (error.code === 'auth/already-initialized') {
        auth = getAuth();
    } else {
        throw error;
    }
}

export { auth };
