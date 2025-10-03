type CacheRecord<T> = { value: T; expireAt: number };

export class MemoryCache<T = unknown> {
  private store = new Map<string, CacheRecord<T>>();

  get(key: string): { hit: boolean; value?: T } {
    const rec = this.store.get(key);
    if (!rec) return { hit: false };
    if (rec.expireAt > Date.now()) return { hit: true, value: rec.value };
    this.store.delete(key);
    return { hit: false };
  }

  set(key: string, value: T, ttlMs: number) {
    this.store.set(key, { value, expireAt: Date.now() + Math.max(0, ttlMs) });
  }

  delete(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}
