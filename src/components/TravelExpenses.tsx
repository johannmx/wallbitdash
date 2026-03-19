import type { FC } from 'react';

interface BrazilTrip {
  title: string;
  subtitle: string;
  dateRange: string;
  totalSpent: string;
  currency: string;
  transactions: {
    date: string;
    desc: string;
    amount: string;
    currency: string;
  }[];
}

interface TravelExpensesProps {
  brazilTrip: BrazilTrip;
}

const TravelExpenses: FC<TravelExpensesProps> = ({ brazilTrip }) => {
  return (
    <div className="glass animate-in stagger-2" style={{ marginTop: '2rem', padding: '2rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(260, 80, 60, 0.1) 100%)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }} className="gradient-text">{brazilTrip.title}</h2>
        <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>{brazilTrip.subtitle} • {brazilTrip.dateRange}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Summary Card */}
        <div className="glass" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Gastado</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>${brazilTrip.totalSpent}</div>
          <div style={{ opacity: 0.6 }}>{brazilTrip.currency}</div>
        </div>

        {/* Mini List */}
        <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '1rem' }}>
          {brazilTrip.transactions.map((tx, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '0.75rem 0', 
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              fontSize: '0.9rem'
            }}>
              <div>
                <div style={{ fontWeight: 500 }}>{tx.desc}</div>
                <div style={{ opacity: 0.4, fontSize: '0.75rem' }}>
                  {new Date(tx.date + 'T00:00:00Z').toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </div>
              </div>
              <div style={{ fontWeight: 600 }}>${tx.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TravelExpenses;
