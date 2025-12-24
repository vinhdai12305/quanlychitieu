// src/services/chartData.service.js
import { fetchAllTransactions } from "../repositories/transactionRepository.js";
import {
  filterByMonth,
  getWeeklyCashflow
} from "./transactionAnalytics.service.js";

export async function getWeeklyCashflowData(year, month) {
  const transactions = await fetchAllTransactions();
  const filtered = filterByMonth(transactions, year, month);
  return getWeeklyCashflow(filtered);
}
