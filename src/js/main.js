// src/js/main.js
import { loadHeader } from './headerLoader.js';
import { initAuthGuard } from '../firebase/authGuard.js';
import { analytics } from '../firebase/firebase.config.js';

document.addEventListener("DOMContentLoaded", () => {
  loadHeader("./src/components/header.html");
  initAuthGuard();
});

console.log("Vite is running");
