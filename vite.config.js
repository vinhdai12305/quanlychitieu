import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/quanlychitieu/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'src/page/login.html'),
        register: resolve(__dirname, 'src/page/register.html'),
        expense: resolve(__dirname, 'src/page/expense.html'),
        income: resolve(__dirname, 'src/page/income.html'),
        budget: resolve(__dirname, 'src/page/budget.html'),
        report: resolve(__dirname, 'src/page/report.html'),
        settings: resolve(__dirname, 'src/page/settings.html'),
      },
    },
  },
})
