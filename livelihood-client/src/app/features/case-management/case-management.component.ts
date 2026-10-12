import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

interface BeneficiaryOption {
  id: string;
  fullName: string;
  branchCode: string;
  region: string;
  livelihoodSector: string;
  businessName: string;
}

interface CaseNoteItem {
  id: string;
  beneficiaryProfileId: string;
  beneficiaryName: string;
  staffName: string;
  branchCode: string;
  visitDate: string;
  findings: string;
  recommendations: string;
  followUpRequired: boolean;
  nextFollowUpDate?: string;
}

interface TrainingItem {
  id: string;
  trainingTitle: string;
  vocationalSector: string;
  trainerOrInstitution: string;
  completedDate: string;
  notes: string;
}

@Component({
  selector: 'app-case-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              {{ lang.t('case.fieldOps') }}
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">{{ lang.t('case.onsiteMonitoring') }}</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {{ lang.t('case.title') }}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ lang.t('case.subtitle') }}</p>
        </div>

        <div class="flex items-center gap-2">
          <button 
            (click)="activeTab.set('notes'); showForm.set(!showForm())"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
            <svg viewBox="0 0 20 20" fill="currentColor" class="size-3.5">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            {{ showForm() && activeTab() === 'notes' ? lang.t('common.close') : lang.t('case.logVisit') }}
          </button>
          <button 
            (click)="activeTab.set('training'); showTrainingForm.set(!showTrainingForm())"
            class="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg border border-slate-300 dark:border-slate-700 transition-colors">
            {{ showTrainingForm() && activeTab() === 'training' ? lang.t('common.close') : lang.t('case.recordTraining') }}
          </button>
        </div>
      </div>

      <!-- Add Case Note Form -->
      @if (showForm() && activeTab() === 'notes') {
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-colors">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 class="text-base font-bold text-slate-900 dark:text-white">{{ lang.t('case.logVisit') }}</h2>
            <button (click)="showForm.set(false)" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm">{{ lang.t('common.cancel') }}</button>
          </div>

          <form [formGroup]="noteForm" (ngSubmit)="submitNote()" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('case.chooseBeneficiary') }} *</label>
                <select 
                  formControlName="beneficiaryProfileId" 
                  (change)="onBeneficiarySelect($event)"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                  <option value="">-- {{ lang.t('case.chooseBeneficiary') }} --</option>
                  @for (b of beneficiaries(); track b.id) {
                    <option [value]="b.id">{{ b.fullName }} ({{ b.branchCode }} - {{ b.livelihoodSector }})</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('case.visitDateLabel') }}</label>
                <input 
                  type="date" 
                  formControlName="visitDateUtc" 
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('case.findings') }} *</label>
              <textarea 
                rows="3" 
                formControlName="visitFindings" 
                [placeholder]="lang.t('case.visitFindingsPlaceholder')"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none">
              </textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('case.recommendations') }} *</label>
              <textarea 
                rows="2" 
                formControlName="recommendations" 
                [placeholder]="lang.t('case.recommendationsPlaceholder')"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none">
              </textarea>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div class="flex items-center gap-2">
                <input type="checkbox" id="followUp" formControlName="followUpRequired" class="rounded text-emerald-600 focus:ring-emerald-500">
                <label for="followUp" class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ lang.t('case.followUp') }}</label>
              </div>

              <div class="flex items-center gap-2">
                <button 
                  type="button" 
                  (click)="showForm.set(false)" 
                  class="px-4 py-2 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {{ lang.t('common.cancel') }}
                </button>
                <button 
                  type="submit" 
                  [disabled]="noteForm.invalid || isSubmitting()"
                  class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm">
                  {{ isSubmitting() ? lang.t('common.loading') : lang.t('case.saveVisit') }}
                </button>
              </div>
            </div>
          </form>
        </div>
      }

      <!-- Add Training Form -->
      @if (showTrainingForm() && activeTab() === 'training') {
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-colors">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 class="text-base font-bold text-slate-900 dark:text-white">{{ lang.t('case.recordTraining') }}</h2>
            <button (click)="showTrainingForm.set(false)" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm">{{ lang.t('common.cancel') }}</button>
          </div>

          <form [formGroup]="trainingForm" (ngSubmit)="submitTraining()" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('case.chooseBeneficiary') }} *</label>
                <select 
                  formControlName="beneficiaryProfileId" 
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                  <option value="">-- {{ lang.t('case.chooseBeneficiary') }} --</option>
                  @for (b of beneficiaries(); track b.id) {
                    <option [value]="b.id">{{ b.fullName }} ({{ b.branchCode }})</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('case.trainingTitleLabel') }}</label>
                <input 
                  type="text" 
                  formControlName="trainingTitle" 
                  [placeholder]="lang.t('case.trainingTitlePlaceholder')"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('case.vocationalSectorLabel') }}</label>
                <input 
                  type="text" 
                  formControlName="vocationalSector" 
                  [placeholder]="lang.t('case.vocationalSectorPlaceholder')"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('case.trainerLabel') }}</label>
                <input 
                  type="text" 
                  formControlName="trainerOrInstitution" 
                  [placeholder]="lang.t('case.trainerPlaceholder')"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('case.trainingNotesLabel') }}</label>
              <textarea 
                rows="2" 
                formControlName="notes" 
                [placeholder]="lang.t('case.trainingNotesPlaceholder')"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none">
              </textarea>
            </div>

            <div class="flex justify-end gap-2 pt-1">
              <button 
                type="button" 
                (click)="showTrainingForm.set(false)" 
                class="px-4 py-2 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                {{ lang.t('common.cancel') }}
              </button>
              <button 
                type="submit" 
                [disabled]="trainingForm.invalid || isSubmitting()" 
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm">
                {{ isSubmitting() ? lang.t('common.loading') : lang.t('case.recordTrainingBtn') }}
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Filter Bar & Tab Selector -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div class="flex items-center gap-2">
          <button 
            (click)="activeTab.set('notes')" 
            [ngClass]="activeTab() === 'notes' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'"
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors">
            {{ lang.t('case.visitNotesTab') }} ({{ notes().length }})
          </button>
          <button 
            (click)="activeTab.set('training')" 
            [ngClass]="activeTab() === 'training' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'"
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors">
            {{ lang.t('case.trainingsTab') }} ({{ trainings().length }})
          </button>
        </div>

        <div class="flex items-center gap-2 text-xs">
          <label class="font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{{ lang.t('case.filterByBeneficiary') }}</label>
          <select 
            [(ngModel)]="filterBeneficiaryId" 
            (ngModelChange)="onFilterChange()"
            class="border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">{{ lang.t('case.allBeneficiaries') }}</option>
            @for (b of beneficiaries(); track b.id) {
              <option [value]="b.id">{{ b.fullName }} ({{ b.branchCode }})</option>
            }
          </select>
        </div>
      </div>

      <!-- Feed Content -->
      @if (activeTab() === 'notes') {
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-900 dark:text-white">{{ lang.t('case.supervisorLog') }}</h2>
            <span class="text-xs text-slate-400 dark:text-slate-500 font-mono">{{ notes().length }} {{ lang.t('case.loggedRecords') }}</span>
          </div>

          <div class="divide-y divide-slate-100 dark:divide-slate-800">
            @for (n of notes(); track n.id) {
              <div class="p-6 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                      {{ n.beneficiaryName ? n.beneficiaryName.charAt(0) : 'B' }}
                    </div>
                    <div>
                      <h3 class="text-xs font-bold text-slate-900 dark:text-white">{{ n.beneficiaryName }}</h3>
                      <span class="text-[11px] text-slate-400 dark:text-slate-500">
                        {{ n.branchCode }} • {{ lang.t('case.visitedBy') }} {{ n.staffName }} • {{ n.visitDate | date:'mediumDate' }}
                      </span>
                    </div>
                  </div>

                  @if (n.followUpRequired) {
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      {{ lang.t('case.actionRequired') }}
                    </span>
                  } @else {
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {{ lang.t('case.stable') }}
                    </span>
                  }
                </div>

                <div class="text-xs text-slate-600 dark:text-slate-300 space-y-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <p><strong class="text-slate-800 dark:text-white">{{ lang.t('case.findingsPrefix') }}</strong> {{ n.findings }}</p>
                  <p><strong class="text-emerald-700 dark:text-emerald-400">{{ lang.t('case.advicePrefix') }}</strong> {{ n.recommendations }}</p>
                </div>
              </div>
            } @empty {
              <div class="p-12 text-center text-xs text-slate-400 dark:text-slate-500">
                {{ lang.t('case.noNotes') }}
              </div>
            }
          </div>
        </div>
      } @else {
        <!-- Trainings Feed -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-900 dark:text-white">{{ lang.t('case.trainingRecords') }}</h2>
            <span class="text-xs text-slate-400 dark:text-slate-500 font-mono">{{ trainings().length }} {{ lang.t('case.completions') }}</span>
          </div>

          <div class="divide-y divide-slate-100 dark:divide-slate-800">
            @for (t of trainings(); track t.id) {
              <div class="p-6 space-y-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-xs font-bold text-slate-900 dark:text-white">{{ t.trainingTitle }}</h3>
                    <span class="text-[11px] text-slate-400 dark:text-slate-500">
                      Sector: {{ t.vocationalSector }} • Institution: {{ t.trainerOrInstitution }}
                    </span>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                    {{ t.completedDate | date:'mediumDate' }}
                  </span>
                </div>
                <p class="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800">{{ t.notes }}</p>
              </div>
            } @empty {
              <div class="p-12 text-center text-xs text-slate-400 dark:text-slate-500">
                {{ lang.t('case.noTrainings') }}
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class CaseManagementComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  readonly authService = inject(AuthService);
  readonly lang = inject(LanguageService);

  readonly showForm = signal(false);
  readonly showTrainingForm = signal(false);
  readonly isSubmitting = signal(false);
  readonly activeTab = signal<'notes' | 'training'>('notes');

  readonly beneficiaries = signal<BeneficiaryOption[]>([]);
  readonly notes = signal<CaseNoteItem[]>([]);
  readonly trainings = signal<TrainingItem[]>([]);

  filterBeneficiaryId = '';

  readonly noteForm = this.fb.group({
    beneficiaryProfileId: ['', Validators.required],
    visitDateUtc: [new Date().toISOString().split('T')[0], Validators.required],
    visitFindings: ['', Validators.required],
    recommendations: ['', Validators.required],
    followUpRequired: [false]
  });

  readonly trainingForm = this.fb.group({
    beneficiaryProfileId: ['', Validators.required],
    trainingTitle: ['', Validators.required],
    vocationalSector: ['', Validators.required],
    trainerOrInstitution: ['', Validators.required],
    completedDateUtc: [new Date().toISOString().split('T')[0], Validators.required],
    notes: ['']
  });

  ngOnInit(): void {
    this.loadBeneficiaries();
    this.loadAllRealNotesAndTrainings();
  }

  loadBeneficiaries(): void {
    this.http.get<BeneficiaryOption[]>(`${environment.apiUrl}/beneficiaries`).subscribe({
      next: (list) => {
        this.beneficiaries.set(list || []);
      },
      error: () => {
        this.beneficiaries.set([]);
      }
    });
  }

  loadAllRealNotesAndTrainings(): void {
    this.http.get<any[]>(`${environment.apiUrl}/case-management/case-notes`).subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          const mapped: CaseNoteItem[] = res.map(n => {
            const ben = this.beneficiaries().find(b => b.id === n.beneficiaryProfileId);
            return {
              id: n.id,
              beneficiaryProfileId: n.beneficiaryProfileId,
              beneficiaryName: ben?.fullName || n.staffName || 'Beneficiary Enterprise',
              staffName: n.staffName || 'Social Worker',
              branchCode: ben?.branchCode || 'BR-AA-01',
              visitDate: n.visitDateUtc,
              findings: n.visitFindings,
              recommendations: n.recommendations,
              followUpRequired: n.followUpRequired,
              nextFollowUpDate: n.nextFollowUpDateUtc
            };
          });
          this.notes.set(mapped);
        } else {
          this.notes.set([]);
        }
      },
      error: () => {
        this.notes.set([]);
      }
    });

    this.http.get<any[]>(`${environment.apiUrl}/case-management/trainings`).subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          const mapped: TrainingItem[] = res.map(t => ({
            id: t.id,
            trainingTitle: t.trainingTitle,
            vocationalSector: t.vocationalSector,
            trainerOrInstitution: t.trainerOrInstitution,
            completedDate: t.completedDateUtc,
            notes: t.notes
          }));
          this.trainings.set(mapped);
        } else {
          this.trainings.set([]);
        }
      },
      error: () => {
        this.trainings.set([]);
      }
    });
  }

  onBeneficiarySelect(event: any): void {
    const benId = event.target.value;
    if (benId) {
      this.loadNotesForBeneficiary(benId);
    }
  }

  onFilterChange(): void {
    if (this.filterBeneficiaryId) {
      this.loadNotesForBeneficiary(this.filterBeneficiaryId);
    } else {
      this.loadAllRealNotesAndTrainings();
    }
  }

  loadNotesForBeneficiary(benId: string): void {
    this.http.get<any[]>(`${environment.apiUrl}/case-management/case-notes/beneficiary/${benId}`).subscribe({
      next: (res) => {
        const ben = this.beneficiaries().find(b => b.id === benId);
        const mapped: CaseNoteItem[] = (res || []).map(n => ({
          id: n.id,
          beneficiaryProfileId: n.beneficiaryProfileId,
          beneficiaryName: ben?.fullName || 'Beneficiary',
          staffName: n.staffName || 'Social Worker',
          branchCode: ben?.branchCode || 'BR-AA-01',
          visitDate: n.visitDateUtc,
          findings: n.visitFindings,
          recommendations: n.recommendations,
          followUpRequired: n.followUpRequired,
          nextFollowUpDate: n.nextFollowUpDateUtc
        }));
        this.notes.set(mapped);
      },
      error: () => {
        this.notes.set([]);
      }
    });

    this.http.get<any[]>(`${environment.apiUrl}/case-management/trainings/beneficiary/${benId}`).subscribe({
      next: (res) => {
        const mapped: TrainingItem[] = (res || []).map(t => ({
          id: t.id,
          trainingTitle: t.trainingTitle,
          vocationalSector: t.vocationalSector,
          trainerOrInstitution: t.trainerOrInstitution,
          completedDate: t.completedDateUtc,
          notes: t.notes
        }));
        this.trainings.set(mapped);
      },
      error: () => {
        this.trainings.set([]);
      }
    });
  }

  submitNote(): void {
    if (this.noteForm.invalid) return;

    this.isSubmitting.set(true);
    const val = this.noteForm.getRawValue();
    const currentUser = this.authService.currentUser();
    const selectedBen = this.beneficiaries().find(b => b.id === val.beneficiaryProfileId);

    const payload = {
      beneficiaryProfileId: val.beneficiaryProfileId,
      staffId: currentUser?.userId || 'staff-1',
      staffName: currentUser?.fullName || currentUser?.username || 'Social Worker',
      visitDateUtc: new Date(val.visitDateUtc!).toISOString(),
      visitFindings: val.visitFindings,
      recommendations: val.recommendations,
      followUpRequired: !!val.followUpRequired
    };

    this.http.post<any>(`${environment.apiUrl}/case-management/case-notes`, payload).subscribe({
      next: (saved) => {
        this.isSubmitting.set(false);
        const newEntry: CaseNoteItem = {
          id: saved?.id || Math.random().toString(),
          beneficiaryProfileId: val.beneficiaryProfileId!,
          beneficiaryName: selectedBen?.fullName || 'Beneficiary',
          staffName: payload.staffName,
          branchCode: selectedBen?.branchCode || 'BR-AA-01',
          visitDate: val.visitDateUtc!,
          findings: val.visitFindings!,
          recommendations: val.recommendations!,
          followUpRequired: !!val.followUpRequired
        };
        this.notes.update(prev => [newEntry, ...prev]);
        this.noteForm.reset({ visitDateUtc: new Date().toISOString().split('T')[0], followUpRequired: false });
        this.showForm.set(false);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  submitTraining(): void {
    if (this.trainingForm.invalid) return;

    this.isSubmitting.set(true);
    const val = this.trainingForm.getRawValue();

    const payload = {
      beneficiaryProfileId: val.beneficiaryProfileId,
      trainingTitle: val.trainingTitle,
      vocationalSector: val.vocationalSector,
      trainerOrInstitution: val.trainerOrInstitution,
      completedDateUtc: new Date(val.completedDateUtc!).toISOString(),
      notes: val.notes || ''
    };

    this.http.post<any>(`${environment.apiUrl}/case-management/trainings`, payload).subscribe({
      next: (saved) => {
        this.isSubmitting.set(false);
        const newEntry: TrainingItem = {
          id: saved?.id || Math.random().toString(),
          trainingTitle: val.trainingTitle!,
          vocationalSector: val.vocationalSector!,
          trainerOrInstitution: val.trainerOrInstitution!,
          completedDate: val.completedDateUtc!,
          notes: val.notes || ''
        };
        this.trainings.update(prev => [newEntry, ...prev]);
        this.trainingForm.reset({ completedDateUtc: new Date().toISOString().split('T')[0] });
        this.showTrainingForm.set(false);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}