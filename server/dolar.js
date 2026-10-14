const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchWallbitRate = async (apiKey, fetchImpl = fetch) => {
  let rate = null;
  let buyRate = null;
  let updatedAt = null;
  const headers = { 
    'X-API-Key': apiKey, 
    'Accept': 'application/json',
    'User-Agent': 'WallbitDashboard/1.0 (Mozilla/5.0; compatible)'
  };

  try {
    const resSell = await fetchImpl('https://api.wallbit.io/api/public/v1/rates?source_currency=USD&dest_currency=ARS', {
      headers,
      signal: AbortSignal.timeout(6000)
    });

    if (resSell.ok) {
      const json = await resSell.json();
      rate = json?.data?.rate ?? null;
      updatedAt = json?.data?.updated_at ?? null;
    } else if (resSell.status === 429) {
      const retryAfter = resSell.headers?.get?.('retry-after') || 'N/A';
      const body = await resSell.text?.().catch(() => '') || '';
      console.warn(`⚠️ Wallbit sell rate returned 429 (Retry-After: ${retryAfter}). Body: ${body}`);
      return { rate: null, buyRate: null, updatedAt: null, rateLimited: true, retryAfter };
    }

    // Delay between requests to avoid burst rate limit
    await sleep(750);

    const resBuy = await fetchImpl('https://api.wallbit.io/api/public/v1/rates?source_currency=ARS&dest_currency=USD', {
      headers,
      signal: AbortSignal.timeout(6000)
    });

    if (resBuy.ok) {
      const json = await resBuy.json();
      buyRate = json?.data?.rate ?? null;
    } else if (resBuy.status === 429) {
      const retryAfter = resBuy.headers?.get?.('retry-after') || 'N/A';
      console.warn(`⚠️ Wallbit buy rate returned 429 (Retry-After: ${retryAfter})`);
    }

    return { rate, buyRate, updatedAt };
  } catch (e) {
    console.warn('⚠️ Wallbit rates endpoint failed:', e.message);
  }
  return { rate: null, buyRate: null, updatedAt: null };
};

export const fetchDolarApiRates = async (fetchImpl = fetch) => {
  try {
    const [resOfi, resCcl] = await Promise.allSettled([
      fetchImpl('https://dolarapi.com/v1/dolares/oficial', { signal: AbortSignal.timeout(5000) }),
      fetchImpl('https://dolarapi.com/v1/dolares/contadoconliqui', { signal: AbortSignal.timeout(5000) })
    ]);
    let oficial = null;
    let ccl = null;
    if (resOfi.status === 'fulfilled' && resOfi.value.ok) {
      const data = await resOfi.value.json();
      oficial = data.venta ?? null;
    }
    if (resCcl.status === 'fulfilled' && resCcl.value.ok) {
      const data = await resCcl.value.json();
      ccl = data.venta ?? null;
    }
    return { oficial, ccl };
  } catch (e) {
    console.warn('⚠️ DolarApi fetch failed:', e.message);
    return { oficial: null, ccl: null };
  }
};


// Legacy export kept for backwards compatibility with existing dolar.test.js
export const fetchDolarRate = async (fetchImpl = fetch) => {
  try {
    const res = await fetchImpl('https://dolarapi.com/v1/dolares/oficial', {
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const json = await res.json();
      return json.venta;
    }
  } catch (e) {
    console.warn('⚠️ Wallbit rates endpoint failed, using fallback.');
  }
  return 1000;
};
