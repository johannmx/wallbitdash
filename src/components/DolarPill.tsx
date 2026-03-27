import { useState, useEffect } from 'react';

interface DolarRate {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

const DolarPill = () => {
  const [oficial, setOficial] = useState<number | null>(null);
  const [ccl, setCcl] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const [oficialRes, cclRes] = await Promise.all([
          fetch('https://dolarapi.com/v1/dolares/oficial'),
          fetch('https://dolarapi.com/v1/dolares/contadoconliqui')
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
    <div className="glass dolar-pill" style={{ 
      display: 'flex', 
      padding: '0.35rem 1rem', 
      borderRadius: '1.25rem', 
      alignItems: 'center', 
      gap: '0.75rem',
      fontSize: '0.85rem',
      fontWeight: 800,
      height: '40px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span style={{ color: 'hsl(var(--muted))', fontSize: '0.65rem', letterSpacing: '0.05em' }}>OFI</span>
        <span>${oficial?.toFixed(0)}</span>
      </div>
      <div style={{ width: '1px', height: '16px', background: 'hsla(var(--foreground), 0.1)', margin: '0 0.1rem' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span className="gradient-text" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>CCL</span>
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
