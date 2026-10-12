import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-slate-50/70 dark:bg-slate-950 transition-colors duration-200">
      <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-black/40 p-8 sm:p-9 relative transition-colors duration-200">
        
        <!-- Back to Landing Page Button (Top Left Corner) -->
        <a 
          routerLink="/" 
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 absolute top-6 left-6"
          title="Back to Landing Page">
          <svg viewBox="0 0 20 20" fill="currentColor" class="size-3.5">
            <path fill-rule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clip-rule="evenodd" />
          </svg>
          <span>{{ lang.t('common.back') }}</span>
        </a>

        <!-- Header Emblem & Titles -->
        <div class="text-center mb-7">
          <div class="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl mb-3 shadow-md shadow-emerald-600/20">
            LM
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {{ isForgotPassword() ? lang.t('auth.resetPasswordTitle') : lang.t('auth.signInTitle') }}
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            {{ isForgotPassword() 
              ? lang.t('auth.resetPasswordDesc') 
              : lang.t('auth.signInDesc') }}
          </p>
        </div>

        <!-- Success Alert Notification -->
        @if (successMessage()) {
          <div class="mb-5 p-3.5 text-xs bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-start gap-2.5 shadow-sm">
            <svg viewBox="0 0 20 20" fill="currentColor" class="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5">
              <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" />
            </svg>
            <span class="leading-relaxed">{{ successMessage() }}</span>
          </div>
        }

        <!-- Error Alert Notification -->
        @if (errorMessage()) {
          <div class="mb-5 p-3.5 text-xs bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl flex items-start gap-2.5 shadow-sm">
            <svg viewBox="0 0 20 20" fill="currentColor" class="size-4 shrink-0 text-rose-500 mt-0.5">
              <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
            </svg>
            <span class="leading-relaxed">{{ errorMessage() }}</span>
          </div>
        }

        <!-- ========================================== -->
        <!-- FORGOT PASSWORD FORM                       -->
        <!-- ========================================== -->
        @if (isForgotPassword()) {
          <form [formGroup]="forgotPasswordForm" (ngSubmit)="onForgotPasswordSubmit()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{{ lang.t('auth.usernameOrPhone') }}</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg viewBox="0 0 20 20" fill="currentColor" class="size-4">
                    <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                  </svg>
                </span>
                <input 
                  type="text" 
                  formControlName="username" 
                  placeholder="e.g. ben_abebe or 0911234567"
                  class="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                New Password <span class="text-slate-400 font-normal">(Optional - defaults to Password123!)</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg viewBox="0 0 20 20" fill="currentColor" class="size-4">
                    <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clip-rule="evenodd" />
                  </svg>
                </span>
                <input 
                  type="password" 
                  formControlName="newPassword" 
                  placeholder="Enter new password"
                  class="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit" 
              [disabled]="forgotPasswordForm.invalid || isLoading()" 
              class="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
              @if (isLoading()) {
                <div class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{{ lang.t('common.loading') }}</span>
              } @else {
                <span>{{ lang.t('auth.sendResetInstructions') }}</span>
              }
            </button>

            <div class="pt-3 text-center">
              <button 
                type="button" 
                (click)="toggleForgotPassword(false)" 
                class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer inline-flex items-center gap-1">
                ← {{ lang.t('auth.backToSignIn') }}
              </button>
            </div>
          </form>
        } @else {
          <!-- ========================================== -->
          <!-- SIGN IN FORM                               -->
          <!-- ========================================== -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{{ lang.t('auth.usernameOrPhone') }}</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg viewBox="0 0 20 20" fill="currentColor" class="size-4">
                    <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                  </svg>
                </span>
                <input 
                  type="text" 
                  formControlName="username" 
                  placeholder="e.g. headoffice_mne or ben_abebe"
                  class="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">{{ lang.t('auth.password') }}</label>
                <button 
                  type="button" 
                  (click)="toggleForgotPassword(true)" 
                  class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                  {{ lang.t('auth.forgotPassword') }}
                </button>
              </div>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg viewBox="0 0 20 20" fill="currentColor" class="size-4">
                    <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clip-rule="evenodd" />
                  </svg>
                </span>
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  formControlName="password" 
                  placeholder="••••••••"
                  class="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
                <button 
                  type="button" 
                  (click)="showPassword.set(!showPassword())"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus:outline-none">
                  @if (showPassword()) {
                    <svg viewBox="0 0 20 20" fill="currentColor" class="size-4">
                      <path fill-rule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.375l1.091 1.092a4 4 0 0 0-5.557-5.558Z" clip-rule="evenodd" />
                      <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
                    </svg>
                  } @else {
                    <svg viewBox="0 0 20 20" fill="currentColor" class="size-4">
                      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                      <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clip-rule="evenodd" />
                    </svg>
                  }
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              [disabled]="loginForm.invalid || isLoading()" 
              class="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
              @if (isLoading()) {
                <div class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{{ lang.t('auth.signingIn') }}</span>
              } @else {
                <span>{{ lang.t('auth.signInBtn') }}</span>
                <svg viewBox="0 0 20 20" fill="currentColor" class="size-4">
                  <path fill-rule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clip-rule="evenodd" />
                </svg>
              }
            </button>

            <!-- Register link if user doesn't have an account -->
            <div class="pt-3 text-center border-t border-slate-100 dark:border-slate-800 mt-5">
              <p class="text-xs text-slate-600 dark:text-slate-400">
                {{ lang.t('auth.noAccount') }}
                <a routerLink="/register" class="font-bold text-emerald-600 dark:text-emerald-400 hover:underline ml-1">
                  {{ lang.t('auth.registerHere') }}
                </a>
              </p>
            </div>
          </form>

          <!-- Collapsible Quick-Fill Demo Helpers -->
          <div class="mt-4 pt-3 text-center">
            <button 
              type="button" 
              (click)="showDemoDrawer.set(!showDemoDrawer())"
              class="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer inline-flex items-center gap-1">
              <span>{{ showDemoDrawer() ? 'Hide test accounts' : 'Quick fill test credentials' }}</span>
              <span class="text-[9px]">{{ showDemoDrawer() ? '▲' : '▼' }}</span>
            </button>

            @if (showDemoDrawer()) {
              <div class="grid grid-cols-2 gap-2 mt-3 text-left">
                <button 
                  type="button" 
                  (click)="fillPreset('headoffice_mne')"
                  class="p-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 transition-colors">
                  <span class="block font-bold text-slate-900 dark:text-white">M&E Lead</span>
                  <span class="text-[10px] text-slate-500 dark:text-slate-400">headoffice_mne</span>
                </button>
                <button 
                  type="button" 
                  (click)="fillPreset('social_worker_1')"
                  class="p-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 transition-colors">
                  <span class="block font-bold text-slate-900 dark:text-white">Social Worker</span>
                  <span class="text-[10px] text-slate-500 dark:text-slate-400">social_worker_1</span>
                </button>
                <button 
                  type="button" 
                  (click)="fillPreset('ben_abebe')"
                  class="p-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 transition-colors">
                  <span class="block font-bold text-slate-900 dark:text-white">Tailoring</span>
                  <span class="text-[10px] text-slate-500 dark:text-slate-400">ben_abebe</span>
                </button>
                <button 
                  type="button" 
                  (click)="fillPreset('ben_fatima')"
                  class="p-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 transition-colors">
                  <span class="block font-bold text-slate-900 dark:text-white">Poultry</span>
                  <span class="text-[10px] text-slate-500 dark:text-slate-400">ben_fatima</span>
                </button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  readonly lang = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly isForgotPassword = signal(false);
  readonly showPassword = signal(false);
  readonly showDemoDrawer = signal(false);

  readonly loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [true]
  });

  readonly forgotPasswordForm = this.fb.group({
    username: ['', [Validators.required]],
    newPassword: ['']
  });

  ngOnInit(): void {
    const savedUser = localStorage.getItem('lm_remembered_user');
    if (savedUser) {
      this.loginForm.patchValue({ username: savedUser });
    }

    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.successMessage.set('Registration successful! Please enter your password to sign in.');
        if (params['user']) {
          this.loginForm.patchValue({ username: params['user'], password: '' });
        }
      }
    });
  }

  toggleForgotPassword(show: boolean): void {
    this.isForgotPassword.set(show);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    if (show) {
      const currentUser = this.loginForm.get('username')?.value || '';
      this.forgotPasswordForm.patchValue({ username: currentUser, newPassword: '' });
    }
  }

  fillPreset(user: string): void {
    this.loginForm.patchValue({ username: user, password: 'Password123!' });
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { username, password, rememberMe } = this.loginForm.getRawValue();

    if (rememberMe && username) {
      localStorage.setItem('lm_remembered_user', username);
    } else {
      localStorage.removeItem('lm_remembered_user');
    }

    this.authService.login({ username: username!, password: password! }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid username or password. Check your credentials.');
      }
    });
  }

  onForgotPasswordSubmit(): void {
    if (this.forgotPasswordForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { username, newPassword } = this.forgotPasswordForm.getRawValue();

    this.authService.forgotPassword(username!, newPassword || undefined).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message);
        this.loginForm.patchValue({ username: username!, password: newPassword || 'Password123!' });
        this.isForgotPassword.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Password reset failed. Please verify your username.');
      }
    });
  }
}