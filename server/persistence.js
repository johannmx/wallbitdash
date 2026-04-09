export const saveToPersistence = (fs, dataPath, cache, onSuccess) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(cache, null, 2));
    if (onSuccess) onSuccess();
    console.log('💾 Data persisted to disk.');
  } catch (e) {
    console.error('❌ Persistence error:', e.message);
  }
};
