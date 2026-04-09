import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initial template structure
const dataTemplate = {
  checking: { balance: "0.00", currency: "USD" },
  stocks: { balance: "0.00", currency: "USD", assets: [] },
  recentExpenses: {
    title: "Gastos últimos 7 días",
    subtitle: "Consumo total (USD)",
    totalSpent: "0.00",
    currency: "USD",
    transactions: []
  },
  transactions: []
};

const app = express();
app.set('trust proxy', 1);
const PORT = 3001;
const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, '../data/data.json');
const API_KEY = process.env.WALLBIT_API_KEY;
const API_BASE = 'https://api.wallbit.io/api/public/v1';
const DASHBOARD_TOKEN = process.env.DASHBOARD_TOKEN;

if (!DASHBOARD_TOKEN) {
  console.error('CRITICAL ERROR: DASHBOARD_TOKEN environment variable is not set!');
  console.error('The application will now exit to prevent unauthenticated access.');
  process.exit(1);
}

// Security Middlewares
app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked'), false);
  }
}));

app.use(express.json());

// Auth Middleware
const authMiddleware = (req, res, next) => {
  if (!DASHBOARD_TOKEN) {
    console.error('❌ DASHBOARD_TOKEN is not configured. Access denied.');
    return res.status(500).json({ error: 'Internal Server Error: Security misconfiguration' });
  }
  const token = req.headers['x-dashboard-token'];
  if (!token || typeof token !== 'string') {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  // Prevent timing attacks by using constant-time comparison
  // Hashing first ensures equal lengths before comparison
  try {
    const expectedHash = crypto.createHash('sha256').update(String(DASHBOARD_TOKEN)).digest();
    const tokenHash = crypto.createHash('sha256').update(token).digest();

    if (crypto.timingSafeEqual(expectedHash, tokenHash)) {
      return next();
    }
  } catch (error) {
    console.error('Auth verification error:', error);
  }
  return res.status(401).json({ error: 'Unauthorized: Invalid token' });
};

// Ensure data directory exists
const dataDir = path.dirname(DATA_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Cache state
let cache = dataTemplate;
let persistenceExists = false;

// Load from persistence if available
if (fs.existsSync(DATA_PATH)) {
  persistenceExists = true;
  try {
    const savedData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    cache = { ...dataTemplate, ...savedData };
    console.log('✅ Loaded data from persistence.');
  } catch (e) {
    console.warn('⚠️ Could not load persistence file, starting fresh.');
  }
}

const saveToPersistence = () => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(cache, null, 2));
    persistenceExists = true;
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
    if (!res.ok) break;

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
  } catch (e) {}
  return 1000;
};

const fetchWallbitData = async () => {
  if (!API_KEY) return;

  const headers = { 'X-API-Key': API_KEY };
  console.log('🔄 Refreshing data from Wallbit API...');

  try {
    const arsRate = await fetchDolarRate();

    // 1. Fetch Checking Balance
    const checkingRes = await fetch(`${API_BASE}/balance/checking`, { headers });
    if (checkingRes.ok) {
      const json = await checkingRes.json();
      const item = (json.data && json.data[0]) || { balance: "0.00", currency: "USD" };
      cache.checking = { balance: item.balance, currency: item.currency };
    }

    // 2. Fetch Stocks Balance
    const stocksRes = await fetch(`${API_BASE}/balance/stocks`, { headers });
    if (stocksRes.ok) {
      const json = await stocksRes.json();
      const item = (json.data && json.data[0]) || { shares: "0.00", symbol: "USD" };
      cache.stocks = { 
        balance: item.shares || item.balance || "0.00", 
        currency: item.symbol || item.currency || "USD",
        assets: json.data || [] 
      };
    }

    // 3. Fetch ALL Transactions
    const txsRaw = await fetchAllTransactions(headers);
    
    // 4. Map Transactions
    const mappedTxs = txsRaw.map(tx => {
      let desc = (tx.external_address || tx.comment || tx.description || '').trim();
      if (!desc) {
        if (tx.type === 'WITHDRAWAL_LOCAL') desc = 'Retiro local';
        else if (tx.type === 'INVESTMENT_WITHDRAWAL') desc = 'Retiro de inversión';
        else if (tx.type === 'INVESTMENT_DEPOSIT') desc = 'Depósito de inversión';
      }
      return {
        uuid: tx.uuid,
        type: tx.type,
        amount: tx.source_amount || tx.amount,
        currency: (tx.source_currency?.code || tx.currency || 'USD'),
        status: tx.status,
        date: (tx.created_at || tx.date).split('T')[0],
        description: desc
      };
    });

    // 5. Process Recent Expenses (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const expenseTypes = ['card_spent', 'pay_qr', 'internal_transfer', 'wire_transfer_out', 'withdrawal', 'withdrawal_local'];
    
    const recentExpenses = mappedTxs.filter(tx => {
       const d = new Date(tx.date);
       const isExpense = expenseTypes.includes(tx.type.toLowerCase()) || tx.type.toLowerCase().includes('spent');
       return d >= sevenDaysAgo && isExpense && (tx.status === 'COMPLETED' || tx.status === 'PENDING');
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalInUSD = recentExpenses.reduce((sum, tx) => {
      let val = parseFloat(tx.amount);
      if (tx.currency === 'ARS') val /= arsRate;
      return sum + val;
    }, 0).toFixed(2);

    // 6. Update Cache
    cache.arsRate = arsRate;
    cache.transactions = mappedTxs;
    cache.recentExpenses = {
      title: "Gastos últimos 7 días",
      subtitle: "Consumo total (USD)",
      totalSpent: totalInUSD,
      currency: "USD",
      transactions: recentExpenses
    };
    cache.lastUpdated = new Date().toISOString();

    saveToPersistence();
    console.log(`✅ Success: Aggregated ${mappedTxs.length} transactions (${recentExpenses.length} recent 7-day).`);

  } catch (error) {
    console.error('❌ Wallbit API Fetch Failed:', error.message);
  }
};

cron.schedule('*/5 * * * *', fetchWallbitData);
fetchWallbitData();

const dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.get('/api/dashboard', dashboardLimiter, authMiddleware, (req, res) => {
  res.json({
    ...cache,
    _cacheInfo: {
      lastUpdated: cache.lastUpdated || 'Never',
      persistent: persistenceExists
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Cache Server running at http://0.0.0.0:${PORT}`);
});
