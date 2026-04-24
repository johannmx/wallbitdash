import { test } from 'node:test';
import assert from 'node:assert';
import { fetchDolarRate } from './dolar.js';

test('fetchDolarRate returns venta value on success', async (t) => {
  const mockFetch = async (url) => {
    assert.strictEqual(url, 'https://api.wallbit.io/api/public/v1/rates?source_currency=ARS&dest_currency=USD');
    return {
      ok: true,
      json: async () => ({ data: { rate: 1234.56 } })
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
