import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, Sector 
} from 'recharts';
import { DollarSign } from 'lucide-react';

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

// Active shape for Pie Chart zoom effect
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

const AnalyticsCards: FC<AnalyticsCardsProps> = ({ transactions, arsRate }) => {
  const [activeIndex, setActiveIndex] = useState(-1);

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

  const totalExpenseUSD = useMemo(() => {
    return expenseBreakdown.reduce((acc, curr) => acc + curr.value, 0).toFixed(2);
  }, [expenseBreakdown]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  return (
    <div className="analytics-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--space-group)' }}>
      
      {/* Deposit Bar Chart (Monthly ARS) - Dominant Card */}
      <div className="glass" style={{ gridColumn: 'span 8', padding: 'var(--space-item) 2.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Depósitos Locales</h3>
              <p style={{ opacity: 0.4, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Histórico mensual ARS</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.4, fontWeight: 700, textTransform: 'uppercase' }}>Ref. USD</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>${totalInUSD}</div>
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
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        const val = payload[0].value as number;
                        const usdVal = (val / (arsRate || 1)).toFixed(2);
                        return (
                            <div className="glass" style={{ padding: '0.75rem', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'hsl(var(--foreground))' }}>
                                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{payload[0].payload.name}</div>
                                <div style={{ color: 'hsl(var(--primary))' }}>ARS: ${val.toLocaleString()}</div>
                                <div style={{ opacity: 0.6, fontSize: '0.7rem' }}>USD Ref: ${usdVal}</div>
                            </div>
                        );
                    }
                    return null;
                }}
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', opacity: 0.5 }}>
          <DollarSign size={14} />
          <span>Calculado con Dólar Oficial: 1 USD = {arsRate} ARS</span>
        </div>
      </div>

      {/* Expense Pie Chart - Secondary Card */}
      <div className="glass" style={{ gridColumn: 'span 4', padding: 'var(--space-item) 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Distribución</h3>
              <p style={{ opacity: 0.4, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Ranking por consumo</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.4, fontWeight: 700, textTransform: 'uppercase' }}>Total USD</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'hsl(var(--error))' }}>${totalExpenseUSD}</div>
          </div>
        </div>

        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                {...({
                  activeIndex,
                  activeShape: renderActiveShape,
                  data: expenseBreakdown,
                  cx: "50%",
                  cy: "50%",
                  innerRadius: 55,
                  outerRadius: 75,
                  paddingAngle: 5,
                  dataKey: "value",
                  onMouseEnter: onPieEnter,
                  onMouseLeave: onPieLeave
                } as any)}
              >
                {expenseBreakdown.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--background)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        return (
                            <div className="glass" style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'hsl(var(--foreground))' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{payload[0].name}</div>
                                <div style={{ color: payload[0].fill, fontSize: '0.9rem', fontWeight: 800 }}>
                                    ${(payload[0].value as number).toFixed(2)} USD
                                </div>
                            </div>
                        );
                    }
                    return null;
                }}
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
          .glass { 
            grid-column: span 12 !important; 
            padding: var(--space-item) 1.25rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsCards;
