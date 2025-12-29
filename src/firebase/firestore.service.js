// firestore.service.js - Using CDN - Updated for correct data structure
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

import { db, auth } from "./firebase.config.js";

// Helper: Chuyển Timestamp sang string YYYY-MM-DD
function timestampToDateString(timestamp) {
  if (!timestamp) return '';
  // Nếu là Firestore Timestamp
  if (timestamp.toDate) {
    const date = timestamp.toDate();
    return date.toISOString().split('T')[0];
  }
  // Nếu đã là Date object
  if (timestamp instanceof Date) {
    return timestamp.toISOString().split('T')[0];
  }
  // Nếu đã là string
  return timestamp;
}

// Helper: Chuyển string sang Timestamp
function dateStringToTimestamp(dateString) {
  if (!dateString) return Timestamp.now();
  const date = new Date(dateString);
  return Timestamp.fromDate(date);
}

// ==========================================
// 1. LẤY TẤT CẢ DOCUMENTS (Không filter user)
// ==========================================
export async function getAllDocuments(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// ==========================================
// 2. LẤY DOCUMENTS CỦA USER HIỆN TẠI
// ==========================================
export async function getUserDocuments(collectionName) {
  const user = auth.currentUser;
  if (!user) throw new Error("Chưa đăng nhập!");

  const q = query(
    collection(db, collectionName),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// ==========================================
// 3. LẤY TRANSACTIONS THEO THÁNG (UPDATED)
// ==========================================
export async function getTransactionsByMonth(month, year) {
  const user = auth.currentUser;
  if (!user) throw new Error("Chưa đăng nhập!");

  // Tạo Timestamp cho đầu tháng và cuối tháng
  const startDate = new Date(year, month - 1, 1); // month is 0-indexed
  const endDate = new Date(year, month, 1); // Đầu tháng sau

  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(endDate);

  console.log(`🔍 Querying transactions from ${startDate.toISOString()} to ${endDate.toISOString()}`);

  const q = query(
    collection(db, "transactions"),
    where("userId", "==", user.uid),
    where("date", ">=", startTimestamp),
    where("date", "<", endTimestamp),
    orderBy("date", "desc")
  );

  const snapshot = await getDocs(q);

  // Map và chuyển đổi date từ Timestamp sang string
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      type: data.type,
      category: data.category,
      amount: data.amount,
      note: data.description || '', // Map description -> note cho UI
      date: timestampToDateString(data.date),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  });
}

// ==========================================
// 4. REALTIME LISTENER - Lắng nghe thay đổi (UPDATED)
// ==========================================
export function listenToUserTransactions(callback, filterType = null) {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return;
  }

  let q = query(
    collection(db, "transactions"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  // Filter theo type (income/expense)
  if (filterType) {
    q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      where("type", "==", filterType),
      orderBy("createdAt", "desc")
    );
  }

  // Return unsubscribe function
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type,
        category: data.category,
        amount: data.amount,
        note: data.description || '',
        date: timestampToDateString(data.date),
        budgetId: data.budgetId || null,
        budgetName: data.budgetName || null,
        createdAt: data.createdAt
      };
    });
    callback(transactions);
  });
}

// Lắng nghe realtime transactions theo tháng (cho budget page)
export function listenToUserTransactionsForMonth(callback, month, year) {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => { };
  }

  // Tính ngày đầu và cuối tháng
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const q = query(
    collection(db, "transactions"),
    where("userId", "==", user.uid),
    where("date", ">=", Timestamp.fromDate(startDate)),
    where("date", "<=", Timestamp.fromDate(endDate)),
    orderBy("date", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type,
        category: data.category,
        amount: data.amount,
        note: data.description || '',
        date: timestampToDateString(data.date),
        budgetId: data.budgetId || null,
        budgetName: data.budgetName || null,
        createdAt: data.createdAt
      };
    });
    callback(transactions);
  });
}

// ==========================================
// 5. THÊM TRANSACTION (UPDATED)
// ==========================================
export async function addTransaction(data) {
  const user = auth.currentUser;
  if (!user) throw new Error("Chưa đăng nhập!");

  try {
    const now = Timestamp.now();
    const transactionDoc = {
      userId: user.uid,
      type: data.type,           // 'income' hoặc 'expense'
      amount: parseFloat(data.amount),
      category: data.category,
      description: data.note || data.description || '', // Sử dụng description
      date: dateStringToTimestamp(data.date), // Chuyển sang Timestamp
      createdAt: now,
      updatedAt: now
    };

    // Thêm budgetId và budgetName nếu có (chỉ cho expense)
    if (data.budgetId) {
      transactionDoc.budgetId = data.budgetId;
      if (data.budgetName) {
        transactionDoc.budgetName = data.budgetName;
      }
    }

    const docRef = await addDoc(collection(db, "transactions"), transactionDoc);
    console.log("✅ Transaction saved with budgetId:", data.budgetId || "none");
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Add transaction error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 6. XÓA DOCUMENT
// ==========================================
export async function deleteDocument(collectionName, docId) {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// 7. CẬP NHẬT DOCUMENT (với xử lý date)
// ==========================================
export async function updateDocument(collectionName, docId, data) {
  try {
    // Nếu có date field, chuyển sang Timestamp
    const updateData = { ...data };

    if (updateData.date && typeof updateData.date === 'string') {
      updateData.date = dateStringToTimestamp(updateData.date);
    }

    await updateDoc(doc(db, collectionName, docId), {
      ...updateData,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Update error:', error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 8. THỐNG KÊ THÁNG (Cho Dashboard)
// ==========================================
export async function getMonthlyStats(month, year) {
  const transactions = await getTransactionsByMonth(month, year);

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIncome: income,
    totalExpense: expense,
    balance: income - expense,
    transactions
  };
}

// ==========================================
// 9. BUDGET MANAGEMENT
// ==========================================

// Lắng nghe realtime budgets của user (theo tháng/năm)
export function listenToUserBudgets(callback, month, year) {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => { };
  }

  // Nếu không truyền month/year thì lấy tháng hiện tại
  const today = new Date();
  const targetMonth = month || (today.getMonth() + 1);
  const targetYear = year || today.getFullYear();

  const q = query(
    collection(db, "budgets"),
    where("userId", "==", user.uid),
    where("month", "==", targetMonth),
    where("year", "==", targetYear),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const budgets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(budgets);
  });
}

// Lấy budgets của user 1 lần (không realtime) - dùng cho dropdown
export async function getUserBudgetsOnce(month, year) {
  const user = auth.currentUser;
  if (!user) return [];

  // Nếu không truyền month/year thì lấy tháng hiện tại
  const today = new Date();
  const targetMonth = month || (today.getMonth() + 1);
  const targetYear = year || today.getFullYear();

  try {
    const q = query(
      collection(db, "budgets"),
      where("userId", "==", user.uid),
      where("month", "==", targetMonth),
      where("year", "==", targetYear),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting budgets:", error);
    return [];
  }
}

// Tính toán spent cho một budget từ transactions
export async function calculateBudgetSpent(category, month, year) {
  const transactions = await getTransactionsByMonth(month, year);

  // Lọc expenses theo category và tính tổng
  const spent = transactions
    .filter(t => t.type === 'expense' && t.category === category)
    .reduce((sum, t) => sum + t.amount, 0);

  return spent;
}

// Cập nhật spent cho tất cả budgets của tháng
export async function updateAllBudgetsSpent(month, year) {
  const user = auth.currentUser;
  if (!user) return;

  const today = new Date();
  const targetMonth = month || (today.getMonth() + 1);
  const targetYear = year || today.getFullYear();

  // Lấy transactions của tháng
  const transactions = await getTransactionsByMonth(targetMonth, targetYear);

  // Tính spent theo từng category
  const spentByCategory = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      if (!spentByCategory[t.category]) {
        spentByCategory[t.category] = 0;
      }
      spentByCategory[t.category] += t.amount;
    });

  // Lấy budgets của tháng
  const budgetsQuery = query(
    collection(db, "budgets"),
    where("userId", "==", user.uid),
    where("month", "==", targetMonth),
    where("year", "==", targetYear)
  );

  const snapshot = await getDocs(budgetsQuery);

  // Cập nhật spent cho từng budget
  const updates = snapshot.docs.map(async (budgetDoc) => {
    const data = budgetDoc.data();
    const newSpent = spentByCategory[data.category] || 0;

    if (data.spent !== newSpent) {
      await updateDoc(doc(db, "budgets", budgetDoc.id), {
        spent: newSpent,
        updatedAt: Timestamp.now()
      });
    }
  });

  await Promise.all(updates);
  console.log(`✅ Updated spent for ${snapshot.docs.length} budgets`);
}

// Thêm budget mới (với month/year)
export async function addBudget(data) {
  const user = auth.currentUser;
  if (!user) throw new Error("Chưa đăng nhập!");

  try {
    const now = Timestamp.now();
    const today = new Date();

    const docRef = await addDoc(collection(db, "budgets"), {
      userId: user.uid,
      name: data.name,
      category: data.category || data.name, // Category để link với transactions
      icon: data.icon || 'category',
      limit: parseFloat(data.limit),
      spent: 0, // Sẽ được tính toán tự động
      month: data.month || (today.getMonth() + 1),
      year: data.year || today.getFullYear(),
      createdAt: now,
      updatedAt: now
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Add budget error:", error);
    return { success: false, error: error.message };
  }
}

// Cập nhật budget (spent amount)
export async function updateBudgetSpent(budgetId, newSpent) {
  try {
    await updateDoc(doc(db, "budgets", budgetId), {
      spent: parseFloat(newSpent),
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// USER PROFILE
// ==========================================

// Lấy thông tin user profile (query by userId field)
export async function getUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    // Query by userId field instead of document ID
    const q = query(collection(db, "users"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      // Return default data if profile doesn't exist
      return {
        id: null, // No document yet
        userId: user.uid,
        email: user.email,
        username: user.displayName || '',
        phone: '',
        dateOfBirth: '',
        avatarUrl: user.photoURL || ''
      };
    }
  } catch (error) {
    console.error("Get user profile error:", error);
    return null;
  }
}

// Cập nhật user profile (find by userId, then update)
export async function updateUserProfile(data) {
  const user = auth.currentUser;
  if (!user) return { success: false, error: 'Not authenticated' };

  try {
    // Find existing document by userId
    const q = query(collection(db, "users"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Update existing document
      const docId = snapshot.docs[0].id;
      await updateDoc(doc(db, "users", docId), {
        ...data,
        updatedAt: Timestamp.now()
      });
      console.log("Updated existing profile:", docId);
    } else {
      // Create new document with userId field
      await addDoc(collection(db, "users"), {
        ...data,
        userId: user.uid,
        email: user.email,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log("Created new profile for user:", user.uid);
    }

    return { success: true };
  } catch (error) {
    console.error("Update user profile error:", error);
    return { success: false, error: error.message };
  }
}
