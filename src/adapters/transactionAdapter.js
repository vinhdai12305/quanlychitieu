// src/adapters/transactionAdapter.js
import { Timestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Firestore Timestamp | Date | string -> YYYY-MM-DD
 */
function normalizeDate(date) {
  if (!date) return "";

  if (date instanceof Timestamp) {
    return date.toDate().toISOString().split("T")[0];
  }

  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }

  if (typeof date === "string") {
    return date;
  }

  return "";
}

/**
 * YYYY-MM-DD -> Firestore Timestamp
 */
function toTimestamp(dateString) {
  if (!dateString) return null;
  return Timestamp.fromDate(new Date(dateString));
}

/**
 * Firestore doc -> App model
 */
export function fromFirestore(doc) {
  return {
    id: doc.id,
    type: doc.type || "",
    category: doc.category || "",
    amount: Number(doc.amount || 0),
    date: normalizeDate(doc.date),
    note: doc.note || ""
  };
}

/**
 * App model -> Firestore
 */
export function toFirestore(transaction) {
  return {
    type: transaction.type,
    category: transaction.category,
    amount: Number(transaction.amount),
    date: toTimestamp(transaction.date),
    note: transaction.note || ""
  };
}

/**
 * List adapter
 */
export function fromFirestoreList(docs = []) {
  return docs.map(fromFirestore);
}
