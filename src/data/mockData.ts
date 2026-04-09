// This file is a template for the dashboard data structure.
// In production, the data is fetched dynamically by the backend cache server.
import { DashboardData } from '../types/dashboard';

export const wallbitData: DashboardData = {
  checking: { balance: "0.00", currency: "USD" },
  stocks: { balance: "0.00", currency: "USD", assets: [] },
  recentExpenses: {
    title: "Gastos últimos 7 días",
    subtitle: "Consumo total (USD)",
    totalSpent: "0.00",
    currency: "USD",
    transactions: []
  },
  transactions: []
};
