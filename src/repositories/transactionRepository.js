// src/repositories/transactionRepository.js
import { getAllDocuments } from "../firebase/firestore.service.js";
import { fromFirestoreList } from "../adapters/transactionAdapter.js";

export async function fetchAllTransactions() {
  const docs = await getAllDocuments("transactions");
  return fromFirestoreList(docs);
}
