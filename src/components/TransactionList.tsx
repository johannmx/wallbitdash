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
  const [showAll, setShowAll] = useState(false);
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

    return showAll ? txs : txs.slice(0, 5);
  }, [search, sortField, sortOrder, showAll, transactions]);

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
      case 'PENDING': return 'hsl(var(--warning))'; // Amber
      case 'REVERSED': return '#818cf8'; // Indigo/Purple
      case 'FAILED':
      case 'DECLINED':
      case 'EXPIRED': return 'rgba(255, 255, 255, 0.4)'; // Gray
      default: return 'hsl(var(--foreground))';
    }
  };

  return (
    <div className="glass animate-in stagger-3" style={{ marginTop: '2rem', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Historial de Transacciones</h2>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Buscar por descripción, tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              background: 'rgba(0,0,0,0.2)', 
              border: '1px solid var(--glass-border)',
              padding: '0.5rem 1rem',
              borderRadius: '0.75rem',
              color: 'white',
              width: '300px'
            }}
          />
          <button 
            onClick={() => setShowAll(!showAll)}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--glass-border)',
              padding: '0.5rem 1rem',
              borderRadius: '0.75rem',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            {showAll ? 'Ver menos' : 'Ver todo'}
          </button>
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', opacity: 0.4, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}>
              <th style={{ padding: '0 1rem' }} onClick={() => handleSort('date')}>Fecha {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
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
              if (isFailed) amountColor = '#888';
              if (isPending) amountColor = 'hsl(var(--warning))';
              if (isReversed) amountColor = '#818cf8';

              return (
                <tr key={tx.uuid} className="tx-row" style={{ 
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '1rem',
                  opacity: isFailed ? 0.6 : 1
                }}>
                  <td style={{ padding: '1rem', borderTopLeftRadius: '1rem', borderBottomLeftRadius: '1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {new Date(tx.date + 'T00:00:00Z').toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td style={{ fontSize: '0.9rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tx.description || '-'}
                  </td>
                  <td style={{ textTransform: 'capitalize', fontSize: '0.85rem', opacity: 0.7 }}>
                    {tx.type.replace(/_/g, ' ').toLowerCase()}
                  </td>
                  <td style={{ 
                    fontWeight: 700, 
                    color: amountColor
                  }}>
                    {expense ? '-' : '+'}${tx.amount} <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{tx.currency}</span>
                  </td>
                  <td style={{ borderTopRightRadius: '1rem', borderBottomRightRadius: '1rem' }}>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      padding: '0.25rem 0.6rem', 
                      borderRadius: '2rem',
                      background: isFailed ? 'rgba(255,255,255,0.05)' : `${statusColor}20`,
                      color: statusColor,
                      border: `1px solid ${isFailed ? 'rgba(255,255,255,0.1)' : statusColor + '40'}`,
                      fontWeight: 700,
                      textTransform: 'uppercase'
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
        .tx-row:hover {
          background: rgba(255,255,255,0.05) !important;
        }
        th {
            white-space: nowrap;
            padding: 0 0.5rem;
        }
        th:hover {
          opacity: 1 !important;
          color: hsl(var(--accent));
        }
      `}</style>
    </div>
  );
};

export default TransactionList;
