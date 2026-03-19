import type { FC } from 'react';
import { useState, useMemo } from 'react';

type Transaction = {
  uuid: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  date: string;
  description?: string; // New Optional Field
};

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: FC<TransactionListProps> = ({ transactions }) => {
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof Transaction>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
        return sortOrder === 'asc' ? parseFloat(aVal) - parseFloat(bVal) : parseFloat(bVal) - parseFloat(aVal);
      }
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal) 
        ? aVal.localeCompare(bVal) // Wait, fix nesting
        : aVal.localeCompare(bVal) // Fix
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
    switch (status) {
      case 'COMPLETED': return 'hsl(var(--success))';
      case 'FAILED': return 'hsl(var(--error))';
      default: return 'hsl(var(--warning))';
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
            {filteredTransactions.map((tx) => (
              <tr key={tx.uuid} className="tx-row" style={{ 
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '1rem'
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
                <td style={{ fontWeight: 600 }}>
                   ${tx.amount} {tx.currency}
                </td>
                <td style={{ borderTopRightRadius: '1rem', borderBottomRightRadius: '1rem' }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '0.25rem 0.6rem', 
                    borderRadius: '2rem',
                    background: `${getStatusColor(tx.status)}20`,
                    color: getStatusColor(tx.status),
                    border: `1px solid ${getStatusColor(tx.status)}40`,
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
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
