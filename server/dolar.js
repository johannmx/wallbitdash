export const fetchWallbitRate = async (apiKey, fetchImpl = fetch) => {
  try {
    const res = await fetchImpl('https://api.wallbit.io/api/public/v1/rates', {
      headers: { 'X-API-Key': apiKey },
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const json = await res.json();
      const { rate, updated_at } = json.data;
      return { rate, updatedAt: updated_at };
    }
  } catch (e) {
    console.warn('⚠️ Wallbit rates endpoint failed, using fallback.');
  }
  return { rate: 1000, updatedAt: null };
};

// Legacy export kept for backwards compatibility with existing dolar.test.js
export const fetchDolarRate = async (fetchImpl = fetch) => {
  const { rate } = await fetchWallbitRate(null, fetchImpl);
  return rate;
};
