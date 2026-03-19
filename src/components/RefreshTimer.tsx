import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { getFriendlyMessage } from '../utils/errorMessages';

interface RefreshTimerProps {
  onRefresh: () => Promise<any>;
}

const RefreshTimer: FC<RefreshTimerProps> = ({ onRefresh }) => {
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorStatus, setErrorStatus] = useState<{ code: string; status: number } | null>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleLocalRefresh();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleLocalRefresh = async () => {
    setIsRefreshing(true);
    setErrorStatus(null);
    try {
      if (onRefresh) await onRefresh();
      setTimeLeft(300);
    } catch (e: any) {
      // Map error to user-friendly message
      setErrorStatus({ code: e.code || 'UNKNOWN', status: e.status || 500 });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {errorStatus && (
          <span style={{ 
            color: 'white', 
            background: 'hsl(var(--error))', 
            fontSize: '0.7rem', 
            fontWeight: 600, 
            padding: '0.3rem 0.6rem', 
            borderRadius: '0.5rem',
            boxShadow: '0 4px 12px rgba(var(--error), 0.3)'
          }}>
            Status {errorStatus.status}: {getFriendlyMessage(errorStatus.code)}
          </span>
        )}
        
        <div className="glass" style={{ 
          padding: '0.5rem 1rem', 
          fontSize: '0.8rem', 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          minWidth: '100px',
          justifyContent: 'center'
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: 'hsl(var(--accent))',
            animation: 'pulse 2s infinite'
          }} />
          <span>{formatTime(timeLeft)}</span>
        </div>
        
        <button 
          onClick={handleLocalRefresh}
          disabled={isRefreshing}
          style={{ 
            background: isRefreshing ? 'rgba(255,255,255,0.05)' : 'hsl(var(--primary))',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '0.75rem',
            color: 'white',
            fontWeight: 600,
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease'
          }}
        >
          <svg 
             width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
             style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}
          >
            <path d="M23 4v6h-6M1.7 20a10 10 0 0 1 0-12A10 10 0 0 1 12 2a10 10 0 0 1 9.7 7" />
            <path d="M1 20v-6h6M22.3 4a10 10 0 0 1 0 12A10 10 0 0 1 12 22a10 10 0 0 1-9.7-7" />
          </svg>
          {isRefreshing ? 'Actualizando...' : 'Refrescar'}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RefreshTimer;
