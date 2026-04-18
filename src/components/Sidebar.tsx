import { Wallet, CreditCard, Activity, ArrowRightLeft } from 'lucide-react';

export const SECTIONS = [
  { id: 'saldos', label: 'Saldos', icon: Wallet },
  { id: 'gastos', label: 'Gastos', icon: CreditCard },
  { id: 'analisis', label: 'Análisis', icon: Activity },
  { id: 'transacciones', label: 'Historial', icon: ArrowRightLeft },
];

interface SidebarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="sidebar glass" style={{
      position: 'sticky',
      top: '2rem',
      height: 'calc(100vh - 4rem)',
      width: '280px',
      padding: '2rem',
      borderRadius: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2.5rem',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="glass" style={{ 
          width: '48px', 
          height: '48px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'hsl(var(--primary))',
          borderRadius: '1rem',
          border: '2px solid hsla(var(--primary), 0.2)',
          boxShadow: '0 0 30px -5px hsla(var(--primary), 0.3)'
        }}>
          <Wallet size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 900, lineHeight: 1 }}>Wallbit<span className="gradient-text">Dash</span></h2>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSectionChange(id)}
            className={`sidebar-link ${activeSection === id ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              width: '100%',
              padding: '1rem',
              borderRadius: '1rem',
              border: 'none',
              background: activeSection === id ? 'hsla(var(--primary), 0.1)' : 'transparent',
              color: activeSection === id ? 'hsl(var(--primary))' : 'inherit',
              fontWeight: 800,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: activeSection === id ? 1 : 0.5,
            }}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div style={{ opacity: 0.3, fontSize: '0.7rem', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        @johannmx
      </div>
    </aside>
  );
}
