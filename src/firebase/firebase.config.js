// 1. Chỉ import những thứ cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. Cấu hình Firebase (Giữ nguyên thông tin của bạn)
const firebaseConfig = {
  apiKey: "AIzaSyDiDIFKqm5e_g7MrUMWGTcTvjOtoNhj2GA",
  authDomain: "quanlichitieu-c30b4.firebaseapp.com",
  projectId: "quanlichitieu-c30b4",
  storageBucket: "quanlichitieu-c30b4.firebasestorage.app",
  messagingSenderId: "385297935024",
  appId: "1:385297935024:web:26a01ca43a3d6cbc3de975",
  measurementId: "G-7MQX3Z2ZWL"
};

// 3. Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// 4. Khởi tạo Firestore và EXPORT để các file khác (như firestore.service.js) có thể dùng
export const db = getFirestore(app);