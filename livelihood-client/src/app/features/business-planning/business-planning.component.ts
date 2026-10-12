import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

export interface BusinessGoalDto {
  id: string;
  beneficiaryProfileId: string;
  title: string;
  description: string;
  goalType: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  targetDateUtc?: string;
  isAchieved: boolean;
}

@Component({
  selector: 'app-business-planning',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              {{ lang.t('plan.strategicGrowth') }}
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">{{ lang.t('plan.subtitle') }}</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {{ lang.t('plan.title') }}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ lang.t('plan.subtitle') }}</p>
        </div>

        <button 
          (click)="showGoalModal.set(true)"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto">
          <svg viewBox="0 0 20 20" fill="currentColor" class="size-3.5">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          {{ lang.t('plan.newGoal') }}
        </button>
      </div>

      <!-- Calculators Section (Break-Even & Simple Budget) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Break-Even Estimator -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5 transition-colors">
          <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-bold text-slate-900 dark:text-white">{{ lang.t('plan.breakEvenCalc') }}</h2>
              <span class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">Monthly</span>
            </div>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ lang.t('plan.breakEvenDesc') }}</p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('plan.fixedCosts') }}</label>
              <input 
                type="number" 
                [(ngModel)]="fixedCosts" 
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span class="text-[11px] text-slate-400 dark:text-slate-500">{{ lang.t('plan.fixedCostsHint') }}</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('plan.sellingPrice') }}</label>
              <input 
                type="number" 
                [(ngModel)]="salePricePerUnit" 
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('plan.variableCost') }}</label>
              <input 
                type="number" 
                [(ngModel)]="costPerUnit" 
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span class="text-[11px] text-slate-400 dark:text-slate-500">{{ lang.t('plan.variableCostsHint') }}</span>
            </div>
          </div>

          <div class="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-800 transition-colors">
            <span class="text-xs font-semibold text-emerald-800 dark:text-emerald-300">{{ lang.t('plan.breakEvenReq') }}</span>
            <div class="text-3xl font-black text-emerald-900 dark:text-emerald-200 mt-1">
              {{ breakEvenUnits() > 0 ? (breakEvenUnits() | number:'1.0-0') : 0 }} {{ lang.t('plan.units') }}
            </div>
            <p class="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">
              Your business must sell at least <strong>{{ breakEvenUnits() | number:'1.0-0' }} units</strong> (totaling 
              <strong>{{ (breakEvenUnits() * salePricePerUnit()) | number:'1.2-2' }} ETB</strong> in gross sales) every month before yielding pure net profit.
            </p>
          </div>
        </div>

        <!-- Profit Margin Estimator -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5 transition-colors">
          <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-bold text-slate-900 dark:text-white">{{ lang.t('plan.grossMargin') }}</h2>
              <span class="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">{{ lang.t('plan.perItem') }}</span>
            </div>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ lang.t('plan.contributionMarginDesc') }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
              <span class="text-xs text-slate-500 dark:text-slate-400 block">{{ lang.t('plan.unitMargin') }}</span>
              <span class="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {{ (salePricePerUnit() - costPerUnit()) | number:'1.2-2' }} ETB
              </span>
              <span class="text-[11px] text-slate-400 dark:text-slate-500">{{ lang.t('plan.profitRetainedDesc') }}</span>
            </div>

            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
              <span class="text-xs text-slate-500 dark:text-slate-400 block">{{ lang.t('plan.marginPct') }}</span>
              <span class="text-2xl font-black text-indigo-700 dark:text-indigo-400 mt-1 block">
                {{ marginPercentage() | number:'1.1-1' }}%
              </span>
              <span class="text-[11px] text-slate-400 dark:text-slate-500">{{ lang.t('plan.ofSalesRevenue') }}</span>
            </div>
          </div>

          <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <div class="font-bold text-slate-800 dark:text-slate-200">{{ lang.t('plan.recommendationTitle') }}</div>
            <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
              {{ lang.t('plan.recommendationDesc') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Simple Monthly Budgeting Planner -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6 transition-colors">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 uppercase tracking-wider">
                {{ lang.t('plan.budgetTitle') }}
              </span>
              <span class="text-xs text-slate-400 dark:text-slate-500">{{ lang.t('plan.cashFlowAllocation') }}</span>
            </div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white mt-1">{{ lang.t('plan.budgetTool') }}</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ lang.t('plan.budgetToolDesc') }}</p>
          </div>

          <button 
            (click)="saveBudgetAsGoal()"
            [disabled]="isSavingGoal()"
            class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto">
            <span>📋</span> {{ lang.t('plan.budgetSaveBtn') }}
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">{{ lang.t('plan.projectedRev') }}</label>
            <input 
              type="number" 
              [(ngModel)]="budgetProjectedIncome" 
              class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <span class="text-[11px] text-slate-400 dark:text-slate-500 block">{{ lang.t('plan.expectedSales') }}</span>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">{{ lang.t('plan.stockMaterials') }}</label>
            <input 
              type="number" 
              [(ngModel)]="budgetRawMaterials" 
              class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <span class="text-[11px] text-slate-400 dark:text-slate-500 block">{{ lang.t('plan.rawMaterials') }}</span>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">{{ lang.t('plan.operatingOverhead') }}</label>
            <input 
              type="number" 
              [(ngModel)]="budgetOperatingExpenses" 
              class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <span class="text-[11px] text-slate-400 dark:text-slate-500 block">{{ lang.t('plan.operatingExpensesHint') }}</span>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">{{ lang.t('plan.savingsReserve') }}</label>
            <input 
              type="number" 
              [(ngModel)]="budgetSavingsContribution" 
              class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <span class="text-[11px] text-slate-400 dark:text-slate-500 block">{{ lang.t('plan.emergencyFundHint') }}</span>
          </div>
        </div>

        <!-- Budget Calculation Outcome -->
        <div class="p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors"
          [ngClass]="budgetNetCashFlow() >= 0 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' 
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider"
              [ngClass]="budgetNetCashFlow() >= 0 ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'">
              {{ budgetNetCashFlow() >= 0 ? '✓ Balanced Monthly Budget' : '⚠ Cash Flow Deficit Warning' }}
            </span>
            <div class="text-2xl font-black mt-0.5"
              [ngClass]="budgetNetCashFlow() >= 0 ? 'text-emerald-900 dark:text-emerald-200' : 'text-rose-900 dark:text-rose-200'">
              {{ budgetNetCashFlow() | number:'1.2-2' }} ETB {{ lang.t('plan.surplus') }}
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Savings allocation accounts for <strong>{{ budgetSavingsRate() | number:'1.1-1' }}%</strong> of monthly revenue.
            </p>
          </div>

          <div class="text-xs text-right text-slate-500 dark:text-slate-400 sm:max-w-xs">
            {{ lang.t('plan.budgetAdvice') }}
          </div>
        </div>
      </div>

      <!-- Real Business Goals Milestone Tracker -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">{{ lang.t('plan.activeMilestones') }}</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ lang.t('plan.milestonesSubtitle') }}</p>
          </div>
          <span class="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
            {{ goals().length }} {{ lang.t('plan.milestonesLogged') }}
          </span>
        </div>

        <div class="divide-y divide-slate-100 dark:divide-slate-800">
          @for (goal of goals(); track goal.id) {
            <div class="p-6 space-y-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      [ngClass]="{
                        'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300': goal.goalType === 'SavingsTarget',
                        'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300': goal.goalType === 'GoalSetting',
                        'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300': goal.goalType === 'SimpleBudget'
                      }">
                      {{ goal.goalType }}
                    </span>
                    @if (goal.isAchieved) {
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                        {{ lang.t('plan.milestoneReached') }}
                      </span>
                    }
                  </div>
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white mt-1">{{ goal.title }}</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ goal.description }}</p>
                </div>

                <div class="text-right">
                  <div class="text-base font-black text-slate-900 dark:text-white">
                    {{ goal.currentAmount | number:'1.2-2' }} / {{ goal.targetAmount | number:'1.2-2' }} ETB
                  </div>
                  <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {{ goal.progressPercentage | number:'1.0-1' }}% {{ lang.t('plan.completed') }}
                  </span>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="space-y-1">
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                    [style.width.%]="goal.progressPercentage > 100 ? 100 : goal.progressPercentage">
                  </div>
                </div>
              </div>

              <!-- Action Controls -->
              <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div class="flex items-center gap-2">
                  <button 
                    (click)="addProgress(goal, 500)"
                    class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                    + 500 ETB
                  </button>
                  <button 
                    (click)="addProgress(goal, 1000)"
                    class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                    + 1,000 ETB
                  </button>
                  <button 
                    (click)="openCustomDeposit(goal)"
                    class="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-semibold rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors">
                    {{ lang.t('plan.depositProgress') }}
                  </button>
                </div>

                <button 
                  (click)="deleteGoal(goal.id)"
                  class="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 font-medium text-xs">
                  {{ lang.t('plan.removeGoal') }}
                </button>
              </div>
            </div>
          } @empty {
            <div class="p-12 text-center text-xs text-slate-400 dark:text-slate-500">
              <span class="text-3xl block mb-2">🎯</span>
              {{ lang.t('plan.noGoals') }}
              <p class="mt-1 text-slate-500 dark:text-slate-400">{{ lang.t('plan.noGoalsSub') }}</p>
            </div>
          }
        </div>
      </div>

      <!-- Add New Business Goal Modal -->
      @if (showGoalModal()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200 dark:border-slate-800 transition-colors">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ lang.t('plan.newGoal') }}</h3>
              <button (click)="showGoalModal.set(false)" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">&times;</button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('plan.goalTitleLabel') }}</label>
                <input 
                  type="text" 
                  [(ngModel)]="newGoalTitle" 
                  [placeholder]="lang.t('plan.goalTitlePlaceholder')" 
                  class="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('plan.goalCategoryLabel') }}</label>
                <select 
                  [(ngModel)]="newGoalType" 
                  class="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                  <option [value]="0">{{ lang.t('plan.goalCatBudget') }}</option>
                  <option [value]="1">{{ lang.t('plan.goalCatGrowth') }}</option>
                  <option [value]="2">{{ lang.t('plan.goalCatEmergency') }}</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('plan.targetAmountLabel') }}</label>
                  <input 
                    type="number" 
                    [(ngModel)]="newGoalTargetAmount" 
                    placeholder="10000" 
                    class="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('plan.currentSavedLabel') }}</label>
                  <input 
                    type="number" 
                    [(ngModel)]="newGoalCurrentAmount" 
                    placeholder="0" 
                    class="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('plan.goalNotesLabel') }}</label>
                <textarea 
                  rows="2" 
                  [(ngModel)]="newGoalDescription" 
                  [placeholder]="lang.t('plan.goalNotesPlaceholder')" 
                  class="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button 
                (click)="showGoalModal.set(false)" 
                class="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                {{ lang.t('common.cancel') }}
              </button>
              <button 
                (click)="saveGoal()" 
                [disabled]="isSavingGoal() || !newGoalTitle || !newGoalTargetAmount" 
                class="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm">
                {{ isSavingGoal() ? lang.t('common.loading') : lang.t('plan.createMilestoneBtn') }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class BusinessPlanningComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly authService = inject(AuthService);
  readonly lang = inject(LanguageService);

  readonly fixedCosts = signal(2500);
  readonly salePricePerUnit = signal(150);
  readonly costPerUnit = signal(85);

  // Simple Monthly Budget Planner Signals
  readonly budgetProjectedIncome = signal(15000);
  readonly budgetRawMaterials = signal(7500);
  readonly budgetOperatingExpenses = signal(2500);
  readonly budgetSavingsContribution = signal(2000);

  readonly budgetNetCashFlow = computed(() => {
    return this.budgetProjectedIncome() - this.budgetRawMaterials() - this.budgetOperatingExpenses() - this.budgetSavingsContribution();
  });

  readonly budgetSavingsRate = computed(() => {
    return this.budgetProjectedIncome() > 0 
      ? (this.budgetSavingsContribution() / this.budgetProjectedIncome()) * 100 
      : 0;
  });

  readonly breakEvenUnits = computed(() => {
    const margin = this.salePricePerUnit() - this.costPerUnit();
    if (margin <= 0) return 0;
    return Math.ceil(this.fixedCosts() / margin);
  });

  readonly marginPercentage = computed(() => {
    if (this.salePricePerUnit() <= 0) return 0;
    return ((this.salePricePerUnit() - this.costPerUnit()) / this.salePricePerUnit()) * 100;
  });

  readonly goals = signal<BusinessGoalDto[]>([]);
  readonly showGoalModal = signal(false);
  readonly isSavingGoal = signal(false);

  newGoalTitle = '';
  newGoalType = 2; // SavingsTarget
  newGoalTargetAmount: number | null = null;
  newGoalCurrentAmount = 0;
  newGoalDescription = '';

  ngOnInit(): void {
    this.loadGoals();
  }

  loadGoals(): void {
    const profileId = this.authService.currentUser()?.beneficiaryProfileId;
    const url = profileId 
      ? `${environment.apiUrl}/business-planning/goals/beneficiary/${profileId}` 
      : `${environment.apiUrl}/business-planning/goals`;

    this.http.get<BusinessGoalDto[]>(url).subscribe({
      next: (res) => {
        this.goals.set(res || []);
      },
      error: () => {
        this.goals.set([]);
      }
    });
  }

  saveGoal(): void {
    if (!this.newGoalTitle || !this.newGoalTargetAmount) return;

    this.isSavingGoal.set(true);
    const profileId = this.authService.currentUser()?.beneficiaryProfileId || '11111111-1111-1111-1111-111111111111';

    const payload = {
      beneficiaryProfileId: profileId,
      title: this.newGoalTitle,
      description: this.newGoalDescription || 'Personal business goal',
      type: Number(this.newGoalType),
      targetAmount: Number(this.newGoalTargetAmount),
      currentAmount: Number(this.newGoalCurrentAmount || 0)
    };

    this.http.post<BusinessGoalDto>(`${environment.apiUrl}/business-planning/goals`, payload).subscribe({
      next: (created) => {
        this.isSavingGoal.set(false);
        this.goals.update(prev => [created, ...prev]);
        this.resetModal();
      },
      error: () => {
        this.isSavingGoal.set(false);
      }
    });
  }

  saveBudgetAsGoal(): void {
    this.isSavingGoal.set(true);
    const profileId = this.authService.currentUser()?.beneficiaryProfileId || '11111111-1111-1111-1111-111111111111';

    const payload = {
      beneficiaryProfileId: profileId,
      title: `Monthly Budget Target: Net Surplus ${this.budgetNetCashFlow().toFixed(0)} ETB`,
      description: `Target revenue of ${this.budgetProjectedIncome()} ETB with ${this.budgetSavingsContribution()} ETB allocated to savings reserve.`,
      type: 0, // SimpleBudget
      targetAmount: Number(this.budgetProjectedIncome()),
      currentAmount: 0
    };

    this.http.post<BusinessGoalDto>(`${environment.apiUrl}/business-planning/goals`, payload).subscribe({
      next: (created) => {
        this.isSavingGoal.set(false);
        this.goals.update(prev => [created, ...prev]);
      },
      error: () => {
        this.isSavingGoal.set(false);
      }
    });
  }

  addProgress(goal: BusinessGoalDto, increment: number): void {
    this.http.put<BusinessGoalDto>(`${environment.apiUrl}/business-planning/goals/${goal.id}/progress`, {
      amount: increment,
      isIncremental: true
    }).subscribe({
      next: (updated) => {
        this.goals.update(list => list.map(g => g.id === goal.id ? updated : g));
      }
    });
  }

  openCustomDeposit(goal: BusinessGoalDto): void {
    const amountStr = prompt(`Enter deposit amount in ETB toward "${goal.title}":`, '500');
    if (!amountStr) return;
    const num = parseFloat(amountStr);
    if (!isNaN(num) && num > 0) {
      this.addProgress(goal, num);
    }
  }

  deleteGoal(goalId: string): void {
    if (!confirm('Are you sure you want to remove this milestone?')) return;

    this.http.delete(`${environment.apiUrl}/business-planning/goals/${goalId}`).subscribe({
      next: () => {
        this.goals.update(list => list.filter(g => g.id !== goalId));
      }
    });
  }

  private resetModal(): void {
    this.showGoalModal.set(false);
    this.newGoalTitle = '';
    this.newGoalTargetAmount = null;
    this.newGoalCurrentAmount = 0;
    this.newGoalDescription = '';
  }
}