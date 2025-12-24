import {
    collection,
    getDocs
  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
  import { db } from "./firebase.config.js";
  
  export async function getAllTransactions() {
    const snapshot = await getDocs(collection(db, "transactions"));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
  