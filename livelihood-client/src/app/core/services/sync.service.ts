import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OfflineStorageService } from './offline-storage.service';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';

interface SyncPayload {
  items: {
    clientSyncId: string;
    beneficiaryProfileId: string;
    type: number;
    amount: number;
    description: string;
    occurredAtUtc: string;
  }[];
}

interface SyncResponse {
  processedCount: number;
  successfullySyncedIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(OfflineStorageService);
  private readonly apiUrl = `${environment.apiUrl}/transactions/sync`;

  readonly isOnline = signal(navigator.onLine);
  readonly isSyncing = signal(false);
  readonly pendingCount = signal(0);

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline.set(true);
      this.syncPendingTransactions();
    });
    window.addEventListener('offline', () => {
      this.isOnline.set(false);
    });
    this.refreshPendingCount();
  }

  async refreshPendingCount(): Promise<void> {
    const pending = await this.storage.getPendingTransactions();
    this.pendingCount.set(pending.length);
  }

  async syncPendingTransactions(): Promise<void> {
    if (!this.isOnline() || this.isSyncing()) return;

    const pending = await this.storage.getPendingTransactions();
    if (pending.length === 0) return;

    this.isSyncing.set(true);

    const payload: SyncPayload = {
      items: pending.map(item => ({
        clientSyncId: item.clientSyncId,
        beneficiaryProfileId: item.beneficiaryProfileId,
        type: item.type,
        amount: item.amount,
        description: item.description,
        occurredAtUtc: item.occurredAtUtc
      }))
    };

    try {
      const response = await firstValueFrom(
        this.http.post<SyncResponse>(this.apiUrl, payload)
      );

      if (response && response.successfullySyncedIds?.length > 0) {
        await this.storage.markAsSynced(response.successfullySyncedIds);
      }
    } catch (err) {
      console.warn('Sync failed, will retry on next connection:', err);
    } finally {
      this.isSyncing.set(false);
      await this.refreshPendingCount();
    }
  }
}