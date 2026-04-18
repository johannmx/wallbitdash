import { FC } from 'react';
import { CountUp } from './CountUp';
import { TrendingUp, Wallet, PieChart, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface BalanceCardsProps {
  checking: {
    balance: string;
    currency: string;
  };
  stocks: {
    balance: string;
    currency: string;
  };
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '8px', 
                background: 'hsla(var(--primary), 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'hsl(var(--primary))'
              }}>
                <PieChart size={18} />
              </div>
              <h3 style={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Investment Portfolio</h3>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.4 }}>STOCKS & ETFS</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.04em' }}>
              $<CountUp end={parseFloat(stocks.balance)} showBalances={showBalances} />
            </span>
            <span style={{ fontSize: '1rem', opacity: 0.2, fontWeight: 700 }}>{stocks.currency}</span>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.8rem', 
              fontWeight: 700,
              color: 'hsl(var(--success))',
              background: 'hsla(var(--success), 0.1)',
              padding: '0.4rem 0.8rem',
              borderRadius: '8px'
            }}>
              <TrendingUp size={14} />
              +12.5% TOTAL
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.3, fontWeight: 600 }}>DIVERSIFIED RISK</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 'var(--space-group)', gap: 'var(--space-group)' }}>
        {/* Quick Actions / Indicators */}
        <div className="glass stagger-3 hover-card" style={{ 
          gridColumn: 'span 12', 
          padding: '1.5rem', 
          borderRadius: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'hsla(45, 100%, 50%, 0.1)', color: 'hsl(45, 100%, 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpRight size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase' }}>Incoming Deposit</div>
            <div style={{ fontWeight: 700 }}>$1,250.00 <span style={{ opacity: 0.3, fontSize: '0.8rem' }}>PENDING</span></div>
          </div>
        </div>

        <div className="glass stagger-3 hover-card" style={{ 
          gridColumn: 'span 12', 
          padding: '1.5rem', 
          borderRadius: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowDownRight size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase' }}>Monthly Yield</div>
            <div style={{ fontWeight: 700 }}>+$42.31 <span style={{ opacity: 0.3, fontSize: '0.8rem' }}>ESTIMATED</span></div>
          </div>
        </div>
      </div>
    </>
  );
};

export { BalanceCards };
