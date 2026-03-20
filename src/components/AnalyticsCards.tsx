import type { FC } from 'react';
import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';

interface Transaction {
  uuid: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  date: string;
}

interface AnalyticsCardsProps {
  transactions: Transaction[];
}

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'];

const AnalyticsCards: FC<AnalyticsCardsProps> = ({ transactions }) => {
  
  // 1. Process Data for Deposit Chart (Bar Chart)
  const depositData = useMemo(() => {
    const dailyDeposits: Record<string, number> = {};
    
    transactions
      .filter(tx => tx.type.toLowerCase().includes('deposit_local') && tx.status === 'COMPLETED')
      .forEach(tx => {
        dailyDeposits[tx.date] = (dailyDeposits[tx.date] || 0) + parseFloat(tx.amount);
      });

    return Object.entries(dailyDeposits)
      .map(([date, amount]) => ({ 
        date: date.split('-').slice(1).join('/'), // MM/DD
        amount: parseFloat(amount.toFixed(2)) 
      }))
      .sort((a,b) => a.date.localeCompare(b.date))
      .slice(-7); 
  }, [transactions]);

  // 2. Process Data for Expense Pie Chart
  const expenseBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {
      'Withdrawal Local': 0,
      'Pay QR': 0,
      'Card Spent': 0
    };

    transactions
      .filter(tx => tx.status === 'COMPLETED' || tx.status === 'PENDING')
      .forEach(tx => {
        const type = tx.type.toLowerCase();
        if (type.includes('withdrawal_local')) breakdown['Withdrawal Local'] += parseFloat(tx.amount);
        else if (type.includes('pay_qr')) breakdown['Pay QR'] += parseFloat(tx.amount);
        else if (type.includes('card_spent')) breakdown['Card Spent'] += parseFloat(tx.amount);
      });

    return Object.entries(breakdown)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [transactions]);

  return (
    <div className="analytics-container animate-in stagger-3" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
      
      {/* Deposit Bar Chart */}
      <div className="glass" style={{ gridColumn: 'span 7', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="icon-container" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Depósitos Locales</h3>
            <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>Volumen de ingresos por día</p>
          </div>
        </div>
        
        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={depositData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Pie Chart */}
      <div className="glass" style={{ gridColumn: 'span 5', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="icon-container" style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e' }}>
            <PieIcon size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Desglose de Gastos</h3>
            <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>Por categoría (Total)</p>
          </div>
        </div>

        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={5}
                dataKey="value"
              >
                {expenseBreakdown.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`
        .icon-container {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 992px) {
          .analytics-container { grid-template-columns: 1fr !important; }
          .glass { grid-column: span 12 !important; }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsCards;
