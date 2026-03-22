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
  arsRate: number;
}

const RecentExpenses: FC<RecentExpensesProps> = ({ data, arsRate }) => {
  return (
    <div className="glass animate-in stagger-2" style={{ 
      marginTop: '2rem', 
      padding: 'var(--container-padding, 2rem)', 
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
          padding: '2rem', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <h3 style={{ opacity: 0.5, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>Total Gastado (7 días)</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 700 }} className="gradient-text">
              ${data.totalSpent}
            </span>
            <span style={{ opacity: 0.6 }}>USD</span>
          </div>

          <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', width: '100%' }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '0.5rem' }}>Equivalente aprox en ARS</div>
            <div style={{ fontWeight: 800, color: 'hsl(var(--primary))', fontSize: '1.1rem' }}>
              ${(parseFloat(data.totalSpent) * arsRate).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Mini List */}
        <div className="modern-scroll" style={{ gridColumn: 'span 8', maxHeight: '250px', overflowY: 'auto', paddingRight: '1rem' }}>
          {data.transactions.length === 0 ? (
            <div style={{ opacity: 0.3, textAlign: 'center', padding: '2rem' }}>No hay gastos en los últimos 7 días.</div>
          ) : (
            data.transactions.map((tx, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem 0', 
                borderBottom: '1px solid hsla(var(--foreground), 0.05)',
                fontSize: '0.9rem',
                opacity: tx.status === 'PENDING' ? 0.7 : 1
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '0.95rem' }}>
                    {tx.description}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ opacity: 0.4, fontSize: '0.75rem', fontWeight: 500 }}>
                      {new Date(tx.date + 'T00:00:00Z').toLocaleDateString('es-ES')}
                    </span>
                    {tx.status === 'PENDING' && (
                      <span style={{ 
                        fontSize: '0.6rem', 
                        padding: '0.15rem 0.4rem', 
                        borderRadius: '0.4rem', 
                        background: 'hsla(var(--warning), 0.1)', 
                        color: 'hsl(var(--warning))',
                        fontWeight: 800,
                        textTransform: 'uppercase'
                      }}>
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ 
                  fontWeight: 800, 
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '1.05rem',
                  color: tx.status === 'PENDING' ? 'hsl(var(--warning))' : 'hsl(var(--error))' 
                }}>
                  -${tx.amount} <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>{tx.currency}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
            .dashboard-grid { 
                grid-template-columns: 1fr !important; 
                gap: 1.5rem !important;
            }
            .glass[style*="grid-column: span 4"] { 
                grid-column: span 1 !important; 
                width: 100% !important;
            }
            .glass:has(.modern-scroll) {
                padding: 1rem !important;
            }
        }
        @media (max-width: 640px) {
            :root { --container-padding: 1rem; }
            .modern-scroll { padding-right: 0 !important; }
        }
        .modern-scroll::-webkit-scrollbar {
            width: 5px;
        }
        .modern-scroll::-webkit-scrollbar-track {
            background: transparent;
        }
        .modern-scroll::-webkit-scrollbar-thumb {
            background: rgba(59, 130, 246, 0.2);
            border-radius: 10px;
        }
        .modern-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default RecentExpenses;
