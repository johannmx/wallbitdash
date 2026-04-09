export interface Expense {
  date: string;
  description: string;
  amount: string;
  currency: string;
  status: string;
}

export interface Transaction {
  uuid: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  date: string;
  description?: string;
}

export interface RecentExpensesData {
  title: string;
  subtitle: string;
  totalSpent: string;
  currency: string;
  transactions: Expense[];
}

export interface DashboardData {
  checking: { balance: string; currency: string };
  stocks: { balance: string; currency: string; assets: any[] };
  recentExpenses: RecentExpensesData;
  transactions: Transaction[];
  arsRate?: number;
  _cacheInfo?: { lastUpdated: string };
}
