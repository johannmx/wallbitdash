import type { FC } from 'react';
import { useState, useMemo, useEffect } from 'react';

type Transaction = {
  uuid: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  date: string;
  description?: string;
};

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: FC<TransactionListProps> = ({ transactions }) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof Transaction>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isExpense = (type: string) => {
    const t = type.toLowerCase();
    return t.includes('spent') || t.includes('qr') || t.includes('transfer_out') || t.includes('withdrawal') || t === 'internal_transfer';
  };

  const filteredTransactions = useMemo(() => {
    let txs = [...transactions];
    
    // Search filter
    if (search) {
      const s = search.toLowerCase();
      txs = txs.filter(t => 
        t.type.toLowerCase().includes(s) || 
        t.amount.includes(s) || 
        t.status.toLowerCase().includes(s) ||
        t.date.includes(s) ||
        (t.description || '').toLowerCase().includes(s)
      );
    }

    // Sort
    txs.sort((a, b) => {
      const aVal = (a[sortField] || '').toString();
      const bVal = (b[sortField] || '').toString();
      
      if (sortField === 'amount') {
        const amtA = parseFloat(aVal) || 0;
        const amtB = parseFloat(bVal) || 0;
        return sortOrder === 'asc' ? amtA - amtB : amtB - amtA;
      }
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

    return txs; 
  }, [search, sortField, sortOrder, transactions]);

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case 'COMPLETED': return 'hsl(var(--success))';
      case 'PENDING': return 'hsl(var(--warning))'; 
      case 'REVERSED': return '#8a89ff'; 
      case 'FAILED':
      case 'DECLINED':
      case 'EXPIRED': return '#ef4444'; 
      default: return 'hsl(var(--foreground))';
    }
  };

  return (
    <div className="glass transaction-list-container animate-in stagger-4" style={{ marginTop: '2rem', padding: isMobile ? '1.25rem' : '2rem', transition: 'all 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem' }}>Historial</h2>
          <p style={{ opacity: 0.5, fontSize: '0.75rem' }}>{filteredTransactions.length} registros</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
          <input 
            type="text" 
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              background: 'hsla(var(--primary), 0.08)', 
              border: '2px solid hsl(var(--primary))',
              padding: '0.65rem 1.5rem',
              borderRadius: '2rem',
              color: 'hsl(var(--foreground))',
              width: '100%',
              maxWidth: isMobile ? '100%' : '280px',
              fontSize: '0.9rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              outline: 'none',
              boxShadow: '0 4px 12px -2px hsla(var(--primary), 0.2)'
            }}
            className="search-input"
          />
        </div>
      </div>
      
      <div className="scroll-area" style={{ 
        overflowX: isMobile ? 'hidden' : 'auto', 
        maxHeight: '550px', 
        overflowY: 'auto', 
        borderRadius: '1rem'
      }}>
        {isMobile ? (
          /* Mobile Card View (Requested only for History) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredTransactions.map((tx) => {
              const expense = isExpense(tx.type);
              const statusColor = getStatusColor(tx.status);
              const statusUpper = tx.status.toUpperCase();
              const isFailed = ['FAILED', 'DECLINED', 'EXPIRED'].includes(statusUpper);
              const isPending = statusUpper === 'PENDING';
              const isReversed = statusUpper === 'REVERSED';

              let amountColor = expense ? 'hsl(var(--error))' : 'hsl(var(--success))';
              if (isFailed) amountColor = 'var(--muted)';
              if (isPending) amountColor = 'hsl(var(--warning))';
              if (isReversed) amountColor = '#8a89ff';

              return (
                <div key={tx.uuid} style={{ 
                  background: 'hsla(var(--foreground), 0.03)', 
                  padding: '1rem', 
                  borderRadius: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: isFailed ? 0.7 : 1,
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxWidth: '60%' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>
                        {new Date(tx.date + 'T00:00:00Z').toLocaleDateString('es-ES')}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tx.description || tx.type.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: statusColor, textTransform: 'uppercase' }}>
                        {tx.status}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: amountColor, fontSize: '1rem' }}>
                      {expense ? '-' : '+'}${tx.amount}
                    </div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{tx.currency}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Desktop Table View */
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.4rem' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--header-bg)', backdropFilter: 'blur(20px)' }}>
              <tr style={{ textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
                <th style={{ padding: '1.25rem 1rem', opacity: 0.5 }} onClick={() => handleSort('date')}>Fecha {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th style={{ opacity: 0.5 }} onClick={() => handleSort('description')}>Descripción {sortField === 'description' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th style={{ opacity: 0.5 }} onClick={() => handleSort('type')}>Tipo {sortField === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th style={{ opacity: 0.5 }} onClick={() => handleSort('amount')}>Monto {sortField === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th style={{ opacity: 0.5 }} onClick={() => handleSort('status')}>Estado {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => {
                const expense = isExpense(tx.type);
                const statusColor = getStatusColor(tx.status);
                const statusUpper = tx.status.toUpperCase();
                const isFailed = ['FAILED', 'DECLINED', 'EXPIRED'].includes(statusUpper);
                const isPending = statusUpper === 'PENDING';
                const isReversed = statusUpper === 'REVERSED';

                let amountColor = expense ? 'hsl(var(--error))' : 'hsl(var(--success))';
                if (isFailed) amountColor = 'var(--muted)';
                if (isPending) amountColor = 'hsl(var(--warning))';
                if (isReversed) amountColor = '#8a89ff';

                return (
                  <tr key={tx.uuid} className="tx-row" style={{ 
                    background: 'hsla(var(--foreground), 0.01)', 
                    borderRadius: '1rem',
                    opacity: isFailed ? 0.7 : 1
                  }}>
                    <td style={{ padding: '1rem', borderTopLeftRadius: '1rem', borderBottomLeftRadius: '1rem', fontSize: '0.8rem', fontWeight: 600, opacity: 0.5 }}>
                      {new Date(tx.date + 'T00:00:00Z').toLocaleDateString('es-ES')}
                    </td>
                    <td style={{ fontSize: '0.9rem', fontWeight: 700, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Outfit', sans-serif" }}>
                      {tx.description || '-'}
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        opacity: 0.5, 
                        background: 'hsla(var(--foreground), 0.05)', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '0.5rem',
                        textTransform: 'uppercase',
                        fontWeight: 800,
                        letterSpacing: '0.02em'
                      }}>
                        {tx.type.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: amountColor, fontSize: '0.9rem' }}>
                      {expense ? '-' : '+'}${tx.amount} <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{tx.currency}</span>
                    </td>
                    <td style={{ borderTopRightRadius: '1rem', borderBottomRightRadius: '1rem' }}>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        padding: '0.3rem 0.75rem', 
                        borderRadius: '2rem',
                        background: 'transparent',
                        color: statusColor,
                        border: `2px solid ${statusColor}`,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        display: 'inline-block',
                        minWidth: '75px',
                        textAlign: 'center'
                      }}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .search-input:focus {
          border-color: hsl(var(--primary)) !important;
          box-shadow: 0 0 0 4px hsla(var(--primary), 0.25);
          background: hsla(var(--primary), 0.12) !important;
        }
        .search-input:hover {
          background: hsla(var(--primary), 0.1) !important;
          box-shadow: 0 4px 15px -1px hsla(var(--primary), 0.3);
        }
        .transaction-list-container:hover {
          box-shadow: 0 12px 48px -12px rgba(0,0,0,0.4);
        }
        [data-theme='light'] .transaction-list-container:hover {
          box-shadow: 0 12px 48px -12px rgba(0,0,0,0.1);
        }
        .tx-row:hover {
          background: hsla(var(--foreground), 0.04) !important;
        }
        th {
          white-space: nowrap;
          padding: 0.5rem;
        }
        th:hover {
          color: hsl(var(--primary)) !important;
          opacity: 1 !important;
        }
        /* Keep lateral scrollable behavior */
        .scroll-area::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .scroll-area::-webkit-scrollbar-thumb {
          background: hsla(var(--foreground), 0.15);
          border-radius: 10px;
        }
        .scroll-area:hover::-webkit-scrollbar-thumb {
          background-color: hsla(var(--foreground), 0.3);
        }
      `}</style>
    </div>
  );
};

export default TransactionList;
