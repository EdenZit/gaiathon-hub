declare module 'lru-cache' {
  export interface LRUCacheOptions<K = any, V = any> {
    max?: number;
    ttl?: number;
    maxSize?: number;
    sizeCalculation?: (value: V, key: K) => number;
    dispose?: (value: V, key: K) => void;
    noDisposeOnSet?: boolean;
    updateAgeOnGet?: boolean;
  }

  export default class LRUCache<K = any, V = any> {
    constructor(options?: LRUCacheOptions<K, V>);
    set(key: K, value: V, options?: { ttl?: number }): boolean;
    get(key: K): V | undefined;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
    entries(): IterableIterator<[K, V]>;
    forEach(callbackfn: (value: V, key: K, map: LRUCache<K, V>) => void, thisArg?: any): void;
    readonly size: number;
  }
} 