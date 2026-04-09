import { type FC, useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { Transaction } from '../types/dashboard';

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
    <div style={{ marginTop: '0' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '3rem',
        flexWrap: 'wrap',
        gap: '2rem'
      }}>
        <div>
          <h2 style={{ fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: 900, letterSpacing: '-0.03em' }}> Ledger Histórico</h2>
          <p style={{ opacity: 0.3, fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{filteredTransactions.length} registros totales</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: isMobile ? '100%' : '320px' }}>
            <Search 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: '1.25rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                opacity: 0.3,
                pointerEvents: 'none'
              }} 
            />
            <input 
              type="text" 
              placeholder="Buscar registros..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ 
                background: 'hsla(var(--foreground), 0.05)', 
                border: '1px solid var(--border)',
                padding: '0.85rem 1.5rem 0.85rem 3.25rem',
                borderRadius: '1rem',
                color: 'hsl(var(--foreground))',
                width: '100%',
                fontSize: '0.95rem',
                transition: 'all 0.3s var(--ease-out-expo)',
                outline: 'none',
              }}
              className="search-input-new"
            />
          </div>
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
              {filteredTransactions.map((tx, i) => {
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

                const index = i % 10; // Stagger only first few
                return (
                  <tr key={tx.uuid} className={`tx-row animate-in stagger-${index + 1}`} style={{ 
                    borderBottom: '1px solid hsla(var(--foreground), 0.05)',
                    opacity: isFailed ? 0.5 : 1,
                    transition: 'all 0.2s var(--ease-out-expo)'
                  }}>
                    <td style={{ padding: '1.5rem 1rem', fontSize: '0.8rem', fontWeight: 700, opacity: 0.3, fontFamily: "'JetBrains Mono', monospace" }}>
                      {new Date(tx.date + 'T00:00:00Z').toLocaleDateString('es-ES')}
                    </td>
                    <td style={{ fontSize: '1rem', fontWeight: 800, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Outfit', sans-serif" }}>
                      {tx.description || '-'}
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        opacity: 0.4, 
                        background: 'hsla(var(--foreground), 0.05)', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.25rem',
                        textTransform: 'uppercase',
                        fontWeight: 900,
                        letterSpacing: '0.1em'
                      }}>
                        {tx.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: amountColor, fontSize: '1.1rem', fontFamily: "'JetBrains Mono', monospace" }}>
                      {expense ? '-' : '+'}${tx.amount} <span style={{ fontSize: '0.7rem', opacity: 0.3 }}>{tx.currency}</span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '1rem' }}>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        padding: '0.4rem 0.85rem', 
                        borderRadius: '0.25rem',
                        background: statusColor,
                        color: 'black',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        display: 'inline-block',
                        minWidth: '90px',
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
        .search-input-new:focus {
          border-color: hsla(var(--primary), 0.5) !important;
          background: hsla(var(--foreground), 0.08) !important;
          box-shadow: 0 0 0 4px hsla(var(--primary), 0.1);
        }
        .search-input-new:hover {
          background: hsla(var(--foreground), 0.07) !important;
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
