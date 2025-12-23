import { getAllTransactions, addTransaction } from "../firebase/firestore.service.js";
import { fromFirestoreList, toFirestore } from "../adapters/transactionAdapter.js";

// Lấy danh sách giao dịch cho chart
export async function fetchTransactions() {
  const firestoreDocs = await getAllTransactions();
  return fromFirestoreList(firestoreDocs);
}

// Thêm giao dịch (sau này form UI dùng)
export async function createTransaction(transaction) {
  const firestoreData = toFirestore(transaction);
  return addTransaction(firestoreData);
}
