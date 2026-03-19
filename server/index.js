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
  recentExpenses: {
    title: "Gastos últimos 30 días",
    subtitle: "Consumo total (USD)",
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
const API_BASE = 'https://api.wallbit.io/api/public/v1';

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
    // Migration: rename brazilTrip to recentExpenses if old data exists
    if (savedData.brazilTrip) {
      savedData.recentExpenses = {
        ...dataTemplate.recentExpenses,
        transactions: savedData.brazilTrip.transactions || []
      };
      delete savedData.brazilTrip;
    }
    cache = { ...dataTemplate, ...savedData };
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

const fetchAllTransactions = async (headers) => {
  let allTransactions = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(`${API_BASE}/transactions?page=${page}`, { headers });
    
    if (!res.ok) {
      console.error(`❌ Error fetching page ${page}: ${res.status}`);
      break;
    }

    const json = await res.json();
    const txs = Array.isArray(json.data) ? json.data : (json.data?.data || []);

    if (txs.length === 0) {
      hasMore = false;
    } else {
      allTransactions = [...allTransactions, ...txs];
      if (txs.length < 10) {
        hasMore = false;
      } else {
        page++;
      }
    }
    if (page > 30) hasMore = false;
  }

  return allTransactions;
};

const fetchDolarRate = async () => {
  try {
    const res = await fetch('https://dolarapi.com/v1/dolares/oficial');
    if (res.ok) {
      const data = await res.json();
      return data.venta;
    }
  } catch (e) {
    console.warn('⚠️ Could not fetch ARS/USD rate, using fallback 1000.');
  }
  return 1000;
};

const fetchWallbitData = async () => {
  if (!API_KEY) {
    console.warn('⚠️ No WALLBIT_API_KEY provided.');
    return;
  }

  const headers = { 'X-API-Key': API_KEY };
  console.log('🔄 Refreshing data from Wallbit API...');

  try {
    const arsRate = await fetchDolarRate();
    console.log(`💵 Current ARS/USD Rate: ${arsRate}`);

    // 1. Fetch Checking Balance
    const checkingRes = await fetch(`${API_BASE}/balance/checking`, { headers });
    if (checkingRes.ok) {
      const json = await checkingRes.json();
      const item = json.data;
      cache.checking = { balance: item.balance || "0.00", currency: item.currency || "USD" };
    }

    // 2. Fetch Stocks Balance
    const stocksRes = await fetch(`${API_BASE}/balance/stocks`, { headers });
    if (stocksRes.ok) {
      const json = await stocksRes.json();
      const item = json.data;
      cache.stocks = { 
        balance: item.balance || "0.00", 
        currency: item.currency || "USD",
        assets: item.assets || [] 
      };
    }

    // 3. Fetch ALL Transactions (Paginated)
    const txsRaw = await fetchAllTransactions(headers);
    
    // 4. Map Transactions
    const mappedTxs = txsRaw.map(tx => ({
      uuid: tx.uuid,
      type: tx.type,
      amount: tx.source_amount || tx.amount,
      currency: (tx.source_currency?.code || tx.currency || 'USD'),
      status: tx.status,
      date: (tx.created_at || tx.date).split('T')[0],
      description: (tx.external_address || tx.comment || tx.description || '').trim()
    }));

    // 5. Process Recent Expenses (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expenseTypes = ['card_spent', 'pay_qr', 'internal_transfer', 'wire_transfer_out', 'withdrawal'];
    
    const recentExpenses = mappedTxs.filter(tx => {
       const d = new Date(tx.date);
       // Check if it's an expense (approx logic)
       const isExpense = expenseTypes.includes(tx.type.toLowerCase()) || tx.type.toLowerCase().includes('spent');
       return d >= thirtyDaysAgo && isExpense;
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate total in USD
    const totalInUSD = recentExpenses.reduce((sum, tx) => {
      let val = parseFloat(tx.amount);
      if (tx.currency === 'ARS') {
        val = val / arsRate;
      }
      return sum + val;
    }, 0).toFixed(2);

    // 6. Update Cache
    cache.transactions = mappedTxs;
    cache.recentExpenses = {
      ...dataTemplate.recentExpenses,
      totalSpent: totalInUSD,
      transactions: recentExpenses
    };
    cache.lastUpdated = new Date().toISOString();

    saveToPersistence();
    console.log(`✅ Success: Updated balances and ${mappedTxs.length} transactions (${recentExpenses.length} recent).`);

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
