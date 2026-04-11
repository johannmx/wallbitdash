import crypto from 'crypto';

const testAuth = (envToken, headerToken) => {
  const DASHBOARD_TOKEN = envToken;

  const authMiddlewareMock = (req, res, next) => {
    if (!DASHBOARD_TOKEN) {
      console.error('❌ DASHBOARD_TOKEN is not configured. Access denied.');
      return res.status(500).json({ error: 'Internal Server Error: Security misconfiguration' });
    }
    const token = req.headers['x-dashboard-token'];
    if (!token || typeof token !== 'string') {
      console.warn(`🔒 Audit: Failed authentication attempt (No token) from IP: ${req.ip || 'Unknown'}`);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    if (token.length > 256) {
      console.warn(`🔒 Audit: Failed authentication attempt (Token too long) from IP: ${req.ip || 'Unknown'}`);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    try {
      const expectedHash = crypto.createHash('sha256').update(String(DASHBOARD_TOKEN)).digest();
      const tokenHash = crypto.createHash('sha256').update(token).digest();

      if (crypto.timingSafeEqual(expectedHash, tokenHash)) {
        return next();
      }
    } catch (error) {
      console.error('Auth verification error:', error);
    }

    console.warn(`🔒 Audit: Failed authentication attempt (Invalid token) from IP: ${req.ip || 'Unknown'}`);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  };

  const req = {
    headers: headerToken ? { 'x-dashboard-token': headerToken } : {},
    ip: '127.0.0.1'
  };
  let responseStatus = null;
  let responseBody = null;
  const res = {
    status: (code) => {
      responseStatus = code;
      return { json: (obj) => { responseBody = obj; } };
    }
  };
  let nextCalled = false;
  const next = () => { nextCalled = true; };

  authMiddlewareMock(req, res, next);
  return { nextCalled, responseStatus, responseBody };
};

console.log('Test 1: No token set in env (FIXED)');
const result1 = testAuth(undefined, undefined);
if (result1.nextCalled || result1.responseStatus !== 500) {
  console.error('Test 1 Failed');
  process.exit(1);
}

console.log('Test 2: Token set, no header');
const result2 = testAuth('secret', undefined);
if (result2.nextCalled || result2.responseStatus !== 401) {
  console.error('Test 2 Failed');
  process.exit(1);
}

console.log('Test 3: Token set, correct header');
const result3 = testAuth('secret', 'secret');
if (!result3.nextCalled) {
  console.error('Test 3 Failed');
  process.exit(1);
}

console.log('Test 4: Token too long');
const longToken = 'a'.repeat(300);
const result4 = testAuth('secret', longToken);
if (result4.nextCalled || result4.responseStatus !== 401) {
  console.error('Test 4 Failed');
  process.exit(1);
}

console.log('All tests passed!');
