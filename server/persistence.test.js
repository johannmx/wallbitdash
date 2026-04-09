import { test } from 'node:test';
import assert from 'node:assert';
import { saveToPersistence } from './persistence.js';

test('saveToPersistence handles write errors gracefully', (t) => {
  const mockFs = {
    writeFileSync: () => {
      throw new Error('Disk full');
    }
  };
  const mockDataPath = '/mock/path';
  const mockCache = { data: 'test' };

  let successCalled = false;
  const onSuccess = () => { successCalled = true; };

  // This should not throw because of the try-catch in saveToPersistence
  saveToPersistence(mockFs, mockDataPath, mockCache, onSuccess);

  assert.strictEqual(successCalled, false, 'onSuccess should not be called on error');
});

test('saveToPersistence calls onSuccess on success', (t) => {
  const mockFs = {
    writeFileSync: () => { /* success */ }
  };
  const mockDataPath = '/mock/path';
  const mockCache = { data: 'test' };

  let successCalled = false;
  const onSuccess = () => { successCalled = true; };

  saveToPersistence(mockFs, mockDataPath, mockCache, onSuccess);

  assert.strictEqual(successCalled, true, 'onSuccess should be called on success');
});
