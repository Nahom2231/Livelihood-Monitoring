import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService, DashboardSummary, BeneficiaryFinancialSummary, AtRiskBeneficiary } from './dashboard.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50/50 min-h-[calc(100vh-4rem)]">
      @if (authService.isStaff()) {
        <!-- ========================================== -->
        <!-- STAFF / M&E DASHBOARD                      -->
        <!-- ========================================== -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Staff Console
              </span>
              <span class="text-xs text-slate-500 font-medium">100 Nationwide Branches</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              M&E Monitoring Console
            </h1>
            <p class="text-xs text-slate-500">Live livelihoods performance, seed money utilization, and risk tracking</p>
          </div>

          <!-- Branch filter & Controls -->
          <div class="flex flex-wrap items-center gap-3">
            <select 
              [(ngModel)]="selectedBranch" 
              (ngModelChange)="loadDashboardData()"
              class="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm">
              <option value="">All Branches (Nationwide)</option>
              <option value="BR-AA-01">BR-AA-01 - Addis Ababa Central</option>
              <option value="BR-DR-02">BR-DR-02 - Dire Dawa Eastern</option>
              <option value="BR-OR-03">BR-OR-03 - Oromia South-Central</option>
              <option value="BR-001">Branch 001</option>
              <option value="BR-002">Branch 002</option>
              <option value="BR-003">Branch 003</option>
            </select>

            <button 
              (click)="exportCsv()" 
              class="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-sm">
              <svg viewBox="0 0 20 20" fill="none" class="size-3.5" aria-hidden="true">
                <path d="M4 13v2a2 2 0 002 2h8a2 2 0 002-2v-2M10 3v10m-3-3l3 3 3-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Export CSV
            </button>

            <button 
              (click)="loadDashboardData()" 
              class="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              Refresh
            </button>
          </div>
        </div>

        @if (isLoading()) {
          <div class="py-24 text-center bg-white rounded-2xl border border-slate-200">
            <div class="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs text-slate-500 font-medium mt-3">Computing livelihood analytics...</p>
          </div>
        } @else if (summary(); as data) {
          <!-- 5 Metric KPI Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span class="text-xs font-semibold text-slate-500">Seed Capital Disbursed</span>
              <div class="text-xl font-black text-slate-900 mt-2">{{ data.totalSeedCapitalDisbursed | number:'1.2-2' }} ETB</div>
              <div class="text-[11px] text-emerald-600 mt-1 font-medium">{{ data.totalBeneficiaries }} Beneficiaries enrolled</div>
            </div>

            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span class="text-xs font-semibold text-slate-500">Seed Money Invested</span>
              <div class="text-xl font-black text-indigo-700 mt-2">{{ data.totalCapitalInvested | number:'1.2-2' }} ETB</div>
              <div class="text-[11px] text-indigo-600 mt-1 font-medium">Utilization: {{ data.seedMoneyUtilizationPercentage }}%</div>
            </div>

            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span class="text-xs font-semibold text-slate-500">Aggregated Sales</span>
              <div class="text-xl font-black text-emerald-600 mt-2">{{ data.totalRevenue | number:'1.2-2' }} ETB</div>
              <div class="text-[11px] text-slate-400 mt-1">Costs: {{ data.totalOperationalExpenses | number:'1.2-2' }} ETB</div>
            </div>

            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span class="text-xs font-semibold text-slate-500">Net Profit Realized</span>
              <div class="text-xl font-black" [ngClass]="data.totalNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'">
                {{ data.totalNetProfit | number:'1.2-2' }} ETB
              </div>
              <div class="text-[11px] text-slate-500 mt-1 font-medium">{{ data.activeBeneficiaries }} Active / {{ data.inactiveBeneficiaries }} Inactive</div>
            </div>

            <div class="bg-white p-5 rounded-xl border border-rose-200 bg-rose-50/40 shadow-sm">
              <span class="text-xs font-semibold text-rose-700">At-Risk Interventions</span>
              <div class="text-xl font-black text-rose-600 mt-2">{{ data.atRiskBeneficiaries }}</div>
              <div class="text-[11px] text-rose-600 font-medium mt-1">Requires supervisor follow-up</div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Critical Follow-ups Alert Table (2 cols) -->
            <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 class="text-sm font-bold text-slate-900">Priority Supervisory Follow-Ups</h2>
                  <p class="text-xs text-slate-500">Enterprises incurring deficits, dormancy, or zero transaction reporting</p>
                </div>
                <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800">
                  {{ data.criticalFollowUps.length }} Flagged
                </span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-600">
                  <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th class="px-5 py-3">Beneficiary</th>
                      <th class="px-4 py-3">Region / Sector</th>
                      <th class="px-4 py-3">Seed Capital</th>
                      <th class="px-4 py-3">Net Profit</th>
                      <th class="px-4 py-3">Activity</th>
                      <th class="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (ben of data.criticalFollowUps; track ben.beneficiaryId) {
                      <tr class="hover:bg-slate-50 transition-colors">
                        <td class="px-5 py-3.5 font-semibold text-slate-900">
                          {{ ben.fullName }}
                          <span class="block text-[11px] font-normal text-slate-400">{{ ben.branchCode }}</span>
                        </td>
                        <td class="px-4 py-3.5">
                          <span class="font-medium text-slate-800">{{ ben.sector }}</span>
                          <span class="block text-[10px] text-slate-400">{{ ben.region }}</span>
                        </td>
                        <td class="px-4 py-3.5 font-medium">{{ ben.seedCapital | number:'1.2-2' }} ETB</td>
                        <td class="px-4 py-3.5 font-bold" [ngClass]="ben.netProfit < 0 ? 'text-rose-600' : 'text-slate-900'">
                          {{ ben.netProfit | number:'1.2-2' }} ETB
                        </td>
                        <td class="px-4 py-3.5">
                          <span class="inline-block px-2 py-0.5 rounded text-[11px] font-medium"
                            [ngClass]="ben.totalLoggedTransactions === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'">
                            {{ ben.totalLoggedTransactions }} records
                          </span>
                        </td>
                        <td class="px-5 py-3.5 text-right">
                          <button 
                            (click)="openCaseNoteModal(ben)"
                            class="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors">
                            Log Visit Note
                          </button>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="6" class="px-6 py-8 text-center text-slate-400">
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
              <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
                <h2 class="text-sm font-bold text-slate-900">Progress by Region</h2>
                <div class="space-y-2.5">
                  @for (reg of data.regionalBreakdown; track reg.region) {
                    <div class="p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs space-y-1">
                      <div class="flex items-center justify-between font-bold text-slate-800">
                        <span>{{ reg.region }}</span>
                        <span class="text-slate-500 font-normal">{{ reg.beneficiaryCount }} entrepreneurs</span>
                      </div>
                      <div class="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>Seed: {{ reg.totalSeedDisbursed | number:'1.0-0' }} ETB</span>
                        <span class="font-semibold" [ngClass]="reg.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'">
                          Profit: {{ reg.netProfit | number:'1.0-0' }} ETB
                        </span>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Sector Performance Breakdown -->
              <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
                <h2 class="text-sm font-bold text-slate-900">Sector Performance</h2>
                <div class="space-y-2.5">
                  @for (sec of data.sectorBreakdown; track sec.sector) {
                    <div class="p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs space-y-1">
                      <div class="flex items-center justify-between font-bold text-slate-800">
                        <span>{{ sec.sector }}</span>
                        <span class="text-slate-500 font-normal">{{ sec.beneficiaryCount }} users</span>
                      </div>
                      <div class="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>Sales: {{ sec.totalRevenue | number:'1.0-0' }} ETB</span>
                        <span class="font-semibold text-emerald-600">Avg Profit: {{ sec.averageProfit | number:'1.0-0' }} ETB</span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      } @else {
        <!-- ========================================== -->
        <!-- BENEFICIARY ENTREPRENEUR PORTAL            -->
        <!-- ========================================== -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">Beneficiary Portal</span>
              <span class="text-xs text-slate-500">My Livelihood Business</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Financial Progress & Cash Flow</h1>
            <p class="text-xs text-slate-500">Real-time daily transaction recording, break-even tracking, and cash flow</p>
          </div>

          <button 
            (click)="loadBeneficiaryData()" 
            class="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            Refresh Data
          </button>
        </div>

        @if (isLoading()) {
          <div class="py-24 text-center bg-white rounded-2xl border border-slate-200">
            <div class="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs text-slate-500 font-medium mt-3">Loading your business analytics...</p>
          </div>
        } @else if (beneficiarySummary(); as ben) {
          <!-- Expense vs Income Alert Banner -->
          @if (ben.expenseVsIncomeAlert.hasAlert) {
            <div class="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 flex items-start gap-3">
              <span class="text-lg">⚠️</span>
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-amber-800">Financial Advisory Alert</p>
                <p class="text-sm mt-0.5">{{ ben.expenseVsIncomeAlert.message }}</p>
              </div>
            </div>
          }

          <!-- Business Profile Overview Card -->
          <div class="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span class="text-[11px] uppercase tracking-wider text-emerald-200 font-semibold">{{ ben.sector }} Enterprise</span>
                <h2 class="text-2xl font-bold mt-1">{{ ben.businessName || ben.fullName + "'s Business" }}</h2>
                <p class="text-xs text-emerald-100 mt-1">Entrepreneur: {{ ben.fullName }}</p>
              </div>
              <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <span class="text-xs text-emerald-100 block">Seed Capital Disbursed</span>
                <span class="text-xl font-black text-white">{{ ben.breakEven.seedCapitalAmount | number:'1.2-2' }} ETB</span>
              </div>
            </div>
          </div>

          <!-- Financial Profit KPI Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span class="text-xs font-semibold text-slate-500">Today's Profit</span>
              <div class="text-2xl font-black mt-2" [ngClass]="ben.dailyProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'">
                {{ ben.dailyProfit | number:'1.2-2' }} ETB
              </div>
              <div class="text-[11px] text-slate-400 mt-1">Daily income minus expenses</div>
            </div>

            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span class="text-xs font-semibold text-slate-500">Weekly Profit (7 Days)</span>
              <div class="text-2xl font-black mt-2" [ngClass]="ben.weeklyProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'">
                {{ ben.weeklyProfit | number:'1.2-2' }} ETB
              </div>
              <div class="text-[11px] text-slate-400 mt-1">Rolling 7-day net performance</div>
            </div>

            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span class="text-xs font-semibold text-slate-500">This Month's Profit</span>
              <div class="text-2xl font-black mt-2" [ngClass]="ben.monthlyProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'">
                {{ ben.monthlyProfit | number:'1.2-2' }} ETB
              </div>
              <div class="text-[11px] text-slate-400 mt-1">Current calendar month</div>
            </div>

            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span class="text-xs font-semibold text-slate-500">Total Savings Contributed</span>
              <div class="text-2xl font-black text-indigo-700 mt-2">{{ ben.totalSavingsAllTime | number:'1.2-2' }} ETB</div>
              <div class="text-[11px] text-indigo-600 mt-1 font-medium">Bank / Iddir emergency fund</div>
            </div>
          </div>

          <!-- Break-Even Analysis Progress -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 class="text-sm font-bold text-slate-900">Break-Even Status (Seed Funding Return)</h3>
                <p class="text-xs text-slate-500">Measures your cumulative net profit relative to your original seed grant</p>
              </div>
              <span class="px-3 py-1 text-xs font-bold rounded-full"
                [ngClass]="ben.breakEven.isBreakEvenAchieved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">
                {{ ben.breakEven.isBreakEvenAchieved ? 'Break-Even Achieved!' : ben.breakEven.breakEvenPercentage + '% to Break-Even' }}
              </span>
            </div>

            <div class="space-y-2">
              <div class="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                  [style.width.%]="ben.breakEven.breakEvenPercentage > 100 ? 100 : ben.breakEven.breakEvenPercentage">
                </div>
              </div>
              <div class="flex justify-between text-xs text-slate-500 font-medium">
                <span>Net Profit Generated: {{ ben.breakEven.cumulativeNetProfit | number:'1.2-2' }} ETB</span>
                <span>Seed Target: {{ ben.breakEven.seedCapitalAmount | number:'1.2-2' }} ETB</span>
              </div>
            </div>

            @if (!ben.breakEven.isBreakEvenAchieved) {
              <p class="text-xs text-slate-600">
                You need <strong class="text-slate-900">{{ ben.breakEven.remainingToBreakEven | number:'1.2-2' }} ETB</strong> more in net profit to fully recover your initial seed investment.
              </p>
            }
          </div>

          <!-- Cash Flow Timeline (Weekly + Monthly) -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
              <h3 class="text-sm font-bold text-slate-900">Recent 7 Days Cash Flow</h3>
              <div class="space-y-2">
                @for (pt of ben.weeklyCashFlow; track pt.periodLabel) {
                  <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs">
                    <span class="font-medium text-slate-700">{{ pt.periodLabel }}</span>
                    <div class="flex items-center gap-4 text-[11px]">
                      <span class="text-emerald-700 font-semibold">+{{ pt.sales | number:'1.0-0' }}</span>
                      <span class="text-rose-600 font-semibold">-{{ pt.expenses | number:'1.0-0' }}</span>
                      <span class="font-bold w-16 text-right" [ngClass]="pt.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'">
                        {{ pt.netProfit | number:'1.0-0' }} ETB
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
              <h3 class="text-sm font-bold text-slate-900">Monthly Performance Trend</h3>
              <div class="space-y-2">
                @for (m of ben.monthlyCashFlow; track m.periodLabel) {
                  <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs">
                    <span class="font-bold text-slate-800">{{ m.periodLabel }}</span>
                    <div class="flex items-center gap-4 text-[11px]">
                      <span class="text-slate-600">Sales: {{ m.sales | number:'1.0-0' }}</span>
                      <span class="text-slate-500">Exp: {{ m.expenses | number:'1.0-0' }}</span>
                      <span class="font-bold w-16 text-right" [ngClass]="m.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'">
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
        <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 class="text-sm font-bold text-slate-900">Record Field Follow-Up Visit</h3>
                <p class="text-xs text-slate-500">Beneficiary: {{ activeFollowUpModal()?.fullName }} ({{ activeFollowUpModal()?.branchCode }})</p>
              </div>
              <button (click)="closeCaseNoteModal()" class="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Field Findings & Observations</label>
                <textarea 
                  [(ngModel)]="caseNoteFindings" 
                  rows="3" 
                  placeholder="Record business operational observations, stock checks, or obstacles..."
                  class="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Staff Recommendations</label>
                <textarea 
                  [(ngModel)]="caseNoteRecommendations" 
                  rows="2" 
                  placeholder="Action items, financial advice, or coaching provided..."
                  class="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
              </div>

              <div class="flex items-center gap-2 pt-1">
                <input type="checkbox" [(ngModel)]="caseNoteFollowUpRequired" id="fu_cb" class="rounded text-emerald-600 focus:ring-emerald-500">
                <label for="fu_cb" class="font-medium text-slate-700">Flag for ongoing follow-up visit</label>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button 
                (click)="closeCaseNoteModal()" 
                class="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg">
                Cancel
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
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  readonly authService = inject(AuthService);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly beneficiarySummary = signal<BeneficiaryFinancialSummary | null>(null);
  readonly isLoading = signal(true);
  readonly activeFollowUpModal = signal<AtRiskBeneficiary | null>(null);
  readonly isSavingCaseNote = signal(false);

  selectedBranch = '';
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
    this.dashboardService.getSummary(this.selectedBranch || undefined).subscribe({
      next: (res) => {
        this.summary.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
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
    this.dashboardService.exportBeneficiariesCsv(this.selectedBranch || undefined).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `livelihoods-report-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
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