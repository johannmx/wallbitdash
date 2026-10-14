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
  oficialRate?: number | null;
  cclRate?: number | null;
}

const DolarPill: FC<DolarPillProps> = ({ isHeader = false, oficialRate, cclRate }) => {
  const [fetchedOficial, setFetchedOficial] = useState<number | null>(null);
  const [fetchedCcl, setFetchedCcl] = useState<number | null>(null);
  const [loading, setLoading] = useState(!oficialRate && !cclRate);

  const oficial = oficialRate ?? fetchedOficial;
  const ccl = cclRate ?? fetchedCcl;

  useEffect(() => {
    // If rates already provided by props, skip client-side fetch unless missing
    if (oficialRate && cclRate) return;

    const fetchRates = async () => {
      try {
        const [oficialRes, cclRes] = await Promise.allSettled([
          fetch('https://dolarapi.com/v1/dolares/oficial', { signal: AbortSignal.timeout(5000) }),
          fetch('https://dolarapi.com/v1/dolares/contadoconliqui', { signal: AbortSignal.timeout(5000) })
        ]);
        
        if (oficialRes.status === 'fulfilled' && oficialRes.value.ok) {
          const oficialData: DolarRate = await oficialRes.value.json();
          setFetchedOficial(oficialData.venta);
        }
        if (cclRes.status === 'fulfilled' && cclRes.value.ok) {
          const cclData: DolarRate = await cclRes.value.json();
          setFetchedCcl(cclData.venta);
        }
      } catch (error) {
        console.error('Error fetching dollar rates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 300000);
    return () => clearInterval(interval);
  }, [oficialRate, cclRate]);

  if ((loading && !oficial && !ccl) || (!oficial && !ccl)) return null;

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
