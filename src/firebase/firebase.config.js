// firebase.config.js - Using CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDiDIFKqm5e_g7MrUMWGTcTvjOtoNhj2GA",
  authDomain: "quanlichitieu-c30b4.firebaseapp.com",
  databaseURL: "https://quanlichitieu-c30b4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "quanlichitieu-c30b4",
  storageBucket: "quanlichitieu-c30b4.firebasestorage.app",
  messagingSenderId: "385297935024",
  appId: "1:385297935024:web:26a01ca43a3d6cbc3de975",
  measurementId: "G-7MQX3Z2ZWL"
};

// Khởi tạo Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
