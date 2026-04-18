import type { FC } from 'react';
import { useState, useEffect } from 'react';

const CountUp: FC<{ end: number, duration?: number, showBalances: boolean }> = ({ end, duration = 1500, showBalances }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!showBalances) {
      setCount(0);
      return;
    }

    let startTimestamp: number | null = null;
    const initialValue = 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out expo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(easeProgress * (end - initialValue) + initialValue);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [end, duration, showBalances]);

  if (!showBalances) return <>••••••</>;
  return <>{count.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>;
};

interface BalanceCardsProps {
  checking: { balance: string; currency: string };
  stocks: { balance: string; currency: string };
  showBalances: boolean;
  arsRate: number;
}

const BalanceCards: FC<BalanceCardsProps> = ({ checking, stocks, showBalances, arsRate }) => {
  return (
    <>
      <div className="dashboard-grid" style={{ gap: 'var(--space-group)' }}>
        {/* Checking Balance (Hero Focus) */}
        <div className="glass stagger-2" style={{ 
          gridColumn: 'span 12', 
          padding: 'clamp(1.5rem, 5vw, 4.5rem)',
          background: 'linear-gradient(145deg, hsla(var(--primary), 0.15), hsla(var(--primary), 0.05))',
          border: '1px solid hsla(var(--primary), 0.3)',
          boxShadow: '0 32px 64px -16px hsla(var(--primary), 0.15)',
          overflow: 'hidden',
          position: 'relative',
          borderRadius: '1.5rem'
        }}>
          {/* Ambient Shimmer Effect */}
          <div style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
            animation: 'shimmer 4s infinite linear',
            pointerEvents: 'none'
          }} />

          {/* Subtle Decorative Gradient */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '60%',
            height: '140%',
            background: 'radial-gradient(circle, hsla(var(--primary), 0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ opacity: 0.3, fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>Available Capital</h3>
              <div style={{ color: 'hsl(var(--success))', fontSize: '0.9rem', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ position: 'relative', top: '1px' }}>↑</span> 2.4% <span style={{ opacity: 0.3, color: 'hsl(var(--foreground))', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.05em' }}>TRENDING</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'clamp(4rem, 10vw, 7rem)', fontWeight: 900, letterSpacing: '-0.06em', lineHeight: 0.9 }}>
                $<CountUp end={parseFloat(checking.balance)} showBalances={showBalances} />
              </span>
              <span style={{ fontSize: '1.25rem', opacity: 0.2, fontWeight: 800, letterSpacing: '0.1em' }}>{checking.currency}</span>
            </div>

            <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div className="ars-pill-hero">
                VALUE IN ARS <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{showBalances ? <CountUp end={parseFloat(checking.balance) * arsRate} duration={2000} showBalances={showBalances} /> : '••••'}</span>
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.3, fontWeight: 600 }}>LIQUID ASSETS • NO LOCKS</div>
            </div>
          </div>
        </div>

        {/* Stocks Balance (Secondary) */}
        <div className="glass stagger-3" style={{ 
          gridColumn: 'span 12', 
          padding: 'clamp(1.5rem, 5vw, 2.5rem)', 
          background: 'hsla(var(--foreground), 0.02)', 
          border: '1px solid var(--border)',
          borderRadius: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ opacity: 0.3, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>Investment Portfolio</h3>
            <div style={{ color: 'hsl(var(--success))', fontSize: '0.85rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ position: 'relative', top: '1px' }}>↑</span> 12.8%
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>
              {showBalances ? `$${stocks.balance}` : '••••••'}
            </span>
            <span style={{ opacity: 0.2, fontWeight: 700 }}>{stocks.currency}</span>
            <div className="ars-pill" style={{ marginLeft: 'auto', background: 'transparent', border: 'none', boxShadow: 'none' }}>
               <span style={{ opacity: 0.3, fontWeight: 800, fontSize: '0.65rem', marginRight: '0.5rem' }}>ARS EQ.</span>
               <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{showBalances ? (parseFloat(stocks.balance) * arsRate).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '••••'}</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .ars-pill {
          background: rgba(var(--glass-bg-rgb, 255, 255, 255), 0.05);
          padding: 0.3rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: hsl(var(--foreground));
          border: 1px solid rgba(59, 130, 246, 0.2);
          margin-left: auto;
          backdrop-filter: blur(8px);
          display: flex;
          gap: 0.3rem;
          align-items: center;
          box-shadow: 0 2px 10px -2px rgba(0,0,0,0.1);
        }
        .ars-pill span {
          color: hsl(var(--primary));
        }
        .ars-pill-hero {
          background: hsla(var(--primary), 0.1);
          padding: 0.6rem 1.25rem;
          border-radius: 1rem;
          font-size: 0.85rem;
          font-weight: 900;
          color: hsl(var(--foreground));
          border: 1px solid hsla(var(--primary), 0.2);
          display: flex;
          gap: 0.75rem;
          align-items: center;
          letter-spacing: 0.05em;
        }
        .ars-pill-hero span {
          color: hsl(var(--primary));
          font-size: 1.1rem;
        }
        @media (max-width: 640px) {
          .ars-pill { margin-left: 0; margin-top: 0.5rem; width: 100%; justify-content: center; }
          .ars-pill-hero { width: 100%; justify-content: center; }
        }
      `}</style>
    </>
  );
};

export default BalanceCards;
