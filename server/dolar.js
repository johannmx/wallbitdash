export const fetchWallbitRate = async (apiKey, fetchImpl = fetch) => {
  let rate = 1000;
  let buyRate = 1000;
  let updatedAt = null;
  try {
    const [resSell, resBuy] = await Promise.all([
      fetchImpl('https://api.wallbit.io/api/public/v1/rates?source_currency=USD&dest_currency=ARS', {
        headers: { 'X-API-Key': apiKey },
        signal: AbortSignal.timeout(5000)
      }),
      fetchImpl('https://api.wallbit.io/api/public/v1/rates?source_currency=ARS&dest_currency=USD', {
        headers: { 'X-API-Key': apiKey },
        signal: AbortSignal.timeout(5000)
      })
    ]);

    if (resSell.ok) {
      const json = await resSell.json();
      rate = json.data.rate;
      updatedAt = json.data.updated_at;
    }
    if (resBuy.ok) {
      const json = await resBuy.json();
      const rawRate = json.data.rate;
      if (rawRate && rawRate !== 0) {
        buyRate = 1 / rawRate;
      }
    }
    return { rate, buyRate, updatedAt };
  } catch (e) {
    console.warn('⚠️ Wallbit rates endpoint failed, using fallback.');
  }
  return { rate: 1000, buyRate: 1000, updatedAt: null };
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
