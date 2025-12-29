// auth.js - Using CDN
import { auth } from './firebase.config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// ==========================================
// 1. ĐĂNG KÝ
// ==========================================
import { updateUserProfile } from './firestore.service.js';

export async function register(email, password, username, extraData = {}) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    localStorage.setItem('userName', username);

    // Tạo user profile trong Firestore
    await updateUserProfile({
      username: username,
      email: email,
      ...extraData
    });

    return { success: true, user: user };
  } catch (error) {
    let message = 'Đăng ký thất bại!';
    if (error.code === 'auth/email-already-in-use') {
      message = 'Email đã được sử dụng!';
    }
    return { success: false, error: message };
  }
}

// ==========================================
// 2. ĐĂNG NHẬP
// ==========================================
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    let message = 'Đăng nhập thất bại!';
    if (error.code === 'auth/invalid-credential') {
      message = 'Email hoặc mật khẩu không đúng!';
    }
    return { success: false, error: message };
  }
}

// ==========================================
// 3. ĐĂNG XUẤT
// ==========================================
export async function logout() {
  try {
    console.log('Đang đăng xuất...');

    // Đăng xuất Firebase
    await signOut(auth);

    // Xóa localStorage
    localStorage.clear();

    console.log('✅ Đã đăng xuất Firebase');

    // Redirect về login
    const isPagesDir = window.location.pathname.includes('/src/page/');
    const loginPath = isPagesDir ? 'login.html' : './src/page/login.html';
    window.location.href = loginPath;

    // Backup
    setTimeout(() => {
      window.location.replace(loginPath);
    }, 500);

  } catch (error) {
    console.error('❌ Lỗi đăng xuất:', error);
    // Try reliable path
    window.location.href = './src/page/login.html';
  }
}

// ==========================================
// 4. KIỂM TRA TRẠNG THÁI
// ==========================================
export function checkAuth(redirectToLogin = true) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ User logged in:', user.email);
        resolve(user);
      } else {
        console.log('⚠️ No user logged in');
        if (redirectToLogin) {
          const isPagesDir = window.location.pathname.includes('/src/page/');
          const loginPath = isPagesDir ? 'login.html' : './src/page/login.html';

          // Handle GitHub Pages subpath if needed
          // But relative path ./src/page/login.html from root should work
          window.location.href = loginPath;
        }
        resolve(null);
      }
    });
  });
}

// ==========================================
// 5. LẤY USER HIỆN TẠI
// ==========================================
export function getCurrentUser() {
  return auth.currentUser;
}
