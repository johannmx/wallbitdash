export const saveToPersistence = (fs, dataPath, cache, onSuccess) => {
  try {
    // 🛡️ Sentinel: Restrict file permissions to owner-only read/write (mode 0o600) to protect sensitive financial records
    fs.writeFileSync(dataPath, JSON.stringify(cache, null, 2), { mode: 0o600 });
    if (onSuccess) onSuccess();
    console.log('💾 Data persisted to disk.');
  } catch (e) {
    console.error('❌ Persistence error:', e.message);
  }
};
