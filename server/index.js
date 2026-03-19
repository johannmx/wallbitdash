import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initial template structure
const dataTemplate = {
  checking: { balance: "0.00", currency: "USD" },
  stocks: { balance: "0.00", currency: "USD", assets: [] },
  brazilTrip: {
    title: "Gastos último Viaje",
    subtitle: "Viaje a Brasil (Oct-Nov 2025)",
    dateRange: "27/10/2025 - 03/11/2025",
    totalSpent: "0.00",
    currency: "USD",
    transactions: []
  },
  transactions: []
};

const app = express();
const PORT = 3001;
const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, '../data/data.json');
const API_KEY = process.env.WALLBIT_API_KEY;

app.use(cors());
app.use(express.json());

// Ensure data directory exists
const dataDir = path.dirname(DATA_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Cache state
let cache = dataTemplate;

// Load from persistence if available
if (fs.existsSync(DATA_PATH)) {
  try {
    const savedData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    cache = savedData;
    console.log('✅ Loaded data from persistence.');
  } catch (e) {
    console.warn('⚠️ Could not load persistence file, starting fresh.');
  }
}

const saveToPersistence = () => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(cache, null, 2));
    console.log('💾 Data persisted to disk.');
  } catch (e) {
    console.error('❌ Persistence error:', e.message);
  }
};

// --- Wallbit API Helpers ---
const fetchWallbitData = async () => {
  if (!API_KEY) {
    console.warn('⚠️ No WALLBIT_API_KEY provided. Skipping refresh.');
    return;
  }

  console.log('🔄 Refreshing data from Wallbit API...');
  try {
    // 1. Fetch Transactions
    const txRes = await fetch('https://api.wallbit.io/v1/transactions', {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    
    if (!txRes.ok) throw new Error(`API Error: ${txRes.status}`);
    
    const { data: txList } = await txRes.json();
    
    // 2. Map Transactions
    const mappedTxs = txList.data.map(tx => ({
      uuid: tx.uuid,
      type: tx.type,
      amount: tx.source_amount,
      currency: tx.source_currency.code,
      dest_amount: tx.dest_amount,
      dest_currency: tx.dest_currency.code,
      status: tx.status,
      date: tx.created_at.split('T')[0],
      description: (tx.external_address || tx.comment || '').trim()
    }));

    // 3. Process Brazil Trip logic
    const brazilTxs = mappedTxs.filter(tx => {
       const d = new Date(tx.date);
       const start = new Date('2025-10-27');
       const end = new Date('2025-11-03');
       return d >= start && d <= end;
    }).sort((a,b) => parseFloat(b.amount) - parseFloat(a.amount));

    const totalBrazil = brazilTxs.reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toFixed(2);

    // 4. Update Cache
    cache.transactions = mappedTxs;
    cache.brazilTrip.transactions = brazilTxs;
    cache.brazilTrip.totalSpent = totalBrazil;
    cache.lastUpdated = new Date().toISOString();

    saveToPersistence();
    console.log(`✅ Success: Fetched ${mappedTxs.length} transactions.`);

  } catch (error) {
    console.error('❌ Wallbit API Fetch Failed:', error.message);
  }
};

// background cron
cron.schedule('*/15 * * * *', fetchWallbitData);

// Initial fetch on start
fetchWallbitData();

app.get('/api/dashboard', (req, res) => {
  res.json({
    ...cache,
    _cacheInfo: {
      lastUpdated: cache.lastUpdated || 'Never',
      persistent: fs.existsSync(DATA_PATH)
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Cache Server running at http://0.0.0.0:${PORT}`);
  console.log(`📂 Persistence Path: ${DATA_PATH}`);
});
