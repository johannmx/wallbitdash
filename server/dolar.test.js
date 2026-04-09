import { test } from 'node:test';
import assert from 'node:assert';
import { fetchDolarRate } from './dolar.js';

test('fetchDolarRate returns venta value on success', async (t) => {
  const mockFetch = async (url) => {
    assert.strictEqual(url, 'https://dolarapi.com/v1/dolares/oficial');
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
