const cache = new Map<string, { ts: number; ttl: number; value: any }>();

export function setCache(key: string, value: any, ttl = 1000 * 60) {
  cache.set(key, { ts: Date.now(), ttl, value });
}

export function getCache(key: string) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.ts > item.ttl) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

export function clearCache() {
  cache.clear();
}

export function deleteCache(key: string) {
  cache.delete(key);
}

export default cache;
