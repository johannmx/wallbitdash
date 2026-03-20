import type { FC } from 'react';
import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, DollarSign } from 'lucide-react';

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
  arsRate: number;
}

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#0ea5e9'];

const AnalyticsCards: FC<AnalyticsCardsProps> = ({ transactions, arsRate }) => {
  
  // 1. Process Data for Monthly ARS Deposit Chart
  const monthlyDepositData = useMemo(() => {
    const monthlyARS: Record<string, number> = {};
    const monthsNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    transactions
      .filter(tx => tx.type.toLowerCase().includes('deposit_local') && tx.status === 'COMPLETED')
      .forEach(tx => {
        const d = new Date(tx.date + 'T00:00:00Z');
        const monthKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
        monthlyARS[monthKey] = (monthlyARS[monthKey] || 0) + parseFloat(tx.amount);
      });

    return Object.entries(monthlyARS)
      .map(([key, amount]) => {
        const [year, monthIdx] = key.split('-');
        return { 
          name: `${monthsNames[parseInt(monthIdx)]} ${year.slice(2)}`,
          amount: parseFloat(amount.toFixed(2)),
          fullKey: key
        };
      })
      .sort((a,b) => a.fullKey.localeCompare(b.fullKey))
      .slice(-6); 
  }, [transactions]);

  // Calculate total in USD for the chart period
  const totalInUSD = useMemo(() => {
    const sumARS = monthlyDepositData.reduce((acc, curr) => acc + curr.amount, 0);
    return (sumARS / (arsRate || 1)).toFixed(2);
  }, [monthlyDepositData, arsRate]);

  // 2. Process Data for Expense Pie Chart
  const expenseBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {
      'Withdrawal Local': 0,
      'Pay QR': 0,
      'Card Spent': 0,
      'Blockchain Withdrawal': 0
    };

    transactions
      .filter(tx => tx.status === 'COMPLETED' || tx.status === 'PENDING')
      .forEach(tx => {
        const type = tx.type.toLowerCase();
        if (type.includes('withdrawal_local')) breakdown['Withdrawal Local'] += parseFloat(tx.amount);
        else if (type.includes('pay_qr')) breakdown['Pay QR'] += parseFloat(tx.amount);
        else if (type.includes('card_spent')) breakdown['Card Spent'] += parseFloat(tx.amount);
        else if (type.includes('blockchain_withdrawal')) breakdown['Blockchain Withdrawal'] += parseFloat(tx.amount);
      });

    return Object.entries(breakdown)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ 
        name, 
        value: parseFloat(value.toFixed(2)) 
      }));
  }, [transactions]);

  return (
    <div className="analytics-container animate-in stagger-3" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
      
      {/* Deposit Bar Chart (Monthly ARS) */}
      <div className="glass" style={{ gridColumn: 'span 7', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="icon-container" style={{ background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Depósitos Locales (ARS)</h3>
              <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>Histórico mensual en pesos</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase' }}>Total Ref. USD</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'hsl(var(--success))' }}>${totalInUSD} <span style={{ fontSize: '0.7rem' }}>USD</span></div>
          </div>
        </div>
        
        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyDepositData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
              <XAxis dataKey="name" stroke="currentColor" opacity={0.5} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="currentColor" opacity={0.5} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
              <Tooltip 
                cursor={{ fill: 'currentColor', opacity: 0.05 }}
                contentStyle={{ 
                  backgroundColor: 'var(--glass-bg)', 
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  boxShadow: 'var(--glass-shadow)',
                  color: 'var(--foreground)'
                }}
                itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 600 }}
                formatter={(value: number) => [`$${value.toLocaleString()} ARS`, 'Depósito']}
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', opacity: 0.5 }}>
          <DollarSign size={14} />
          <span>Calculado con Dólar Oficial: 1 USD = {arsRate} ARS</span>
        </div>
      </div>

      {/* Expense Pie Chart */}
      <div className="glass" style={{ gridColumn: 'span 5', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="icon-container" style={{ background: 'hsla(var(--error), 0.1)', color: 'hsl(var(--error))' }}>
            <PieIcon size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Distribución de Gastos</h3>
            <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>Ranking por consumo</p>
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--card)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--glass-bg)', 
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  color: 'var(--foreground)'
                }}
                itemStyle={{ fontWeight: 700 }}
                formatter={(value: number) => [`$${value.toFixed(2)} USD`, 'Gasto']}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center" 
                iconType="circle" 
                wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .analytics-container { grid-template-columns: 1fr !important; }
          .glass { grid-column: span 12 !important; }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsCards;
