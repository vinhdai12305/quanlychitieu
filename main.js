import { getAllTransactions } from './src/firebase/firestore.service.js';
import {
  getExpensePieData,
  getIncomeExpenseBarData,
  getWeeklyCashflowData
} from './src/services/chartData.service.js';

async function bootstrap() {
  const transactions = await getAllTransactions();

  const pieData = getExpensePieData(transactions);
  const barData = getIncomeExpenseBarData(transactions);
  const weeklyData = getWeeklyCashflowData(transactions);

  console.log('Pie:', pieData);
  console.log('Bar:', barData);
  console.log('Weekly:', weeklyData);

  // Người làm chart chỉ cần gọi:
  // renderPieChart(pieData)
  // renderBarChart(barData)
  // renderWeeklyChart(weeklyData)
}

bootstrap();
