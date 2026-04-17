import { useState, useEffect } from 'react';
import { Sun, Moon, Wallet, Eye, EyeOff } from 'lucide-react';
import BalanceCards from './components/BalanceCards';
import TransactionList from './components/TransactionList';
import RecentExpenses from './components/RecentExpenses';
import AnalyticsCards from './components/AnalyticsCards';
import RefreshTimer from './components/RefreshTimer';

import { wallbitData } from './data/mockData';
import type { DashboardData } from './types/dashboard';

const API_URL = '/api/dashboard';

const getHeaders = () => {
  // Prevent relying on build-time env vars for backend secrets
  // 🛡️ Sentinel: Use sessionStorage for sensitive auth tokens so they are cleared when the browser session ends
  const token = sessionStorage.getItem('dashboard_token') || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'X-Dashboard-Token': token } : {})
  };
};

type Theme = 'light' | 'dark' | 'system';

const initialState: DashboardData = {
  ...wallbitData,
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
      // 🛡️ Sentinel: Store sensitive token in sessionStorage instead of localStorage
      sessionStorage.setItem('dashboard_token', tokenInput.trim());
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
    <main className="animate-in" style={{ padding: 'max(1.5rem, 4vw)', maxWidth: '1440px', margin: '0 auto' }}>
      <header className="header-content stagger-1" style={{ marginBottom: 'var(--space-section)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
        <div style={{ flex: '1 1 auto', minWidth: '240px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="glass" style={{ 
            width: '64px', 
            height: '64px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'hsl(var(--primary))',
            flexShrink: 0,
            borderRadius: '1.25rem',
            border: '2px solid hsla(var(--primary), 0.2)',
            boxShadow: '0 0 30px -5px hsla(var(--primary), 0.3)'
          }}>
            <Wallet size={36} strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', margin: 0, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em' }}>
              Hola, <span className="gradient-text">Johann</span>
            </h1>
            <p style={{ opacity: 0.3, fontSize: '0.8rem', fontWeight: 800, marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>wallbit personal dashboard</p>
          </div>
        </div>
        
        <div className="glass header-actions" style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          alignItems: 'center', 
          padding: '0.5rem 0.75rem', 
          borderRadius: '1.25rem',
          flexShrink: 0
        }}>
          {/* Action Group */}
          <div style={{ display: 'flex', gap: '0.25rem', paddingRight: '0.75rem', borderRight: '1px solid var(--border)' }}>
            <button 
              onClick={() => setShowBalances(!showBalances)}
              className="theme-btn"
              style={{ 
                opacity: showBalances ? 0.4 : 1,
                background: showBalances ? 'transparent' : 'hsl(var(--primary))',
                color: showBalances ? 'inherit' : 'white',
              }}
              title={showBalances ? "Ocultar saldos" : "Mostrar saldos"}
            >
              {showBalances ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="theme-btn"
              title="Cambiar tema"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <RefreshTimer onRefresh={handleRefresh} />
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <div className="stagger-2" style={{ marginBottom: 'var(--space-section)' }}>
          <BalanceCards checking={data.checking} stocks={data.stocks} showBalances={showBalances} arsRate={data.arsRate || 1000} />
        </div>
        <div className="stagger-3" style={{ marginBottom: 'var(--space-section)' }}>
          <RecentExpenses data={data.recentExpenses} arsRate={data.arsRate || 1000} />
        </div>
        <div className="stagger-4" style={{ marginBottom: 'var(--space-section)' }}>
          <AnalyticsCards transactions={data.transactions} arsRate={data.arsRate || 1000} />
        </div>
        <div className="stagger-5">
          <TransactionList transactions={data.transactions} />
        </div>
      </div>

      <footer style={{ marginTop: '6rem', opacity: 0.2, textAlign: 'center', fontSize: '0.75rem', paddingBottom: '3rem' }}>
        <p>Wallbit Dashboard • {new Date().getFullYear()}</p>
        {data._cacheInfo && (
          <p style={{ marginTop: '0.25rem' }}>Full Sync: {new Date(data._cacheInfo.lastUpdated).toLocaleTimeString()}</p>
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
