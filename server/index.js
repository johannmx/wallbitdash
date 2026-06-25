import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { saveToPersistence as saveToPersistenceLib } from './persistence.js';
import { fetchWallbitRate } from './dolar.js';
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

// Security Enhancement: Global Rate Limiting to prevent DoS attacks and brute-force scanning
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

// Security Enhancement: Fail-closed approach for CORS configuration in production
const defaultOrigins = process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173'];
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : defaultOrigins;
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    const safeOrigin = String(origin).replace(/[\r\n]/g, '');
    console.warn(`🔒 CORS blocked request from unauthorized origin: ${safeOrigin}`);
    return callback(new Error('CORS blocked'), false);
  }
}));

// Security Enhancement: Limit JSON payload size to 10kb to prevent Denial of Service (DoS) attacks
app.use(express.json({ limit: '10kb' }));

// Catch malformed JSON payloads specifically to prevent stack trace leaks
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.warn(`🔒 Audit: Malformed JSON payload from IP: ${String(req.ip || 'Unknown').replace(/[\r\n]/g, '')}`);
    return res.status(400).json({ error: 'Bad Request: Malformed JSON payload' });
  }
  // Security Enhancement: Handle Payload Too Large errors gracefully to prevent stack trace leaks
  if (err.type === 'entity.too.large') {
    console.warn(`🔒 Audit: Payload Too Large from IP: ${String(req.ip || 'Unknown').replace(/[\r\n]/g, '')}`);
    return res.status(413).json({ error: 'Payload Too Large' });
  }
  next(err);
});

// Auth Middleware
const authMiddleware = (req, res, next) => {
  if (!DASHBOARD_TOKEN) {
    console.error('❌ DASHBOARD_TOKEN is not configured. Access denied.');
    return res.status(500).json({ error: 'Internal Server Error: Security misconfiguration' });
  }
  const token = req.headers['x-dashboard-token'];

  // Security Enhancement: Input validation & length limit to prevent DoS via large payload hashing
  if (!token || typeof token !== 'string') {
    console.warn(`🔒 Audit: Failed authentication attempt (No token) from IP: ${String(req.ip || 'Unknown').replace(/[\r\n]/g, '')}`);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  if (token.length > 256) {
    console.warn(`🔒 Audit: Failed authentication attempt (Token too long) from IP: ${String(req.ip || 'Unknown').replace(/[\r\n]/g, '')}`);
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

  console.warn(`🔒 Audit: Failed authentication attempt (Invalid token) from IP: ${String(req.ip || 'Unknown').replace(/[\r\n]/g, '')}`);
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
  saveToPersistenceLib(fs, DATA_PATH, cache, () => {
    persistenceExists = true;
  });
};

// --- Wallbit API Helpers ---

const fetchWithTimeout = async (url, options = {}) => {
  const { timeout = 10000, ...fetchOptions } = options;
  return fetch(url, {
    ...fetchOptions,
    signal: AbortSignal.timeout(timeout)
  });
};

const fetchAllTransactions = async (headers) => {
  let allTransactions = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await fetchWithTimeout(`${API_BASE}/transactions?page=${page}`, { headers, timeout: 15000 });
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

const fetchWallbitData = async () => {
  if (!API_KEY) return;

  const headers = { 'X-API-Key': API_KEY };
  console.log('🔄 Refreshing data from Wallbit API...');

  try {
    // Performance Optimization: Fetch checking balance, stocks balance, exchange rate, and transactions
    // concurrently. This reduces network serialization overhead and overall latency by up to ~75% (saving seconds
    // per synchronization cycle) while adding fault tolerance so a single endpoint failure doesn't block the others.
    const [rateResult, checkingRes, stocksRes, txsRaw] = await Promise.all([
      fetchWallbitRate(API_KEY).catch(error => {
        console.error('⚠️ Failed to fetch Wallbit rate:', error.message);
        return { rate: cache.arsRate || 1000, updatedAt: cache.arsRateUpdatedAt || null };
      }),
      fetchWithTimeout(`${API_BASE}/balance/checking`, { headers }).catch(error => {
        console.error('⚠️ Failed to fetch Checking balance:', error.message);
        return null;
      }),
      fetchWithTimeout(`${API_BASE}/balance/stocks`, { headers }).catch(error => {
        console.error('⚠️ Failed to fetch Stocks balance:', error.message);
        return null;
      }),
      fetchAllTransactions(headers).catch(error => {
        console.error('⚠️ Failed to fetch transactions:', error.message);
        return [];
      })
    ]);

    const { rate: arsRate, updatedAt: arsRateUpdatedAt } = rateResult;

    // 1. Process Checking Balance
    if (checkingRes && checkingRes.ok) {
      const json = await checkingRes.json();
      const item = (json.data && json.data[0]) || { balance: "0.00", currency: "USD" };
      cache.checking = { balance: item.balance, currency: item.currency };
    }

    // 2. Process Stocks Balance
    if (stocksRes && stocksRes.ok) {
      const json = await stocksRes.json();
      const item = (json.data && json.data[0]) || { shares: "0.00", symbol: "USD" };
      cache.stocks = { 
        balance: item.shares || item.balance || "0.00", 
        currency: item.symbol || item.currency || "USD",
        assets: json.data || [] 
      };
    }
    
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
        timestamp: new Date(tx.created_at || tx.date).getTime(),
        description: desc
      };
    });

    // 5. Process Recent Expenses (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const expenseTypes = ['card_spent', 'pay_qr', 'internal_transfer', 'wire_transfer_out', 'withdrawal', 'withdrawal_local'];
    
    const sevenDaysAgoTime = sevenDaysAgo.getTime();
    const recentExpenses = mappedTxs.filter(tx => {
       const isExpense = expenseTypes.includes(tx.type.toLowerCase()) || tx.type.toLowerCase().includes('spent');
       return tx.timestamp >= sevenDaysAgoTime && isExpense && (tx.status === 'COMPLETED' || tx.status === 'PENDING');
    }).sort((a,b) => b.timestamp - a.timestamp);

    const totalInUSD = recentExpenses.reduce((sum, tx) => {
      let val = parseFloat(tx.amount);
      if (tx.currency === 'ARS') val /= arsRate;
      return sum + val;
    }, 0).toFixed(2);

    // 6. Update Cache
    cache.arsRate = arsRate;
    cache.arsRateUpdatedAt = arsRateUpdatedAt;
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
  // Security Enhancement: Prevent caching of sensitive financial data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  res.json({
    ...cache,
    _cacheInfo: {
      lastUpdated: cache.lastUpdated || 'Never',
      persistent: persistenceExists
    }
  });
});

// Security Enhancement: Catch-all 404 handler to prevent Express from leaking framework details via default HTML responses
app.use((req, res) => {
  const safeUrl = String(req.originalUrl).replace(/[\r\n]/g, '');
  console.warn(`🔒 Audit: 404 Not Found on ${req.method} ${safeUrl} from IP: ${String(req.ip || 'Unknown').replace(/[\r\n]/g, '')}`);
  res.status(404).json({ error: 'Not Found' });
});

// Security Enhancement: Global error handler to prevent stack trace leaks
// Ensures errors return secure JSON responses instead of exposing internals via HTML
app.use((err, req, res, next) => {
  console.error('🚨 Error caught by global handler:', err.message);

  if (res.headersSent) {
    return next(err);
  }

  if (err.message === 'CORS blocked') {
    return res.status(403).json({ error: 'Forbidden: CORS policy violation' });
  }

  // Fail securely: Never leak stack traces to the client
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Cache Server running at http://0.0.0.0:${PORT}`);
});
