// This file is a template for the dashboard data structure.
// In production, the data is fetched dynamically by the backend cache server.

export const wallbitData = {
  checking: { balance: "0.00", currency: "USD" },
  stocks: { balance: "0.00", currency: "USD", assets: [] },
  brazilTrip: {
    title: "Gastos último Viaje",
    subtitle: "Viaje (Ejemplo)",
    dateRange: "DD/MM/YYYY - DD/MM/YYYY",
    totalSpent: "0.00",
    currency: "USD",
    transactions: []
  },
  transactions: []
};
