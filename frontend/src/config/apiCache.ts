interface CacheEntry {
  data: any;
  timestamp: number;
}

const cacheMap = new Map<string, CacheEntry>();

export const getCachedData = (key: string): any | null => {
  const entry = cacheMap.get(key);
  if (!entry) return null;
  return entry.data;
};

export const setCachedData = (key: string, data: any): void => {
  cacheMap.set(key, { data, timestamp: Date.now() });
};

export const clearApiCache = (keyPrefix?: string): void => {
  if (!keyPrefix) {
    cacheMap.clear();
    return;
  }
  for (const key of cacheMap.keys()) {
    if (key.startsWith(keyPrefix)) {
      cacheMap.delete(key);
    }
  }
};
