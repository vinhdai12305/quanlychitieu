// src/adapters/transactionAdapter.js
import { Timestamp } from "firebase/firestore";

// Bộ định dạng tiền tệ Việt Nam (tạo 1 lần dùng nhiều lần cho tối ưu)
const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
});

/**
 * Helper: Chuyển đổi mọi định dạng ngày về chuỗi YYYY-MM-DD
 */
function normalizeDate(date) {
  if (!date) return new Date().toISOString().split("T")[0]; // Mặc định là hôm nay nếu thiếu

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
 * Helper: Chuyển chuỗi YYYY-MM-DD sang Firestore Timestamp
 */
function toTimestamp(dateString) {
  if (!dateString) return Timestamp.now(); // Mặc định là thời điểm hiện tại
  const date = new Date(dateString);
  // Kiểm tra nếu date không hợp lệ
  if (isNaN(date.getTime())) return Timestamp.now();
  return Timestamp.fromDate(date);
}

/**
 * ==========================================
 * READ: Firestore doc -> App model (UI)
 * ==========================================
 * Input: Object thô { id, ...data } lấy từ firestore.service.js
 */
export function fromFirestore(doc) {
  const amount = Number(doc.amount) || 0;

  return {
    id: doc.id,
    type: doc.type || "expense", // Mặc định là chi tiêu
    category: doc.category || "Khác",
    amount: amount,

    // Thêm trường này để UI hiển thị ngay, không cần format lại
    formattedAmount: currencyFormatter.format(amount),

    date: normalizeDate(doc.date),
    note: doc.note || "",

    // Giữ lại timestamp gốc nếu cần sort chính xác
    createdAt: doc.createdAt || null
  };
}

/**
 * ==========================================
 * WRITE: App model -> Firestore
 * ==========================================
 * Input: Object từ Form nhập liệu
 */
export function toFirestore(transaction) {
  // 1. Validate dữ liệu cơ bản
  const amount = Number(transaction.amount);
  if (isNaN(amount)) {
    throw new Error("Số tiền không hợp lệ!");
  }

  // 2. Trả về object sạch sẽ để lưu
  return {
    type: transaction.type || "expense",
    category: transaction.category || "General",
    amount: amount,
    date: toTimestamp(transaction.date), // Lưu dưới dạng Timestamp để query range ngày dễ hơn
    note: transaction.note || "",

    // Luôn cập nhật thời gian chỉnh sửa/tạo mới
    updatedAt: Timestamp.now()
  };
}

/**
 * List adapter: Chuyển đổi cả danh sách
 */
export function fromFirestoreList(docs = []) {
  return docs.map(fromFirestore);
}

function timestampToDateString(timestamp) {
  if (!timestamp || !timestamp.toDate) return "";
  return timestamp.toDate().toISOString().split("T")[0];
}

export function fromFirestore(doc) {
  return {
    id: doc.id,
    type: doc.type, // income | expense
    category: doc.category,
    amount: Number(doc.amount || 0),
    date: timestampToDateString(doc.date),
    note: doc.note || ""
  };
}

export function fromFirestoreList(docs = []) {
  return docs.map(fromFirestore);
}
