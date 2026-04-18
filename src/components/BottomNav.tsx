import { SECTIONS } from './Sidebar';

interface BottomNavProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export default function BottomNav({ activeSection, onSectionChange }: BottomNavProps) {
  return (
    <div 
      className="bottom-nav glass" 
      style={{
        position: 'fixed',
        bottom: 'max(env(safe-area-inset-bottom), 1.5rem)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 3rem)',
        maxWidth: '400px',
        display: 'flex',
        padding: '0.5rem',
        borderRadius: '2rem',
        zIndex: 100,
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3), 0 0 0 1px hsla(var(--primary), 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'var(--glass-bg)'
      }}
    >
      {SECTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSectionChange(id)}
          className={`nav-pill-btn ${activeSection === id ? 'active' : ''}`}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.5rem',
            borderRadius: '1.5rem',
            border: 'none',
            background: activeSection === id ? 'hsla(var(--primary), 0.15)' : 'transparent',
            color: activeSection === id ? 'hsl(var(--primary))' : 'hsl(var(--foreground) / 0.5)',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Icon size={20} strokeWidth={activeSection === id ? 2.5 : 2} />
          <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
