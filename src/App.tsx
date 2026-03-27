import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Wallet, Eye, EyeOff } from 'lucide-react';
import BalanceCards from './components/BalanceCards';
import TransactionList from './components/TransactionList';
import RecentExpenses from './components/RecentExpenses';
import AnalyticsCards from './components/AnalyticsCards';
import RefreshTimer from './components/RefreshTimer';
import { wallbitData } from './data/mockData';

const API_URL = '/api/dashboard';
const BUILD_TOKEN = import.meta.env.VITE_DASHBOARD_TOKEN || '';

const getHeaders = () => {
  const token = localStorage.getItem('dashboard_token') || BUILD_TOKEN;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'X-Dashboard-Token': token } : {})
  };
};

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
  const [showBalances, setShowBalances] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [tokenInput, setTokenInput] = useState('');

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
  const fetchDashboard = async () => {
    try {
      const res = await fetch(API_URL, { headers: getHeaders() });
      if (res.status === 401) {
        setIsLocked(true);
        return;
      }
      if (res.ok) {
        const freshData = await res.json();
        setData(freshData);
        setIsLocked(false);
      }
    } catch (e) {
      console.warn('⚠️ Cache server not running yet, using local mockData.');
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem('dashboard_token', tokenInput.trim());
      setIsLocked(false);
      fetchDashboard();
    }
  };

  const handleRefresh = async () => {
    try {
      const res = await fetch(API_URL, { headers: getHeaders() });
      if (res.status === 401) {
        setIsLocked(true);
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Refresh failed');
      const freshData = await res.json();
      setData({ ...freshData });
      return true;
    } catch (error) {
      console.error('Refresh Error:', error);
      throw error; 
    }
  };

  if (isLocked) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div className="glass animate-in" style={{ 
          maxWidth: '400px', 
          width: '100%', 
          padding: '3rem', 
          textAlign: 'center',
          borderRadius: '2rem'
        }}>
          <div className="gradient-text" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🔒</div>
          <h2 style={{ marginBottom: '1rem' }}>Backend Protegido</h2>
          <p style={{ opacity: 0.6, marginBottom: '2rem', fontSize: '0.9rem' }}>
            Este dashboard está configurado con seguridad. Por favor ingresa tu <b>DASHBOARD_TOKEN</b> para continuar.
          </p>
          <input 
            type="password" 
            placeholder="Ingresa tu token aquí..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveToken()}
            className="glass"
            style={{ 
              width: '100%', 
              padding: '1rem 1.5rem', 
              borderRadius: '1rem', 
              border: '1px solid hsla(var(--foreground), 0.1)',
              background: 'hsla(var(--foreground), 0.03)',
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontSize: '1rem'
            }}
          />
          <button 
            onClick={handleSaveToken}
            className="glass"
            style={{ 
              width: '100%', 
              padding: '1rem', 
              borderRadius: '1.25rem', 
              background: 'hsl(var(--primary))', 
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 10px 20px -5px hsla(var(--primary), 0.4)'
            }}
          >
            Desbloquear Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="animate-in" style={{ padding: 'max(1.5rem, 3vw)', maxWidth: '1440px', margin: '0 auto' }}>
      <header className="header-content" style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
        <div style={{ flex: '1 1 auto', minWidth: '240px' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '0.5rem', fontWeight: 900 }}>
            Hola, <span className="gradient-text">Johann</span>
          </h1>
          <p style={{ opacity: 0.5, fontSize: '1rem', fontWeight: 500 }}>wallbit personal dashboard</p>
        </div>
        
        <div className="header-actions" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {/* Balance Visibility Toggle */}
          <div className="glass" style={{ display: 'flex', padding: '0.3rem', borderRadius: '1rem' }}>
            <button 
              onClick={() => setShowBalances(!showBalances)}
              className="theme-btn"
              style={{ 
                opacity: showBalances ? 0.5 : 1,
                background: showBalances ? 'transparent' : 'hsl(var(--primary))',
                color: showBalances ? 'inherit' : 'white',
                boxShadow: showBalances ? 'none' : '0 4px 15px -3px hsla(var(--primary), 0.5)'
              }}
              title={showBalances ? "Ocultar saldos" : "Mostrar saldos"}
            >
              {showBalances ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="glass" style={{ display: 'flex', padding: '0.3rem', borderRadius: '1rem', gap: '0.3rem' }}>
            <button 
              onClick={() => setTheme('light')}
              className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
            >
              <Sun size={18} />
            </button>
            <button 
              onClick={() => setTheme('system')}
              className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
            >
              <Monitor size={18} />
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
            >
              <Moon size={18} />
            </button>
          </div>

          <RefreshTimer onRefresh={handleRefresh} />
          
          <div className="glass logo-container" style={{ 
            width: '56px', 
            height: '56px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            overflow: 'hidden',
            color: 'hsl(var(--primary))',
            flexShrink: 0
          }}>
            <Wallet size={32} strokeWidth={2.5} />
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <BalanceCards checking={data.checking} stocks={data.stocks} showBalances={showBalances} arsRate={data.arsRate || 1000} />
        <RecentExpenses data={data.recentExpenses} arsRate={data.arsRate || 1000} />
        <AnalyticsCards transactions={data.transactions} arsRate={data.arsRate || 1000} />
        <TransactionList transactions={data.transactions} />
      </div>

      <footer style={{ marginTop: '6rem', opacity: 0.3, textAlign: 'center', fontSize: '0.85rem', paddingBottom: '3rem' }}>
        <p>Wallbit Dashboard v2.0 • Designed with Persistence ✨</p>
        {data._cacheInfo && (
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Última sincronización: {new Date(data._cacheInfo.lastUpdated).toLocaleTimeString()}</p>
        )}
      </footer>

      <style>{`
        .theme-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.75rem;
          border: none;
          background: transparent;
          cursor: pointer;
          color: hsl(var(--foreground));
          opacity: 0.5;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .theme-btn:hover {
          opacity: 1;
          background: hsla(255, 255, 255, 0.05);
        }
        .theme-btn.active {
          opacity: 1;
          background: hsl(var(--primary));
          color: white;
          box-shadow: 0 4px 15px -3px hsla(var(--primary), 0.5);
        }
      `}</style>
    </main>
  );
}

export default App;
