import type { FC } from 'react';

interface Asset {
  symbol: string;
  shares: string;
}

interface AssetExplorerProps {
  assets: Asset[];
}

const AssetExplorer: FC<AssetExplorerProps> = ({ assets }) => {
  return (
    <div className="glass animate-in stagger-4" style={{ marginTop: '2rem', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Mis Activos</h2>
      <div className="dashboard-grid">
        {(assets || []).map((asset, index) => (
          <div key={index} className="glass" style={{ 
            padding: '1.5rem', 
            background: 'rgba(255,255,255,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{asset.symbol}</div>
              <div style={{ opacity: 0.5, fontSize: '0.8rem' }}>Stock Asset</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>{asset.shares} shares</div>
              <div style={{ color: 'hsl(var(--success))', fontSize: '0.8rem' }}>Active</div>
            </div>
          </div>
        ))}
        
        {/* Mock Asset Lookup */}
        <div className="glass" style={{ 
          padding: '1.5rem', 
          background: 'rgba(255,255,255,0.01)',
          borderStyle: 'dashed',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          gridColumn: 'span 4'
        }}>
          <div style={{ fontWeight: 600, opacity: 0.6 }}>Explorar Mercado</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Símbolo (ej. AAPL)" 
              style={{ 
                flex: 1,
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--glass-border)',
                borderRadius: '0.5rem',
                padding: '0.5rem',
                color: 'white'
              }} 
            />
            <button style={{ 
              background: 'hsl(var(--primary))',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              color: 'white',
              cursor: 'pointer'
            }}>Buscar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetExplorer;
