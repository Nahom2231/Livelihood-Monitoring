import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-slate-50/70 dark:bg-slate-950 transition-colors duration-200">
      <div class="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-black/40 p-8 sm:p-10 transition-colors duration-200 relative">
        
        <!-- Back to Landing Page Button (Top Left Corner) -->
        <a 
          routerLink="/" 
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 absolute top-6 left-6"
          [title]="lang.t('common.backToHome')">
          <svg viewBox="0 0 20 20" fill="currentColor" class="size-3.5">
            <path fill-rule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clip-rule="evenodd" />
          </svg>
          <span>{{ lang.t('common.back') }}</span>
        </a>

        <!-- Header Emblem & Title -->
        <div class="text-center mb-8">
          <div class="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl mb-3 shadow-md shadow-emerald-600/20">
            LM
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {{ lang.t('auth.registerTitle') }}
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {{ lang.t('auth.registerDesc') }}
          </p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <!-- Error Alert Banner -->
          @if (errorMessage()) {
            <div class="p-3.5 text-xs bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl flex items-start gap-2.5 shadow-sm">
              <svg viewBox="0 0 20 20" fill="currentColor" class="size-4 shrink-0 text-rose-500 mt-0.5">
                <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
              </svg>
              <span class="leading-relaxed">{{ errorMessage() }}</span>
            </div>
          }

          <!-- Role Selection Visual Radio Buttons -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">{{ lang.t('auth.role') }}</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button 
                type="button" 
                (click)="setRole(0)"
                [ngClass]="selectedRole() === 0 ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'"
                class="p-2.5 text-xs border rounded-xl text-center transition-all cursor-pointer">
                <span class="block text-sm mb-0.5">🌾</span>
                <span>{{ lang.t('auth.beneficiary') }}</span>
              </button>

              <button 
                type="button" 
                (click)="setRole(1)"
                [ngClass]="selectedRole() === 1 ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'"
                class="p-2.5 text-xs border rounded-xl text-center transition-all cursor-pointer">
                <span class="block text-sm mb-0.5">📋</span>
                <span>{{ lang.t('auth.socialWorker') }}</span>
              </button>

              <button 
                type="button" 
                (click)="setRole(2)"
                [ngClass]="selectedRole() === 2 ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'"
                class="p-2.5 text-xs border rounded-xl text-center transition-all cursor-pointer">
                <span class="block text-sm mb-0.5">🏢</span>
                <span>{{ lang.t('auth.coordinator') }}</span>
              </button>

              <button 
                type="button" 
                (click)="setRole(3)"
                [ngClass]="selectedRole() === 3 ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'"
                class="p-2.5 text-xs border rounded-xl text-center transition-all cursor-pointer">
                <span class="block text-sm mb-0.5">📊</span>
                <span>{{ lang.t('auth.headMne') }}</span>
              </button>
            </div>
          </div>

          <!-- Personal Information -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{{ lang.t('auth.fullName') }}</label>
              <input 
                type="text" 
                formControlName="fullName" 
                [placeholder]="lang.t('auth.fullNamePlaceholder')"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
              @if (registerForm.get('fullName')?.touched && registerForm.get('fullName')?.invalid) {
                <span class="text-[11px] text-rose-600 dark:text-rose-400 mt-1 block">{{ lang.t('auth.fullNameRequired') }}</span>
              }
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{{ lang.t('auth.username') }}</label>
              <input 
                type="text" 
                formControlName="username" 
                [placeholder]="lang.t('auth.usernamePlaceholder')"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
              @if (registerForm.get('username')?.touched && registerForm.get('username')?.invalid) {
                <span class="text-[11px] text-rose-600 dark:text-rose-400 mt-1 block">{{ lang.t('auth.usernameRequired') }}</span>
              }
            </div>
          </div>

          <!-- Contact & Branch -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{{ lang.t('auth.phoneNumber') }}</label>
              <input 
                type="text" 
                formControlName="phoneNumber" 
                [placeholder]="lang.t('auth.phonePlaceholder')"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
              @if (registerForm.get('phoneNumber')?.touched && registerForm.get('phoneNumber')?.invalid) {
                <span class="text-[11px] text-rose-600 dark:text-rose-400 mt-1 block">{{ lang.t('auth.phoneRequired') }}</span>
              }
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{{ lang.t('auth.branch') }}</label>
              <select 
                formControlName="branchCode"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors">
                <option value="BR-AA-01">BR-AA-01 - Addis Ababa Central</option>
                <option value="BR-DR-02">BR-DR-02 - Dire Dawa Eastern</option>
                <option value="BR-OR-03">BR-OR-03 - Oromia South-Central</option>
                <option value="BR-001">BR-001 - Northern Branch</option>
                <option value="BR-002">BR-002 - Western Branch</option>
              </select>
            </div>
          </div>

          <!-- Conditional Fields for Beneficiary Entrepreneurs -->
          @if (selectedRole() === 0) {
            <div class="p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/30 space-y-3">
              <h4 class="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🌾</span> {{ lang.t('auth.enterpriseInfo') }}
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('auth.businessName') }}</label>
                  <input 
                    type="text" 
                    formControlName="businessName" 
                    [placeholder]="lang.t('auth.businessPlaceholder')"
                    class="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ lang.t('auth.sector') }}</label>
                  <select 
                    formControlName="livelihoodSector"
                    class="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                    <option value="Poultry">{{ lang.t('auth.sectorPoultry') }}</option>
                    <option value="Livestock">{{ lang.t('auth.sectorLivestock') }}</option>
                    <option value="Tailoring">{{ lang.t('auth.sectorTailoring') }}</option>
                    <option value="Retail">{{ lang.t('auth.sectorRetail') }}</option>
                    <option value="Fresh Produce">{{ lang.t('auth.sectorProduce') }}</option>
                    <option value="Food Service">{{ lang.t('auth.sectorFood') }}</option>
                  </select>
                </div>
              </div>
            </div>
          }

          <!-- Password & Confirm Password -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{{ lang.t('auth.password') }}</label>
              <div class="relative">
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  formControlName="password" 
                  [placeholder]="lang.t('auth.passwordMinPlaceholder')"
                  class="w-full pr-10 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
                <button 
                  type="button" 
                  (click)="showPassword.set(!showPassword())"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus:outline-none">
                  {{ showPassword() ? '🙈' : '👁️' }}
                </button>
              </div>
              @if (registerForm.get('password')?.touched && registerForm.get('password')?.invalid) {
                <span class="text-[11px] text-rose-600 dark:text-rose-400 mt-1 block">{{ lang.t('auth.passwordLengthRequired') }}</span>
              }
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{{ lang.t('auth.confirmPassword') }}</label>
              <input 
                [type]="showPassword() ? 'text' : 'password'" 
                formControlName="confirmPassword" 
                [placeholder]="lang.t('auth.passwordConfirmPlaceholder')"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
              @if (registerForm.get('confirmPassword')?.touched && passwordMismatch()) {
                <span class="text-[11px] text-rose-600 dark:text-rose-400 mt-1 block">{{ lang.t('auth.passwordsDoNotMatch') }}</span>
              }
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            [disabled]="registerForm.invalid || passwordMismatch() || isLoading()" 
            class="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
            @if (isLoading()) {
              <div class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{{ lang.t('auth.registering') }}</span>
            } @else {
              <span>{{ lang.t('auth.registerBtn') }}</span>
              <svg viewBox="0 0 20 20" fill="currentColor" class="size-4">
                <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" />
              </svg>
            }
          </button>

          <!-- Back to Login -->
          <div class="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
            <p class="text-xs text-slate-600 dark:text-slate-400">
              {{ lang.t('auth.hasAccount') }}
              <a routerLink="/login" class="font-bold text-emerald-600 dark:text-emerald-400 hover:underline ml-1">
                {{ lang.t('auth.logInHere') }}
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  readonly lang = inject(LanguageService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedRole = signal<number>(0); // 0 = Beneficiary
  readonly showPassword = signal(false);

  readonly registerForm = this.fb.group({
    fullName: ['', [Validators.required]],
    username: ['', [Validators.required]],
    phoneNumber: ['', [Validators.required]],
    role: [0, [Validators.required]],
    branchCode: ['BR-AA-01', [Validators.required]],
    businessName: [''],
    livelihoodSector: ['Poultry'],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    agreeTerms: [true, [Validators.requiredTrue]]
  });

  setRole(roleValue: number): void {
    this.selectedRole.set(roleValue);
    this.registerForm.patchValue({ role: roleValue });
    if (roleValue === 0) {
      this.registerForm.get('businessName')?.setValidators([Validators.required]);
    } else {
      this.registerForm.get('businessName')?.clearValidators();
    }
    this.registerForm.get('businessName')?.updateValueAndValidity();
  }

  passwordMismatch(): boolean {
    const pw = this.registerForm.get('password')?.value;
    const confirm = this.registerForm.get('confirmPassword')?.value;
    return !!pw && !!confirm && pw !== confirm;
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.passwordMismatch()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formVal = this.registerForm.getRawValue();

    this.authService.register({
      username: formVal.username!,
      password: formVal.password!,
      fullName: formVal.fullName!,
      phoneNumber: formVal.phoneNumber!,
      role: formVal.role!,
      branchCode: formVal.branchCode || undefined,
      businessName: formVal.role === 0 ? formVal.businessName || undefined : undefined,
      livelihoodSector: formVal.role === 0 ? formVal.livelihoodSector || undefined : undefined
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/login'], { queryParams: { registered: 'true', user: formVal.username } });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Registration failed. Please verify your details.');
      }
    });
  }
}
