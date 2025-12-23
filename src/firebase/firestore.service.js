// src/firebase/firestore.service.js
import { db } from "./firebase.config.js";
import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  toFirestore,
  fromFirestoreList
} from "../adapters/transactionAdapter.js";

const COLLECTION = "transactions";

/**
 * CREATE
 */
export async function addTransaction(transaction) {
  await addDoc(collection(db, COLLECTION), toFirestore(transaction));
}

/**
 * READ ALL (KHÔNG orderBy để lấy toàn bộ data cũ)
 */
export async function getAllTransactions() {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return fromFirestoreList(docs);
}
