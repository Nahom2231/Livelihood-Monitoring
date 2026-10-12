import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardSummary, BeneficiaryFinancialSummary, AtRiskBeneficiary, MonthlyFinancialMetric } from './dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50/50 dark:bg-slate-950 min-h-[calc(100vh-4rem)] transition-colors duration-200">
      @if (authService.isStaff()) {
        <!-- ========================================== -->
        <!-- STAFF / M&E DASHBOARD                      -->
        <!-- ========================================== -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                {{ lang.t('dash.staffConsole') }}
              </span>
              <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">{{ lang.t('dash.nationwideBranches') }}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              {{ lang.t('nav.dashboard') }}
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">Live livelihoods performance, seed money utilization, and risk tracking</p>
          </div>

          <!-- Comprehensive Filters & Export Controls -->
          <div class="flex flex-wrap items-center gap-2">
            <select 
              [(ngModel)]="selectedBranch" 
              (ngModelChange)="loadDashboardData()"
              class="text-xs border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm">
              <option value="">{{ lang.t('dash.filterBranch') }}</option>
              <option value="BR-AA-01">BR-AA-01 (Addis)</option>
              <option value="BR-DR-02">BR-DR-02 (Dire Dawa)</option>
              <option value="BR-OR-03">BR-OR-03 (Oromia)</option>
            </select>

            <select 
              [(ngModel)]="selectedRegion" 
              (ngModelChange)="loadDashboardData()"
              class="text-xs border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm">
              <option value="">{{ lang.t('dash.filterRegion') }}</option>
              <option value="Addis Ababa">Addis Ababa</option>
              <option value="Dire Dawa">Dire Dawa</option>
              <option value="Oromia">Oromia</option>
            </select>

            <select 
              [(ngModel)]="selectedCluster" 
              (ngModelChange)="loadDashboardData()"
              class="text-xs border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm">
              <option value="">{{ lang.t('dash.filterCluster') }}</option>
              <option value="Cluster 1">Cluster 1</option>
              <option value="Cluster 2">Cluster 2</option>
            </select>

            <select 
              [(ngModel)]="selectedPartner" 
              (ngModelChange)="loadDashboardData()"
              class="text-xs border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm">
              <option value="">{{ lang.t('dash.filterPartner') }}</option>
              <option value="Livelihood Empowerment Fund">Livelihood Empowerment Fund</option>
            </select>

            <a 
              routerLink="/cases" 
              class="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex items-center gap-1 shadow-sm">
              <svg viewBox="0 0 20 20" fill="currentColor" class="size-3.5">
                <path fill-rule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clip-rule="evenodd" />
              </svg>
              {{ lang.t('nav.cases') }}
            </a>

            <button 
              (click)="exportCsv()" 
              title="Export Beneficiaries List CSV"
              class="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 shadow-sm">
              <svg viewBox="0 0 20 20" fill="none" class="size-3.5" aria-hidden="true">
                <path d="M4 13v2a2 2 0 002 2h8a2 2 0 002-2v-2M10 3v10m-3-3l3 3 3-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ lang.t('dash.exportBeneficiaries') }}
            </button>

            <button 
              (click)="exportTransactionsCsv()" 
              title="Export Transactions Audit Log CSV"
              class="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 shadow-sm">
              <svg viewBox="0 0 20 20" fill="none" class="size-3.5" aria-hidden="true">
                <path d="M4 13v2a2 2 0 002 2h8a2 2 0 002-2v-2M10 3v10m-3-3l3 3 3-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ lang.t('dash.exportLedger') }}
            </button>

            <button 
              (click)="loadDashboardData()" 
              class="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
              ↻ {{ lang.t('common.refresh') }}
            </button>
          </div>
        </div>

        @if (isLoading()) {
          <div class="py-24 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div class="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-3">{{ lang.t('common.loading') }}</p>
          </div>
        } @else if (summary(); as data) {
          <!-- 5 Metric KPI Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ lang.t('dash.seedDisbursed') }}</span>
              <div class="text-xl font-black text-slate-900 dark:text-white mt-2">{{ data.totalSeedCapitalDisbursed | number:'1.2-2' }} ETB</div>
              <div class="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">{{ data.totalBeneficiaries }} {{ lang.t('dash.totalBeneficiaries') }}</div>
            </div>

            <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ lang.t('dash.capitalInvested') }}</span>
              <div class="text-xl font-black text-indigo-700 dark:text-indigo-400 mt-2">{{ data.totalCapitalInvested | number:'1.2-2' }} ETB</div>
              <div class="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium">{{ lang.t('dash.seedUtilization') }}: {{ data.seedMoneyUtilizationPercentage }}%</div>
            </div>

            <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ lang.t('dash.totalRevenue') }}</span>
              <div class="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{{ data.totalRevenue | number:'1.2-2' }} ETB</div>
              <div class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{{ lang.t('dash.operationalCosts') }}: {{ data.totalOperationalExpenses | number:'1.2-2' }} ETB</div>
            </div>

            <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ lang.t('dash.netProfit') }}</span>
              <div class="text-xl font-black" [ngClass]="data.totalNetProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                {{ data.totalNetProfit | number:'1.2-2' }} ETB
              </div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{{ data.activeBeneficiaries }} {{ lang.t('dash.activeEnterprises') }} / {{ data.inactiveBeneficiaries }} {{ lang.t('dash.inactiveDormant') }}</div>
            </div>

            <div class="bg-rose-50/40 dark:bg-rose-950/20 p-5 rounded-xl border border-rose-200 dark:border-rose-900/60 shadow-sm transition-colors duration-200">
              <span class="text-xs font-semibold text-rose-700 dark:text-rose-400">{{ lang.t('dash.atRiskFlagged') }}</span>
              <div class="text-xl font-black text-rose-600 dark:text-rose-400 mt-2">{{ data.atRiskBeneficiaries }}</div>
              <div class="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">Requires supervisor follow-up</div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Critical Follow-ups Alert Table (2 cols) -->
            <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
              <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 class="text-sm font-bold text-slate-900 dark:text-white">{{ lang.t('dash.criticalFollowUps') }}</h2>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Enterprises incurring deficits, dormancy, or zero transaction reporting</p>
                </div>
                <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300">
                  {{ data.criticalFollowUps.length }} Flagged
                </span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th class="px-5 py-3">{{ lang.t('auth.beneficiary') }}</th>
                      <th class="px-4 py-3">{{ lang.t('auth.sector') }}</th>
                      <th class="px-4 py-3">{{ lang.t('dash.seedDisbursed') }}</th>
                      <th class="px-4 py-3">{{ lang.t('dash.netProfit') }}</th>
                      <th class="px-4 py-3">{{ lang.t('landing.previewBizActivity') }}</th>
                      <th class="px-5 py-3 text-right">{{ lang.t('common.save') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    @for (ben of data.criticalFollowUps; track ben.beneficiaryId) {
                      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td class="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                          {{ ben.fullName }}
                          <span class="block text-[11px] font-normal text-slate-400 dark:text-slate-500">{{ ben.branchCode }}</span>
                        </td>
                        <td class="px-4 py-3.5">
                          <span class="font-medium text-slate-800 dark:text-slate-200">{{ ben.sector }}</span>
                          <span class="block text-[10px] text-slate-400 dark:text-slate-500">{{ ben.region }}</span>
                        </td>
                        <td class="px-4 py-3.5 font-medium">{{ ben.seedCapital | number:'1.2-2' }} ETB</td>
                        <td class="px-4 py-3.5 font-bold" [ngClass]="ben.netProfit < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'">
                          {{ ben.netProfit | number:'1.2-2' }} ETB
                        </td>
                        <td class="px-4 py-3.5">
                          <span class="inline-block px-2 py-0.5 rounded text-[11px] font-medium"
                            [ngClass]="ben.totalLoggedTransactions === 0 ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'">
                            {{ ben.totalLoggedTransactions }} {{ lang.t('dash.records') }}
                          </span>
                        </td>
                        <td class="px-5 py-3.5 text-right">
                          <button 
                            (click)="openCaseNoteModal(ben)"
                            class="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 rounded transition-colors">
                            {{ lang.t('case.logVisit') }}
                          </button>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="6" class="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
                          No at-risk beneficiaries detected in this scope.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Breakdown Panels (1 col) -->
            <div class="space-y-6">
              <!-- Regional Progress Summary -->
              <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-3 transition-colors duration-200">
                <h2 class="text-sm font-bold text-slate-900 dark:text-white">{{ lang.t('dash.progressByRegion') }}</h2>
                <div class="space-y-2.5">
                  @for (reg of data.regionalBreakdown; track reg.region) {
                    <div class="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                      <div class="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span>{{ reg.region }}</span>
                        <span class="text-slate-500 dark:text-slate-400 font-normal">{{ reg.beneficiaryCount }} {{ lang.t('dash.entrepreneurs') }}</span>
                      </div>
                      <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                        <span>Seed: {{ reg.totalSeedDisbursed | number:'1.0-0' }} ETB</span>
                        <span class="font-semibold" [ngClass]="reg.netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                          {{ lang.t('dash.profit') }}: {{ reg.netProfit | number:'1.0-0' }} ETB
                        </span>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Sector Performance Breakdown -->
              <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-3 transition-colors duration-200">
                <h2 class="text-sm font-bold text-slate-900 dark:text-white">{{ lang.t('dash.sectorPerformance') }}</h2>
                <div class="space-y-2.5">
                  @for (sec of data.sectorBreakdown; track sec.sector) {
                    <div class="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                      <div class="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span>{{ sec.sector }}</span>
                        <span class="text-slate-500 dark:text-slate-400 font-normal">{{ sec.beneficiaryCount }} {{ lang.t('dash.users') }}</span>
                      </div>
                      <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                        <span>{{ lang.t('dash.sales') }}: {{ sec.totalRevenue | number:'1.0-0' }} ETB</span>
                        <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ lang.t('dash.avgProfit') }}: {{ sec.averageProfit | number:'1.0-0' }} ETB</span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- 6-Month Profit & Loss Trajectory (Trend Tracker) -->
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-colors duration-200">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 class="text-sm font-bold text-slate-900 dark:text-white">{{ lang.t('dash.financialTrajectory') }}</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400">Aggregated gross sales, operating costs, and net profit realized across branches</p>
              </div>
              <span class="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                Monthly Performance Trends
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (trend of financialTrends(); track trend.monthLabel) {
                <div class="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-2">
                  <div class="flex items-center justify-between font-bold text-xs text-slate-800 dark:text-slate-200">
                    <span>Month: {{ trend.monthLabel }}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                      [ngClass]="trend.netProfit >= 0 ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'">
                      {{ trend.netProfit >= 0 ? lang.t('dash.surplus') : lang.t('dash.deficit') }}
                    </span>
                  </div>
                  <div class="space-y-1 text-xs">
                    <div class="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>{{ lang.t('dash.sales') }}:</span>
                      <span class="font-semibold text-emerald-600 dark:text-emerald-400">+{{ trend.totalSales | number:'1.2-2' }} ETB</span>
                    </div>
                    <div class="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                      <span>{{ lang.t('dash.operationalCosts') }}:</span>
                      <span class="text-rose-600 dark:text-rose-400 font-semibold">-{{ trend.totalExpenses | number:'1.2-2' }} ETB</span>
                    </div>
                    <div class="flex justify-between font-bold pt-1 border-t border-slate-200 dark:border-slate-700"
                      [ngClass]="trend.netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                      <span>{{ lang.t('dash.netProfit') }}:</span>
                      <span>{{ trend.netProfit | number:'1.2-2' }} ETB</span>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="col-span-3 text-center py-6 text-xs text-slate-400 dark:text-slate-500">
                  No transaction activity logged in the 6-month window for this filter scope.
                </div>
              }
            </div>
          </div>
        }
      } @else {
        <!-- ========================================== -->
        <!-- BENEFICIARY ENTREPRENEUR PORTAL            -->
        <!-- ========================================== -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 uppercase">
                {{ lang.t('dash.beneficiaryPortal') }}
              </span>
              <span class="text-xs text-slate-500 dark:text-slate-400">{{ lang.t('dash.myBusinessProfile') }}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              {{ lang.t('dash.financialProgress') }}
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ lang.t('dash.financialProgressDesc') }}</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button 
              (click)="openProfileModal()" 
              class="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-1.5">
              <span>{{ lang.t('dash.profileAndGrant') }}</span>
            </button>

            <a 
              routerLink="/bookkeeping" 
              class="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" class="size-3.5">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
              + {{ lang.t('tx.recordTitle') }}
            </a>

            <a 
              routerLink="/planning" 
              class="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
              {{ lang.t('plan.title') }}
            </a>

            <button 
              (click)="loadBeneficiaryData()" 
              class="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
              ↻ {{ lang.t('common.refresh') }}
            </button>
          </div>
        </div>

        @if (isLoading()) {
          <div class="py-24 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div class="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-3">{{ lang.t('common.loading') }}</p>
          </div>
        } @else if (beneficiarySummary(); as ben) {
          <!-- Expense vs Income Alert Banner -->
          @if (ben.expenseVsIncomeAlert.hasAlert) {
            <div class="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <span class="text-lg">⚠️</span>
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">{{ lang.t('dash.alertExpenseHigh') }}</p>
                <p class="text-sm mt-0.5">{{ ben.expenseVsIncomeAlert.message }}</p>
              </div>
            </div>
          }

          <!-- Business Profile Overview Card -->
          <div class="bg-gradient-to-r from-emerald-800 to-teal-900 dark:from-emerald-950 dark:to-teal-950 rounded-2xl p-6 text-white shadow-md border border-emerald-700/30 dark:border-emerald-800/50">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span class="text-[11px] uppercase tracking-wider text-emerald-200 font-semibold">{{ ben.sector }} Enterprise</span>
                <h2 class="text-2xl font-bold mt-1">{{ ben.businessName || ben.fullName + "'s Business" }}</h2>
                <p class="text-xs text-emerald-100 mt-1">Entrepreneur: {{ ben.fullName }}</p>
              </div>
              <div class="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <span class="text-xs text-emerald-100 block">{{ lang.t('dash.seedDisbursed') }}</span>
                <span class="text-xl font-black text-white">{{ ben.breakEven.seedCapitalAmount | number:'1.2-2' }} ETB</span>
              </div>
            </div>
          </div>

          <!-- Financial Profit KPI Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ lang.t('dash.dailyProfit') }}</span>
              <div class="text-2xl font-black mt-2" [ngClass]="ben.dailyProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                {{ ben.dailyProfit | number:'1.2-2' }} ETB
              </div>
              <div class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Daily income minus expenses</div>
            </div>

            <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ lang.t('dash.weeklyProfit') }}</span>
              <div class="text-2xl font-black mt-2" [ngClass]="ben.weeklyProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                {{ ben.weeklyProfit | number:'1.2-2' }} ETB
              </div>
              <div class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Rolling 7-day net performance</div>
            </div>

            <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ lang.t('dash.monthlyProfit') }}</span>
              <div class="text-2xl font-black mt-2" [ngClass]="ben.monthlyProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                {{ ben.monthlyProfit | number:'1.2-2' }} ETB
              </div>
              <div class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Current calendar month</div>
            </div>

            <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ lang.t('dash.totalSavings') }}</span>
              <div class="text-2xl font-black text-indigo-700 dark:text-indigo-400 mt-2">{{ ben.totalSavingsAllTime | number:'1.2-2' }} ETB</div>
              <div class="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium">{{ lang.t('dash.emergencyFund') }}</div>
            </div>
          </div>

          <!-- Break-Even Analysis Progress -->
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-colors duration-200">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ lang.t('dash.breakEvenStatus') }}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ lang.t('dash.breakEvenProgress') }}</p>
              </div>
              <span class="px-3 py-1 text-xs font-bold rounded-full"
                [ngClass]="ben.breakEven.isBreakEvenAchieved ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'">
                {{ ben.breakEven.isBreakEvenAchieved ? lang.t('dash.breakEvenAchieved') : ben.breakEven.breakEvenPercentage + '% to Break-Even' }}
              </span>
            </div>

            <div class="space-y-2">
              <div class="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-500 rounded-full"
                  [style.width.%]="ben.breakEven.breakEvenPercentage > 100 ? 100 : ben.breakEven.breakEvenPercentage">
                </div>
              </div>
              <div class="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Net Profit Generated: {{ ben.breakEven.cumulativeNetProfit | number:'1.2-2' }} ETB</span>
                <span>Seed Target: {{ ben.breakEven.seedCapitalAmount | number:'1.2-2' }} ETB</span>
              </div>
            </div>

            @if (!ben.breakEven.isBreakEvenAchieved) {
              <p class="text-xs text-slate-600 dark:text-slate-300">
                You need <strong class="text-slate-900 dark:text-white">{{ ben.breakEven.remainingToBreakEven | number:'1.2-2' }} ETB</strong> more in net profit to fully recover your initial seed investment.
              </p>
            }
          </div>

          <!-- Cash Flow Timeline (Weekly + Monthly) -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-3 transition-colors duration-200">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ lang.t('dash.recent7Days') }}</h3>
              <div class="space-y-2">
                @for (pt of ben.weeklyCashFlow; track pt.periodLabel) {
                  <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
                    <span class="font-medium text-slate-700 dark:text-slate-300">{{ pt.periodLabel }}</span>
                    <div class="flex items-center gap-4 text-[11px]">
                      <span class="text-emerald-700 dark:text-emerald-400 font-semibold">+{{ pt.sales | number:'1.0-0' }}</span>
                      <span class="text-rose-600 dark:text-rose-400 font-semibold">-{{ pt.expenses | number:'1.0-0' }}</span>
                      <span class="font-bold w-16 text-right" [ngClass]="pt.netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                        {{ pt.netProfit | number:'1.0-0' }} ETB
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-3 transition-colors duration-200">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ lang.t('dash.monthlyTrend') }}</h3>
              <div class="space-y-2">
                @for (m of ben.monthlyCashFlow; track m.periodLabel) {
                  <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
                    <span class="font-bold text-slate-800 dark:text-slate-200">{{ m.periodLabel }}</span>
                    <div class="flex items-center gap-4 text-[11px]">
                      <span class="text-slate-600 dark:text-slate-300">Sales: {{ m.sales | number:'1.0-0' }}</span>
                      <span class="text-slate-500 dark:text-slate-400">Exp: {{ m.expenses | number:'1.0-0' }}</span>
                      <span class="font-bold w-16 text-right" [ngClass]="m.netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                        {{ m.netProfit | number:'1.0-0' }} ETB
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      }

      <!-- Log Case Note Modal (Staff Action) -->
      @if (activeFollowUpModal()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-slate-200 dark:border-slate-800 transition-colors">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">Record Field Follow-Up Visit</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Beneficiary: {{ activeFollowUpModal()?.fullName }} ({{ activeFollowUpModal()?.branchCode }})</p>
              </div>
              <button (click)="closeCaseNoteModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">&times;</button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Field Findings & Observations</label>
                <textarea 
                  [(ngModel)]="caseNoteFindings" 
                  rows="3" 
                  placeholder="Record business operational observations, stock checks, or obstacles..."
                  class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Staff Recommendations</label>
                <textarea 
                  [(ngModel)]="caseNoteRecommendations" 
                  rows="2" 
                  placeholder="Action items, financial advice, or coaching provided..."
                  class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
              </div>

              <div class="flex items-center gap-2 pt-1">
                <input type="checkbox" [(ngModel)]="caseNoteFollowUpRequired" id="fu_cb" class="rounded text-emerald-600 focus:ring-emerald-500">
                <label for="fu_cb" class="font-medium text-slate-700 dark:text-slate-300">Flag for ongoing follow-up visit</label>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button 
                (click)="closeCaseNoteModal()" 
                class="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                {{ lang.t('common.cancel') }}
              </button>
              <button 
                (click)="saveCaseNote()" 
                [disabled]="isSavingCaseNote() || !caseNoteFindings" 
                class="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm">
                {{ isSavingCaseNote() ? 'Saving...' : 'Save Case Note' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- View / Edit Beneficiary Profile & Grant Modal -->
      @if (showProfileModal()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-slate-200 dark:border-slate-800 transition-colors">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">Enterprise Profile & Grant Records</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Official livelihood program registration credentials</p>
              </div>
              <button (click)="closeProfileModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">&times;</button>
            </div>

            <div class="space-y-4 text-xs">
              <!-- Seed Grant Summary Card -->
              <div class="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-100 dark:border-emerald-800 space-y-1">
                <span class="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Initial Seed Capital Grant</span>
                <div class="text-xl font-black text-emerald-900 dark:text-emerald-200">
                  {{ (beneficiarySummary()?.breakEven?.seedCapitalAmount || 15000) | number:'1.2-2' }} ETB
                </div>
                <p class="text-[11px] text-emerald-700 dark:text-emerald-400">Disbursed under the ABC Company Economic Inclusion Programme.</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Entrepreneur Name</label>
                  <input 
                    type="text" 
                    [(ngModel)]="editFullName" 
                    class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 focus:outline-none"
                    readonly
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Registered Phone</label>
                  <input 
                    type="text" 
                    [(ngModel)]="editPhone" 
                    class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 focus:outline-none"
                    readonly
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Business Name *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="editBusinessName" 
                    placeholder="e.g. Almaz Bekele Tailoring"
                    class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Livelihood Sector *</label>
                  <select 
                    [(ngModel)]="editSector" 
                    class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                    <option value="Poultry">Poultry & Livestock</option>
                    <option value="Retail">Retail & Shopkeeping</option>
                    <option value="Tailoring">Tailoring & Garment</option>
                    <option value="Agriculture">Vegetable & Crop Farming</option>
                    <option value="Catering">Food & Tea Stall</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button 
                (click)="closeProfileModal()" 
                class="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                {{ lang.t('common.close') }}
              </button>
              <button 
                (click)="saveProfileUpdates()" 
                [disabled]="isSavingProfile() || !editBusinessName" 
                class="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm">
                {{ isSavingProfile() ? 'Saving...' : 'Update Business Profile' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  readonly authService = inject(AuthService);
  readonly lang = inject(LanguageService);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly beneficiarySummary = signal<BeneficiaryFinancialSummary | null>(null);
  readonly financialTrends = signal<MonthlyFinancialMetric[]>([]);
  readonly isLoading = signal(true);
  readonly activeFollowUpModal = signal<AtRiskBeneficiary | null>(null);
  readonly isSavingCaseNote = signal(false);

  readonly showProfileModal = signal(false);
  readonly isSavingProfile = signal(false);
  editFullName = '';
  editPhone = '';
  editBusinessName = '';
  editSector = '';

  selectedBranch = '';
  selectedRegion = '';
  selectedCluster = '';
  selectedPartner = '';

  caseNoteFindings = '';
  caseNoteRecommendations = '';
  caseNoteFollowUpRequired = true;

  ngOnInit(): void {
    if (this.authService.isStaff()) {
      this.loadDashboardData();
    } else {
      this.loadBeneficiaryData();
    }
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.dashboardService.getSummary(
      this.selectedBranch || undefined,
      this.selectedRegion || undefined,
      this.selectedCluster || undefined,
      this.selectedPartner || undefined
    ).subscribe({
      next: (res) => {
        this.summary.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });

    this.loadFinancialTrends();
  }

  loadFinancialTrends(): void {
    this.dashboardService.getFinancialTrends(6).subscribe({
      next: (trends) => {
        this.financialTrends.set(trends || []);
      },
      error: () => {
        this.financialTrends.set([]);
      }
    });
  }

  loadBeneficiaryData(): void {
    const profileId = this.authService.currentUser()?.beneficiaryProfileId;
    if (!profileId) {
      this.loadDashboardData();
      return;
    }

    this.isLoading.set(true);
    this.dashboardService.getBeneficiaryFinancialSummary(profileId).subscribe({
      next: (res) => {
        this.beneficiarySummary.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.loadDashboardData();
      }
    });
  }

  exportCsv(): void {
    this.dashboardService.exportBeneficiariesCsv(this.selectedBranch || undefined, this.selectedRegion || undefined).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `beneficiaries-report-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  exportTransactionsCsv(): void {
    this.dashboardService.exportTransactionsCsv(undefined, this.selectedBranch || undefined).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  openProfileModal(): void {
    const ben = this.beneficiarySummary();
    const user = this.authService.currentUser();
    this.editFullName = ben?.fullName || user?.fullName || user?.username || '';
    this.editPhone = user?.username || '';
    this.editBusinessName = ben?.businessName || '';
    this.editSector = ben?.sector || 'Poultry';
    this.showProfileModal.set(true);
  }

  closeProfileModal(): void {
    this.showProfileModal.set(false);
  }

  saveProfileUpdates(): void {
    const profileId = this.authService.currentUser()?.beneficiaryProfileId;
    if (!profileId || !this.editBusinessName) return;

    this.isSavingProfile.set(true);
    this.dashboardService.updateBeneficiaryProfile(profileId, {
      fullName: this.editFullName,
      businessName: this.editBusinessName,
      livelihoodSector: this.editSector
    }).subscribe({
      next: () => {
        this.isSavingProfile.set(false);
        this.closeProfileModal();
        this.loadBeneficiaryData();
      },
      error: () => {
        this.isSavingProfile.set(false);
      }
    });
  }

  openCaseNoteModal(ben: AtRiskBeneficiary): void {
    this.activeFollowUpModal.set(ben);
    this.caseNoteFindings = '';
    this.caseNoteRecommendations = '';
    this.caseNoteFollowUpRequired = true;
  }

  closeCaseNoteModal(): void {
    this.activeFollowUpModal.set(null);
  }

  saveCaseNote(): void {
    const ben = this.activeFollowUpModal();
    if (!ben || !this.caseNoteFindings) return;

    const user = this.authService.currentUser();
    this.isSavingCaseNote.set(true);

    this.dashboardService.logCaseNote({
      beneficiaryProfileId: ben.beneficiaryId,
      staffId: user?.userId || 'staff-1',
      staffName: user?.fullName || user?.username || 'Social Worker',
      visitDateUtc: new Date().toISOString(),
      visitFindings: this.caseNoteFindings,
      recommendations: this.caseNoteRecommendations,
      followUpRequired: this.caseNoteFollowUpRequired
    }).subscribe({
      next: () => {
        this.isSavingCaseNote.set(false);
        this.closeCaseNoteModal();
        this.loadDashboardData();
      },
      error: () => {
        this.isSavingCaseNote.set(false);
      }
    });
  }
}