import type { FC } from 'react';

interface BalanceCardsProps {
  checking: { balance: string; currency: string };
  stocks: { balance: string; currency: string };
}

const BalanceCards: FC<BalanceCardsProps> = ({ checking, stocks }) => {
  return (
    <div className="dashboard-grid animate-in stagger-1">
      {/* Checking Balance */}
      <div className="glass stagger-2" style={{ gridColumn: 'span 6', padding: '2rem' }}>
        <h3 style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Checking Account</h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '3rem', fontWeight: 700 }} className="gradient-text">
            ${checking.balance}
          </span>
          <span style={{ opacity: 0.6 }}>{checking.currency}</span>
        </div>
        <div style={{ marginTop: '1rem', color: '#4ade80', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <span>↑ 2.4%</span>
          <span style={{ opacity: 0.6, color: 'hsl(var(--foreground))' }}>this month</span>
        </div>
      </div>

      {/* Stocks Balance */}
      <div className="glass stagger-3" style={{ gridColumn: 'span 6', padding: '2rem' }}>
        <h3 style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Investment Portfolio</h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '3rem', fontWeight: 700 }} className="gradient-text">
            ${stocks.balance}
          </span>
          <span style={{ opacity: 0.6 }}>{stocks.currency}</span>
        </div>
        <div style={{ marginTop: '1rem', color: '#4ade80', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <span>↑ 12.8%</span>
          <span style={{ opacity: 0.6, color: 'hsl(var(--foreground))' }}>all time</span>
        </div>
      </div>
    </div>
  );
};

export default BalanceCards;
