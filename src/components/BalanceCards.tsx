import type { FC } from 'react';

interface BalanceCardsProps {
  checking: { balance: string; currency: string };
  stocks: { balance: string; currency: string };
  showBalances: boolean;
  arsRate: number;
}

const BalanceCards: FC<BalanceCardsProps> = ({ checking, stocks, showBalances, arsRate }) => {
  return (
    <>
      <div className="dashboard-grid animate-in stagger-1">
        {/* Checking Balance */}
        <div className="glass stagger-2" style={{ gridColumn: 'span 6', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ opacity: 0.6, fontSize: '0.9rem', margin: 0 }}>Checking Account</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 700 }} className="gradient-text">
              {showBalances ? `$${checking.balance}` : '••••••'}
            </span>
            <span style={{ opacity: 0.6 }}>{checking.currency}</span>
          </div>
          <div style={{ marginTop: '1rem', color: '#4ade80', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.2rem', flexWrap: 'wrap' }}>
            <span>↑ 2.4%</span>
            <span style={{ opacity: 0.6, color: 'hsl(var(--foreground))' }}>this month</span>
            <div className="ars-pill">
              Aprox. ARS <span>{showBalances ? (parseFloat(checking.balance) * arsRate).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '••••••'}</span>
            </div>
          </div>
        </div>

        {/* Stocks Balance */}
        <div className="glass stagger-3" style={{ gridColumn: 'span 6', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ opacity: 0.6, fontSize: '0.9rem', margin: 0 }}>Investment Portfolio</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 700 }} className="gradient-text">
              {showBalances ? `$${stocks.balance}` : '••••••'}
            </span>
            <span style={{ opacity: 0.6 }}>{stocks.currency}</span>
          </div>
          <div style={{ marginTop: '1rem', color: '#4ade80', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.2rem', flexWrap: 'wrap' }}>
            <span>↑ 12.8%</span>
            <span style={{ opacity: 0.6, color: 'hsl(var(--foreground))' }}>all time</span>
            <div className="ars-pill">
              Aprox. ARS <span>{showBalances ? (parseFloat(stocks.balance) * arsRate).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '••••••'}</span>
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
        @media (max-width: 640px) {
          .ars-pill { margin-left: 0; margin-top: 0.5rem; width: 100%; justify-content: center; }
        }
      `}</style>
    </>
  );
};

export default BalanceCards;
