import { test } from 'node:test';
import assert from 'node:assert';
import { fetchDolarRate, fetchWallbitRate, fetchDolarApiRates } from './dolar.js';

test('fetchDolarRate returns venta value on success', async (t) => {
  const mockFetch = async (url, options) => {
    assert.strictEqual(url, 'https://dolarapi.com/v1/dolares/oficial');
    assert.ok(options?.signal, 'AbortSignal should be passed as signal option');
    return {
      ok: true,
      json: async () => ({ venta: 1234.56 })
    };
  };

  const rate = await fetchDolarRate(mockFetch);
  assert.strictEqual(rate, 1234.56);
});

test('fetchDolarRate returns 1000 when fetch throws error', async (t) => {
  const mockFetch = async () => {
    throw new Error('Network error');
  };

  const rate = await fetchDolarRate(mockFetch);
  assert.strictEqual(rate, 1000);
});

test('fetchDolarRate returns 1000 when response is not ok', async (t) => {
  const mockFetch = async () => {
    return {
      ok: false,
      status: 500
    };
  };

  const rate = await fetchDolarRate(mockFetch);
  assert.strictEqual(rate, 1000);
});

test('fetchDolarRate returns 1000 when json parsing fails', async (t) => {
  const mockFetch = async () => {
    return {
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      }
    };
  };

  const rate = await fetchDolarRate(mockFetch);
  assert.strictEqual(rate, 1000);
});

test('fetchWallbitRate returns rate, buyRate, and updatedAt on success', async (t) => {
  const mockFetch = async (url) => {
    if (url.includes('source_currency=USD&dest_currency=ARS')) {
      return {
        ok: true,
        json: async () => ({ data: { rate: 1580.50, updated_at: '2026-10-14T17:00:00Z' } })
      };
    }
    if (url.includes('source_currency=ARS&dest_currency=USD')) {
      return {
        ok: true,
        json: async () => ({ data: { rate: 1540.20, updated_at: '2026-10-14T17:00:00Z' } })
      };
    }
    return { ok: false, status: 404 };
  };

  const result = await fetchWallbitRate('test-key', mockFetch);
  assert.strictEqual(result.rate, 1580.50);
  assert.strictEqual(result.buyRate, 1540.20);
  assert.strictEqual(result.updatedAt, '2026-10-14T17:00:00Z');
});

test('fetchWallbitRate returns null fields on 429 or error instead of fallback', async (t) => {
  const mockFetch = async () => {
    return {
      ok: false,
      status: 429
    };
  };

  const result = await fetchWallbitRate('test-key', mockFetch);
  assert.strictEqual(result.rate, null);
  assert.strictEqual(result.buyRate, null);
  assert.strictEqual(result.updatedAt, null);
});

test('fetchDolarApiRates returns oficial and ccl on success', async (t) => {
  const mockFetch = async (url) => {
    if (url.includes('/oficial')) {
      return { ok: true, json: async () => ({ venta: 1450 }) };
    }
    if (url.includes('/contadoconliqui')) {
      return { ok: true, json: async () => ({ venta: 1580 }) };
    }
    return { ok: false, status: 404 };
  };

  const result = await fetchDolarApiRates(mockFetch);
  assert.strictEqual(result.oficial, 1450);
  assert.strictEqual(result.ccl, 1580);
});
