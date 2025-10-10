import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ScannedProduct } from '@/types/barcode';

interface BarcodeCacheDB extends DBSchema {
  products: {
    key: string; // barcode
    value: {
      barcode: string;
      product: ScannedProduct;
      cachedAt: number;
      expiresAt: number;
    };
    indexes: { 'by-expiry': number };
  };
}

const DB_NAME = 'barcode-cache';
const DB_VERSION = 1;
const STORE_NAME = 'products';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

class BarcodeCacheService {
  private db: IDBPDatabase<BarcodeCacheDB> | null = null;

  async init() {
    if (this.db) return this.db;

    this.db = await openDB<BarcodeCacheDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'barcode' });
        store.createIndex('by-expiry', 'expiresAt');
      },
    });

    // Clean expired cache on init
    await this.cleanExpired();

    return this.db;
  }

  async get(barcode: string): Promise<ScannedProduct | null> {
    const db = await this.init();
    const cached = await db.get(STORE_NAME, barcode);

    if (!cached) return null;

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      await this.delete(barcode);
      return null;
    }

    console.log('✅ Cache HIT for barcode:', barcode);
    return cached.product;
  }

  async set(barcode: string, product: ScannedProduct): Promise<void> {
    const db = await this.init();
    const now = Date.now();

    await db.put(STORE_NAME, {
      barcode,
      product,
      cachedAt: now,
      expiresAt: now + CACHE_DURATION,
    });

    console.log('💾 Cached barcode:', barcode);
  }

  async delete(barcode: string): Promise<void> {
    const db = await this.init();
    await db.delete(STORE_NAME, barcode);
  }

  async cleanExpired(): Promise<void> {
    const db = await this.init();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const index = tx.store.index('by-expiry');
    const now = Date.now();

    let cursor = await index.openCursor(IDBKeyRange.upperBound(now));

    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }

    await tx.done;
    console.log('🧹 Cleaned expired cache entries');
  }

  async clear(): Promise<void> {
    const db = await this.init();
    await db.clear(STORE_NAME);
    console.log('🗑️ Cleared all cache');
  }

  async getStats(): Promise<{
    totalItems: number;
    cacheSize: number;
    oldestItem: number | null;
    newestItem: number | null;
  }> {
    const db = await this.init();
    const allItems = await db.getAll(STORE_NAME);

    const timestamps = allItems.map(item => item.cachedAt);

    return {
      totalItems: allItems.length,
      cacheSize: JSON.stringify(allItems).length,
      oldestItem: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestItem: timestamps.length > 0 ? Math.max(...timestamps) : null,
    };
  }
}

export const barcodeCache = new BarcodeCacheService();
