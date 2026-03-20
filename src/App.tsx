import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import BalanceCards from './components/BalanceCards';
import TransactionList from './components/TransactionList';
import RecentExpenses from './components/RecentExpenses';
import AnalyticsCards from './components/AnalyticsCards';
import RefreshTimer from './components/RefreshTimer';
import { wallbitData } from './data/mockData';

const API_URL = '/api/dashboard';

interface DashboardData {
  checking: { balance: string; currency: string };
  stocks: { balance: string; currency: string; assets: any[] };
  recentExpenses: {
    title: string;
    subtitle: string;
    totalSpent: string;
    currency: string;
    transactions: any[];
  };
  transactions: any[];
  arsRate?: number;
  _cacheInfo?: { lastUpdated: string };
}

type Theme = 'light' | 'dark' | 'system';

const initialState: DashboardData = {
  ...wallbitData as any,
  recentExpenses: {
    title: "Gastos últimos 7 días",
    subtitle: "Consumo total (USD)",
    totalSpent: "0.00",
    currency: "USD",
    transactions: []
  }
};

function App() {
  const [data, setData] = useState<DashboardData>(initialState);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');

  // Theme effect
  useEffect(() => {
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const activeTheme = theme === 'system' ? systemTheme : theme;
    
    root.setAttribute('data-theme', activeTheme);
    localStorage.setItem('theme', theme);

    // Listen for system changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => root.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Data fetch
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
      if (!result.ok) throw new Error('Refresh failed');
      const freshData = await result.json();
      setData({ ...freshData });
      return true;
    } catch (error) {
      console.error('Refresh Error:', error);
      throw error; 
    }
  };

  return (
    <main className="animate-in" style={{ padding: 'max(1rem, 2vw)', maxWidth: '1400px', margin: '0 auto' }}>
      <header className="header-content" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', marginBottom: '0.25rem' }}>
            Hola, <span className="gradient-text">Johann</span>
          </h1>
          <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Análisis de finanzas personales en tiempo real.</p>
        </div>
        
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'nowrap' }}>
          {/* Theme Toggle */}
          <div className="glass" style={{ display: 'flex', padding: '0.2rem', borderRadius: '0.8rem', gap: '0.2rem' }}>
            <button 
              onClick={() => setTheme('light')}
              className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
            >
              <Sun size={16} />
            </button>
            <button 
              onClick={() => setTheme('system')}
              className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
            >
              <Monitor size={16} />
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
            >
              <Moon size={16} />
            </button>
          </div>

          <RefreshTimer onRefresh={handleRefresh} />
          
          <div className="glass brand-logo" style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, background: 'hsl(var(--primary))', color: 'white', borderRadius: '12px', flexShrink: 0 }}>
            JM
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <BalanceCards checking={data.checking} stocks={data.stocks} />
        <RecentExpenses data={data.recentExpenses} />
        <AnalyticsCards transactions={data.transactions} arsRate={data.arsRate || 1000} />
        <TransactionList transactions={data.transactions} />
      </div>

      <footer style={{ marginTop: '4rem', opacity: 0.3, textAlign: 'center', fontSize: '0.8rem', paddingBottom: '2rem' }}>
        <p>Wallbit Cache Middleware • Theme Support ✨</p>
        {data._cacheInfo && (
          <p style={{ fontSize: '0.7rem' }}>Cache actualizada: {new Date(data._cacheInfo.lastUpdated).toLocaleTimeString()}</p>
        )}
      </footer>

      <style>{`
        .theme-btn {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.6rem;
          border: none;
          background: transparent;
          cursor: pointer;
          color: hsl(var(--foreground));
          opacity: 0.5;
          transition: all 0.2s ease;
        }
        .theme-btn:hover {
          opacity: 1;
          background: rgba(255,255,255,0.05);
        }
        .theme-btn.active {
          opacity: 1;
          background: hsl(var(--primary));
          color: white;
          box-shadow: 0 4px 12px hsla(var(--primary), 0.3);
        }
        .gradient-text {
          background: linear-gradient(135deg, hsl(var(--primary)), #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </main>
  );
}

export default App;
