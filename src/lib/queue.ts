/**
 * Queue offline usando IndexedDB
 * Para sincronização quando voltar online
 */

export interface QueueItem {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  createdAt: number;
  retries: number;
  maxRetries: number;
}

export class OfflineQueue {
  private dbName = 'nexus_play_queue';
  private dbVersion = 1;
  private storeName = 'queue';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async add(item: Omit<QueueItem, 'id' | 'createdAt' | 'retries'>): Promise<void> {
    if (!this.db) await this.init();
    
    const queueItem: QueueItem = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      retries: 0,
      maxRetries: 3,
      ...item
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(queueItem);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(): Promise<QueueItem[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async remove(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async incrementRetries(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.retries += 1;
          const putRequest = store.put(item);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async processQueue(): Promise<void> {
    const items = await this.getAll();
    
    for (const item of items) {
      if (item.retries >= item.maxRetries) {
        await this.remove(item.id);
        continue;
      }

      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body ? JSON.stringify(item.body) : undefined
        });

        if (response.ok) {
          await this.remove(item.id);
        } else {
          await this.incrementRetries(item.id);
        }
      } catch (error) {
        console.error('Error processing queue item:', error);
        await this.incrementRetries(item.id);
      }
    }
  }
}

export const offlineQueue = new OfflineQueue();
