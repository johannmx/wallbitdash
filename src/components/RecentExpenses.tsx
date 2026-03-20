import type { FC } from 'react';

interface Expense {
  date: string;
  description: string;
  amount: string;
  currency: string;
  status: string;
}

interface RecentExpensesProps {
  data: {
    title: string;
    subtitle: string;
    totalSpent: string;
    currency: string;
    transactions: Expense[];
  };
}

const RecentExpenses: FC<RecentExpensesProps> = ({ data }) => {
  return (
    <div className="glass animate-in stagger-2" style={{ 
      marginTop: '2rem', 
      padding: '2rem', 
      background: 'linear-gradient(135deg, var(--glass-bg) 0%, rgba(59, 130, 246, 0.1) 100%)' 
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }} className="gradient-text">{data.title}</h2>
        <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>{data.subtitle}</p>
      </div>

      <div className="dashboard-grid">
        {/* Summary Card */}
        <div className="glass" style={{ 
          gridColumn: 'span 4',
          padding: '1.5rem', 
          background: 'var(--summary-bg)', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Gastado (7 días)</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>${data.totalSpent}</div>
          <div style={{ opacity: 0.6, fontSize: '0.9rem' }}>Equivalente en USD</div>
        </div>

        {/* Mini List */}
        <div style={{ gridColumn: 'span 8', maxHeight: '250px', overflowY: 'auto', paddingRight: '1rem' }}>
          {data.transactions.length === 0 ? (
            <div style={{ opacity: 0.3, textAlign: 'center', padding: '2rem' }}>No hay gastos en los últimos 7 días.</div>
          ) : (
            data.transactions.map((tx, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '0.75rem 0', 
                borderBottom: '1px solid var(--border)',
                fontSize: '0.9rem',
                opacity: tx.status === 'PENDING' ? 0.7 : 1
              }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{tx.description}</div>
                  <div style={{ opacity: 0.4, fontSize: '0.75rem' }}>
                    {new Date(tx.date + 'T00:00:00Z').toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                    {tx.status === 'PENDING' && <span style={{ marginLeft: '0.5rem', color: 'hsl(var(--warning))' }}>(Pendiente)</span>}
                  </div>
                </div>
                <div style={{ fontWeight: 600, color: tx.status === 'PENDING' ? 'hsl(var(--warning))' : 'hsl(var(--error))' }}>
                  -{tx.amount} {tx.currency}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
            .dashboard-grid { grid-template-columns: 1fr !important; }
            .glass { grid-column: span 1 !important; }
        }
      `}</style>
    </div>
  );
};

export default RecentExpenses;
