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
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  };

  const req = { headers: headerToken ? { 'x-dashboard-token': headerToken } : {} };
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

console.log('All tests passed!');
