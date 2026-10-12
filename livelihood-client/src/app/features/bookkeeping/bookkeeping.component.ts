import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { OfflineStorageService, LocalTransaction } from '../../core/services/offline-storage.service';
import { SyncService } from '../../core/services/sync.service';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-bookkeeping',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <!-- Sync Status Banner -->
      <div class="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
        [ngClass]="syncService.isOnline() 
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
          : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'">
        <div class="flex items-center gap-3">
          <span class="w-3 h-3 rounded-full shrink-0" [ngClass]="syncService.isOnline() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'"></span>
          <div>
            <span class="text-sm font-bold">
              {{ syncService.isOnline() ? lang.t('tx.deviceOnline') : lang.t('tx.deviceOffline') }}
            </span>
            <p class="text-xs opacity-80">
              {{ syncService.pendingCount() }} {{ lang.t('tx.queuedLocally') }}
            </p>
          </div>
        </div>

        <button 
          (click)="syncService.syncPendingTransactions()" 
          [disabled]="!syncService.isOnline() || syncService.isSyncing() || syncService.pendingCount() === 0"
          class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          {{ syncService.isSyncing() ? lang.t('tx.synchronizing') : lang.t('tx.syncNow') }}
        </button>
      </div>

      <!-- Daily Snapshot Summary (Visual & Low-Literacy Friendly) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span class="font-medium">{{ lang.t('tx.todaySales') }}</span>
            <span class="text-base">💰</span>
          </div>
          <div class="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {{ todaySales() | number:'1.2-2' }} <span class="text-[10px] font-normal text-slate-500 dark:text-slate-400">ETB</span>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span class="font-medium">{{ lang.t('tx.todayExpenses') }}</span>
            <span class="text-base">📉</span>
          </div>
          <div class="text-lg font-black text-rose-600 dark:text-rose-400 mt-1">
            {{ todayExpenses() | number:'1.2-2' }} <span class="text-[10px] font-normal text-slate-500 dark:text-slate-400">ETB</span>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span class="font-medium">{{ lang.t('tx.todayStock') }}</span>
            <span class="text-base">📦</span>
          </div>
          <div class="text-lg font-black text-amber-700 dark:text-amber-400 mt-1">
            {{ todayStock() | number:'1.2-2' }} <span class="text-[10px] font-normal text-slate-500 dark:text-slate-400">ETB</span>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span class="font-medium">{{ lang.t('tx.todaySavings') }}</span>
            <span class="text-base">🏦</span>
          </div>
          <div class="text-lg font-black text-indigo-700 dark:text-indigo-400 mt-1">
            {{ todaySavings() | number:'1.2-2' }} <span class="text-[10px] font-normal text-slate-500 dark:text-slate-400">ETB</span>
          </div>
        </div>
      </div>

      <!-- Quick Entry Box -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6 transition-colors">
        <div>
          <h2 class="text-lg font-black text-slate-900 dark:text-white">{{ lang.t('tx.recordTitle') }}</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ lang.t('tx.recordDesc') }}</p>
        </div>

        <form [formGroup]="transactionForm" (ngSubmit)="saveTransaction()" class="space-y-6">
          <!-- Type Select Buttons -->
          <div>
            <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">{{ lang.t('tx.type') }}</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button 
                type="button" 
                (click)="selectType(0)" 
                [ngClass]="transactionForm.get('type')?.value === 0 
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-600' 
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'"
                class="py-3 px-3 text-xs font-bold rounded-xl text-center transition-all flex flex-col items-center gap-1">
                <span class="text-base">💰</span>
                <span>{{ lang.t('tx.sale') }}</span>
              </button>
              <button 
                type="button" 
                (click)="selectType(1)" 
                [ngClass]="transactionForm.get('type')?.value === 1 
                  ? 'bg-rose-600 text-white ring-2 ring-rose-600' 
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'"
                class="py-3 px-3 text-xs font-bold rounded-xl text-center transition-all flex flex-col items-center gap-1">
                <span class="text-base">📉</span>
                <span>{{ lang.t('tx.expense') }}</span>
              </button>
              <button 
                type="button" 
                (click)="selectType(2)" 
                [ngClass]="transactionForm.get('type')?.value === 2 
                  ? 'bg-amber-600 text-white ring-2 ring-amber-600' 
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'"
                class="py-3 px-3 text-xs font-bold rounded-xl text-center transition-all flex flex-col items-center gap-1">
                <span class="text-base">📦</span>
                <span>{{ lang.t('tx.stock') }}</span>
              </button>
              <button 
                type="button" 
                (click)="selectType(3)" 
                [ngClass]="transactionForm.get('type')?.value === 3 
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-600' 
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'"
                class="py-3 px-3 text-xs font-bold rounded-xl text-center transition-all flex flex-col items-center gap-1">
                <span class="text-base">🏦</span>
                <span>{{ lang.t('tx.savings') }}</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('tx.amount') }}</label>
              <input 
                type="number" 
                step="0.01" 
                formControlName="amount" 
                placeholder="0.00" 
                class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('tx.desc') }}</label>
              <input 
                type="text" 
                formControlName="description" 
                [placeholder]="lang.t('tx.descPlaceholder')" 
                class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button 
            type="submit" 
            [disabled]="transactionForm.invalid" 
            class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow transition-colors">
            {{ lang.t('tx.save') }}
          </button>
        </form>
      </div>

      <!-- Offline Ledger & Filter Tabs -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ lang.t('tx.recentHistory') }}</h3>
            <p class="text-xs text-slate-400 dark:text-slate-500">{{ filteredTransactions().length }} {{ lang.t('tx.showingOf') }} {{ transactions().length }} {{ lang.t('tx.total') }}</p>
          </div>

          <!-- Filter Chips -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button 
              type="button"
              (click)="selectedFilter.set('ALL')"
              [ngClass]="selectedFilter() === 'ALL' 
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'"
              class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors">
              {{ lang.t('tx.filterAll') }}
            </button>
            <button 
              type="button"
              (click)="selectedFilter.set('SALES')"
              [ngClass]="selectedFilter() === 'SALES' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900'"
              class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors">
              {{ lang.t('tx.sale') }}
            </button>
            <button 
              type="button"
              (click)="selectedFilter.set('EXPENSES')"
              [ngClass]="selectedFilter() === 'EXPENSES' 
                ? 'bg-rose-600 text-white' 
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900'"
              class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors">
              {{ lang.t('tx.expense') }}
            </button>
            <button 
              type="button"
              (click)="selectedFilter.set('STOCK')"
              [ngClass]="selectedFilter() === 'STOCK' 
                ? 'bg-amber-600 text-white' 
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900'"
              class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors">
              {{ lang.t('tx.stock') }}
            </button>
            <button 
              type="button"
              (click)="selectedFilter.set('SAVINGS')"
              [ngClass]="selectedFilter() === 'SAVINGS' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900'"
              class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors">
              {{ lang.t('tx.savings') }}
            </button>
          </div>
        </div>

        <div class="divide-y divide-slate-100 dark:divide-slate-800">
          @for (tx of filteredTransactions(); track tx.clientSyncId) {
            <div class="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div class="flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                  [ngClass]="{
                    'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300': tx.type === 0,
                    'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300': tx.type === 1,
                    'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300': tx.type === 2,
                    'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300': tx.type === 3
                  }">
                  {{ tx.type === 0 ? '💰' : tx.type === 1 ? '📉' : tx.type === 2 ? '📦' : '🏦' }}
                </span>
                <div>
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ tx.description }}</div>
                  <div class="text-[11px] text-slate-400 dark:text-slate-500">
                    {{ tx.occurredAtUtc | date:'mediumDate' }} &bull; {{ tx.occurredAtUtc | date:'shortTime' }}
                  </div>
                </div>
              </div>

              <div class="text-right">
                <div class="text-sm font-bold" [ngClass]="tx.type === 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'">
                  {{ tx.type === 0 ? '+' : '-' }}{{ tx.amount | number:'1.2-2' }} ETB
                </div>
                <span class="text-[10px] font-semibold uppercase tracking-wider"
                  [ngClass]="tx.synced ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'">
                  {{ tx.synced ? lang.t('tx.synced') : lang.t('tx.pending') }}
                </span>
              </div>
            </div>
          } @empty {
            <div class="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
              {{ lang.t('tx.noRecords') }}
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class BookkeepingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly storage = inject(OfflineStorageService);
  readonly syncService = inject(SyncService);
  private readonly authService = inject(AuthService);
  readonly lang = inject(LanguageService);

  readonly transactions = signal<LocalTransaction[]>([]);
  readonly selectedFilter = signal<'ALL' | 'SALES' | 'EXPENSES' | 'STOCK' | 'SAVINGS'>('ALL');

  // Filtered transactions based on selected filter
  readonly filteredTransactions = computed(() => {
    const list = this.transactions();
    const filter = this.selectedFilter();
    if (filter === 'ALL') return list;
    if (filter === 'SALES') return list.filter(t => t.type === 0);
    if (filter === 'EXPENSES') return list.filter(t => t.type === 1);
    if (filter === 'STOCK') return list.filter(t => t.type === 2);
    if (filter === 'SAVINGS') return list.filter(t => t.type === 3);
    return list;
  });

  // Calculate today's totals
  private isToday(dateStr: string): boolean {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  }

  readonly todaySales = computed(() => {
    return this.transactions()
      .filter(t => t.type === 0 && this.isToday(t.occurredAtUtc))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  });

  readonly todayExpenses = computed(() => {
    return this.transactions()
      .filter(t => t.type === 1 && this.isToday(t.occurredAtUtc))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  });

  readonly todayStock = computed(() => {
    return this.transactions()
      .filter(t => t.type === 2 && this.isToday(t.occurredAtUtc))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  });

  readonly todaySavings = computed(() => {
    return this.transactions()
      .filter(t => t.type === 3 && this.isToday(t.occurredAtUtc))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  });

  readonly transactionForm = this.fb.group({
    type: [0, Validators.required],
    amount: ['', [Validators.required, Validators.min(0.01)]],
    description: ['', Validators.required]
  });

  ngOnInit(): void {
    this.refreshTransactions();
  }

  selectType(type: number): void {
    this.transactionForm.patchValue({ type });
  }

  refreshTransactions(): void {
    this.storage.getAllTransactions().then(txs => {
      this.transactions.set(txs);
    });
  }

  async saveTransaction(): Promise<void> {
    if (this.transactionForm.invalid) return;

    const currentUser = this.authService.currentUser();
    const beneficiaryProfileId = currentUser?.beneficiaryProfileId || '11111111-1111-1111-1111-111111111111';

    const localTx: LocalTransaction = {
      clientSyncId: uuidv4(),
      beneficiaryProfileId: beneficiaryProfileId,
      type: Number(this.transactionForm.value.type),
      amount: Number(this.transactionForm.value.amount),
      description: this.transactionForm.value.description || '',
      occurredAtUtc: new Date().toISOString(),
      synced: false
    };

    await this.storage.addTransaction(localTx);
    this.refreshTransactions();

    // Reset Form to default Sale
    this.transactionForm.reset({
      type: 0,
      amount: '',
      description: ''
    });

    // Auto-trigger sync if online
    if (this.syncService.isOnline()) {
      this.syncService.syncPendingTransactions().then(() => {
        this.refreshTransactions();
      });
    }
  }
}
