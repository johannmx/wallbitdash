import type { FC } from 'react';
import { useState, useMemo } from 'react';

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

    return txs; // Return all records for scrollable view
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
    <div className="glass transaction-list-container animate-in stagger-4" style={{ marginTop: '2rem', padding: '2rem', transition: 'all 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Historial de Transacciones</h2>
          <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>{filteredTransactions.length} registros encontrados</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Filtrar por descripción o tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              background: 'var(--input-bg)', 
              border: '1px solid var(--input-border)',
              padding: '0.65rem 1.25rem',
              borderRadius: '0.75rem',
              color: 'var(--foreground)',
              width: '280px',
              fontSize: '0.9rem'
            }}
          />
        </div>
      </div>
      
      <div className="scroll-area" style={{ overflowX: 'auto', maxHeight: '550px', overflowY: 'auto', borderRadius: '1rem', border: '1px solid transparent', transition: 'all 0.3s ease' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.4rem' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--header-bg)', backdropFilter: 'blur(20px)' }}>
            <tr style={{ textAlign: 'left', opacity: 0.8, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}>
              <th style={{ padding: '1.25rem 1rem' }} onClick={() => handleSort('date')}>Fecha {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('description')}>Descripción {sortField === 'description' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('type')}>Tipo {sortField === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('amount')}>Monto {sortField === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('status')}>Estado {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => {
              const expense = isExpense(tx.type);
              const statusUpper = tx.status.toUpperCase();
              const isFailed = ['FAILED', 'DECLINED', 'EXPIRED'].includes(statusUpper);
              const isPending = statusUpper === 'PENDING';
              const isReversed = statusUpper === 'REVERSED';
              const statusColor = getStatusColor(tx.status);

              let amountColor = expense ? 'hsl(var(--error))' : 'hsl(var(--success))';
              if (isFailed) amountColor = 'var(--muted)';
              if (isPending) amountColor = 'hsl(var(--warning))';
              if (isReversed) amountColor = '#8a89ff';

              return (
                <tr key={tx.uuid} className="tx-row" style={{ 
                  background: 'hsla(var(--foreground), 0.01)', // Softened background
                  borderRadius: '1rem',
                  opacity: isFailed ? 0.7 : 1
                }}>
                  <td style={{ padding: '0.85rem 1rem', borderTopLeftRadius: '1rem', borderBottomLeftRadius: '1rem', fontSize: '0.85rem', fontWeight: 500 }}>
                    {new Date(tx.date + 'T00:00:00Z').toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td style={{ fontSize: '0.85rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tx.description || '-'}
                  </td>
                  <td style={{ textTransform: 'capitalize', fontSize: '0.8rem', opacity: 0.6 }}>
                    {tx.type.replace(/_/g, ' ').toLowerCase()}
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
      </div>

      <style>{`
        .transaction-list-container:hover {
          box-shadow: 0 12px 48px -12px rgba(0,0,0,0.4);
        }
        [data-theme='light'] .transaction-list-container:hover {
          box-shadow: 0 12px 48px -12px rgba(0,0,0,0.1);
        }
        .scroll-area:hover {
          border-color: var(--glass-border) !important;
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
        /* Custom scrollbar optimized for visibility */
        .scroll-area::-webkit-scrollbar {
          width: 8px;
        }
        .scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }
        .scroll-area::-webkit-scrollbar-thumb {
          background: hsla(var(--foreground), 0.1);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
          transition: background 0.3s ease;
        }
        .scroll-area:hover::-webkit-scrollbar-thumb {
          background-color: hsla(var(--muted), 0.4);
        }
        .scroll-area::-webkit-scrollbar-thumb:hover {
          background-color: hsl(var(--primary)) !important;
        }
      `}</style>
    </div>
  );
};

export default TransactionList;
