import { useState, useEffect } from 'react';
import BalanceCards from './components/BalanceCards';
import TransactionList from './components/TransactionList';
import RecentExpenses from './components/RecentExpenses';
import RefreshTimer from './components/RefreshTimer';
import { wallbitData } from './data/mockData';

const API_URL = '/api/dashboard';

interface DashboardData {
  checking: { 
    balance: string; 
    currency: string; 
  };
  stocks: { 
    balance: string; 
    currency: string; 
    assets: { symbol: string; shares: string }[];
  };
  recentExpenses: {
    title: string;
    subtitle: string;
    totalSpent: string;
    currency: string;
    transactions: any[];
  };
  transactions: any[];
  _cacheInfo?: {
    lastUpdated: string;
    nextRefresh: string;
  };
}

// Initial state mapping from sanitized mockData
const initialState: DashboardData = {
  ...wallbitData as any,
  recentExpenses: {
    title: "Gastos últimos 30 días",
    subtitle: "Consumo total (USD)",
    totalSpent: "0.00",
    currency: "USD",
    transactions: []
  }
};

function App() {
  const [data, setData] = useState<DashboardData>(initialState);

  // Fetch initial data from cache server
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const res = await fetch(API_URL);
        if (res.ok) {
          const freshData = await res.json();
          setData(freshData);
        }
      } catch (e) {
        console.warn('⚠️ Cache server not running yet, using local mockData.');
      }
    };
    fetchInitial();
  }, []);

  const handleRefresh = async () => {
    try {
      const result = await fetch(API_URL);
      
      if (!result.ok) {
        const errorData = await result.json();
        throw { code: errorData.code, status: result.status };
      }

      const freshData = await result.json();
      setData({ ...freshData });
      return true;

    } catch (error: any) {
      console.error('Fetch Error:', error);
      throw error; 
    }
  };

  return (
    <main className="animate-in">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Hola, <span className="gradient-text">Johann</span>
          </h1>
          <p style={{ opacity: 0.6 }}>Bienvenido de vuelta a tu Wallbit Dashboard.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <RefreshTimer onRefresh={handleRefresh} />
          <div className="glass" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, background: 'hsl(var(--primary))' }}>
            JM
          </div>
        </div>
      </header>

      <BalanceCards checking={data.checking} stocks={data.stocks} />
      <RecentExpenses data={data.recentExpenses} />
      <TransactionList transactions={data.transactions} />

      <footer style={{ marginTop: '4rem', opacity: 0.3, textAlign: 'center', fontSize: '0.8rem' }}>
        <p>Wallbit Cache Middleware • Dockerized ✨</p>
        {data._cacheInfo && (
          <p style={{ fontSize: '0.7rem' }}>Cache actualizada: {new Date(data._cacheInfo.lastUpdated).toLocaleTimeString()}</p>
        )}
      </footer>
    </main>
  );
}

export default App;
