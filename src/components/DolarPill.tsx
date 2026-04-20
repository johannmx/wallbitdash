import { useState, useEffect, type FC } from 'react';

interface DolarRate {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

interface DolarPillProps {
  isHeader?: boolean;
}

const DolarPill: FC<DolarPillProps> = ({ isHeader = false }) => {
  const [oficial, setOficial] = useState<number | null>(null);
  const [ccl, setCcl] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const [oficialRes, cclRes] = await Promise.all([
          fetch('https://dolarapi.com/v1/dolares/oficial', { signal: AbortSignal.timeout(5000) }),
          fetch('https://dolarapi.com/v1/dolares/contadoconliqui', { signal: AbortSignal.timeout(5000) })
        ]);
        
        if (oficialRes.ok && cclRes.ok) {
          const oficialData: DolarRate = await oficialRes.json();
          const cclData: DolarRate = await cclRes.json();
          setOficial(oficialData.venta);
          setCcl(cclData.venta);
        }
      } catch (error) {
        console.error('Error fetching dollar rates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    // Refresh every 5 minutes
    const interval = setInterval(fetchRates, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading || (!oficial && !ccl)) return null;

  return (
    <div className={!isHeader ? "glass dolar-pill" : "dolar-pill"} style={{ 
      display: 'flex', 
      padding: isHeader ? '0' : '0.35rem 1rem', 
      background: isHeader ? 'transparent' : undefined,
      border: isHeader ? 'none' : undefined,
      boxShadow: isHeader ? 'none' : undefined,
      borderRadius: '1.25rem', 
      alignItems: 'center', 
      gap: isHeader ? '0.75rem' : '0.5rem',
      fontSize: '0.7rem',
      fontWeight: 800,
      height: isHeader ? 'auto' : '40px',
      whiteSpace: 'nowrap',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <span style={{ color: 'hsl(var(--muted))', fontSize: '0.6rem', letterSpacing: '0.05em' }}>OFI</span>
        <span>${oficial?.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
      </div>
      <div style={{ width: '1px', height: '14px', background: 'hsla(var(--foreground), 0.1)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <span className="gradient-text" style={{ fontSize: '0.6rem', letterSpacing: '0.05em' }}>CCL</span>
        <span>${ccl?.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .dolar-pill {
            padding: 0.35rem 0.75rem;
            gap: 0.5rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DolarPill;
