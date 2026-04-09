export const fetchDolarRate = async (fetchImpl = fetch) => {
  try {
    const res = await fetchImpl('https://dolarapi.com/v1/dolares/oficial');
    if (res.ok) {
      const data = await res.json();
      return data.venta;
    }
  } catch (e) {}
  return 1000;
};
