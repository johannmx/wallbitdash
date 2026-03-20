import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface RefreshTimerProps {
  onRefresh: () => Promise<any>;
}

const RefreshTimer: FC<RefreshTimerProps> = ({ onRefresh }) => {
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorStatus, setErrorStatus] = useState<{ code: string; status: number } | null>(null);

  const TOTAL_TIME = 300;
  const progress = ((TOTAL_TIME - timeLeft) / TOTAL_TIME) * 100;

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
    <div className="glass" style={{ 
      display: 'flex', 
      padding: '0.35rem', 
      borderRadius: '1.25rem', 
      alignItems: 'center', 
      gap: '1rem',
      minWidth: '280px'
    }}>
      {/* Visual Progress Bar Section (Integrated into the capsule) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingLeft: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <span>Sync</span>
          <span>{formatTime(timeLeft)}</span>
        </div>
        <div style={{ 
          height: '4px', 
          width: '100%', 
          borderRadius: '10px', 
          overflow: 'hidden', 
          background: 'hsla(var(--foreground), 0.05)',
        }}>
          <div style={{ 
            height: '100%', 
            width: `${progress}%`, 
            background: 'linear-gradient(90deg, hsl(var(--primary)), #818cf8)',
            borderRadius: '10px',
            transition: 'width 1s linear',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {errorStatus && (
          <div title={`Error ${errorStatus.status}`} style={{ color: '#ef4444', animation: 'pulse 2s infinite' }}>
            <AlertCircle size={16} />
          </div>
        )}
        
        <button 
          onClick={handleLocalRefresh}
          disabled={isRefreshing}
          className="theme-btn active"
          style={{ 
            width: 'auto',
            padding: '0 1rem',
            height: '38px',
            fontSize: '0.8rem',
            fontWeight: 700,
            gap: '0.5rem',
            borderRadius: '0.9rem',
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            boxShadow: isRefreshing ? 'none' : '0 4px 12px -2px hsla(var(--primary), 0.4)',
            transition: 'all 0.3s ease'
          }}
        >
          <RefreshCw size={14} strokeWidth={3} style={{ animation: isRefreshing ? 'spin 1.5s linear infinite' : 'none' }} />
          <span>{isRefreshing ? '...' : 'Refrescar'}</span>
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        @media (max-width: 640px) {
            .glass {
                min-width: 200px;
            }
        }
      `}</style>
    </div>
  );
};

export default RefreshTimer;
