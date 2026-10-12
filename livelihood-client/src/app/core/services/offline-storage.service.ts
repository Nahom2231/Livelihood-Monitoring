import { Injectable } from '@angular/core';

export interface LocalTransaction {
  clientSyncId: string;
  beneficiaryProfileId: string;
  type: number; // 0: Sale, 1: OperationalExpense, 2: InventoryPurchase, 3: SavingsContribution
  amount: number;
  description: string;
  occurredAtUtc: string;
  synced: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineStorageService {
  private readonly dbName = 'LivelihoodMonitoringDB';
  private readonly storeName = 'transactions';
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initIndexedDb();
  }

  private initIndexedDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'clientSyncId' });
          store.createIndex('synced', 'synced', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addTransaction(item: LocalTransaction): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getPendingTransactions(): Promise<LocalTransaction[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.getAll();
      req.onsuccess = () => {
        const records = (req.result as LocalTransaction[]).filter(x => !x.synced);
        resolve(records);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getAllTransactions(): Promise<LocalTransaction[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as LocalTransaction[]) || []);
      req.onerror = () => reject(req.error);
    });
  }

  async markAsSynced(clientSyncIds: string[]): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);

      clientSyncIds.forEach(id => {
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          if (getReq.result) {
            const updated = { ...getReq.result, synced: true };
            store.put(updated);
          }
        };
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}