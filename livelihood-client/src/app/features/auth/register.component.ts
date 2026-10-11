import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-slate-50/70">
      <div class="w-full max-w-xl bg-white rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/50 p-8 sm:p-10">
        
        <!-- Header Emblem & Title -->
        <div class="text-center mb-8">
          <div class="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl mb-3 shadow-md shadow-emerald-600/20">
            LM
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Create an Account</h2>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Enroll into the Livelihood Monitoring Platform as an entrepreneur or program officer
          </p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <!-- Error Alert Banner -->
          @if (errorMessage()) {
            <div class="p-3.5 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2.5 shadow-sm">
              <svg viewBox="0 0 20 20" fill="currentColor" class="size-4 shrink-0 text-rose-500 mt-0.5">
                <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
              </svg>
              <span class="leading-relaxed">{{ errorMessage() }}</span>
            </div>
          }

          <!-- Role Selection Visual Radio Buttons -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-2">Select Your Role</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button 
                type="button" 
                (click)="setRole(0)"
                [ngClass]="selectedRole() === 0 ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 font-bold shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
                class="p-2.5 text-xs border rounded-xl text-center transition-all cursor-pointer">
                <span class="block text-sm mb-0.5">🌾</span>
                <span>Beneficiary</span>
              </button>

              <button 
                type="button" 
                (click)="setRole(1)"
                [ngClass]="selectedRole() === 1 ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 font-bold shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
                class="p-2.5 text-xs border rounded-xl text-center transition-all cursor-pointer">
                <span class="block text-sm mb-0.5">📋</span>
                <span>Social Worker</span>
              </button>

              <button 
                type="button" 
                (click)="setRole(2)"
                [ngClass]="selectedRole() === 2 ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 font-bold shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
                class="p-2.5 text-xs border rounded-xl text-center transition-all cursor-pointer">
                <span class="block text-sm mb-0.5">🏢</span>
                <span>Coordinator</span>
              </button>

              <button 
                type="button" 
                (click)="setRole(3)"
                [ngClass]="selectedRole() === 3 ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 font-bold shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
                class="p-2.5 text-xs border rounded-xl text-center transition-all cursor-pointer">
                <span class="block text-sm mb-0.5">📊</span>
                <span>Head M&E</span>
              </button>
            </div>
          </div>

          <!-- Personal Information -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
              <input 
                type="text" 
                formControlName="fullName" 
                placeholder="e.g. Abebe Bikila"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
              @if (registerForm.get('fullName')?.touched && registerForm.get('fullName')?.invalid) {
                <span class="text-[11px] text-rose-600 mt-1 block">Full name is required</span>
              }
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Username / Identifier</label>
              <input 
                type="text" 
                formControlName="username" 
                placeholder="e.g. ben_abebe"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
              @if (registerForm.get('username')?.touched && registerForm.get('username')?.invalid) {
                <span class="text-[11px] text-rose-600 mt-1 block">Username is required</span>
              }
            </div>
          </div>

          <!-- Contact & Branch -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
              <input 
                type="text" 
                formControlName="phoneNumber" 
                placeholder="e.g. 0911234567"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
              @if (registerForm.get('phoneNumber')?.touched && registerForm.get('phoneNumber')?.invalid) {
                <span class="text-[11px] text-rose-600 mt-1 block">Valid phone number is required</span>
              }
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Operational Branch</label>
              <select 
                formControlName="branchCode"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
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
            <div class="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-3">
              <h4 class="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>🌾</span> Enterprise Information
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Business / Enterprise Name</label>
                  <input 
                    type="text" 
                    formControlName="businessName" 
                    placeholder="e.g. Abebe's Tailoring"
                    class="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Livelihood Sector</label>
                  <select 
                    formControlName="livelihoodSector"
                    class="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                    <option value="Poultry">Poultry Husbandry</option>
                    <option value="Livestock">Livestock Fattening</option>
                    <option value="Tailoring">Tailoring & Apparel</option>
                    <option value="Retail">Retail Mini-Market</option>
                    <option value="Fresh Produce">Fresh Produce & Markets</option>
                    <option value="Food Service">Food Service / Eatery</option>
                  </select>
                </div>
              </div>
            </div>
          }

          <!-- Password & Confirm Password -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <div class="relative">
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  formControlName="password" 
                  placeholder="At least 6 characters"
                  class="w-full pr-10 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
                <button 
                  type="button" 
                  (click)="showPassword.set(!showPassword())"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none">
                  {{ showPassword() ? '🙈' : '👁️' }}
                </button>
              </div>
              @if (registerForm.get('password')?.touched && registerForm.get('password')?.invalid) {
                <span class="text-[11px] text-rose-600 mt-1 block">Password must be at least 6 characters</span>
              }
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password</label>
              <input 
                [type]="showPassword() ? 'text' : 'password'" 
                formControlName="confirmPassword" 
                placeholder="Re-enter password"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
              @if (registerForm.get('confirmPassword')?.touched && passwordMismatch()) {
                <span class="text-[11px] text-rose-600 mt-1 block">Passwords do not match</span>
              }
            </div>
          </div>

          <!-- Terms & Data Consent Checkbox -->
          <div class="pt-1">
            <label class="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
              <input type="checkbox" formControlName="agreeTerms" class="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 mt-0.5">
              <span>I confirm accuracy of my enterprise credentials and agree to livelihood monitoring data protocols.</span>
            </label>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            [disabled]="registerForm.invalid || passwordMismatch() || isLoading()" 
            class="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/15 transition-all flex items-center justify-center gap-2 cursor-pointer">
            @if (isLoading()) {
              <div class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Registering Account...</span>
            } @else {
              <span>Complete Registration</span>
              <svg viewBox="0 0 20 20" fill="currentColor" class="size-4">
                <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" />
              </svg>
            }
          </button>

          <!-- Back to Login -->
          <div class="pt-2 text-center border-t border-slate-100">
            <p class="text-xs text-slate-600">
              Already enrolled in the platform?
              <a routerLink="/login" class="font-bold text-emerald-600 hover:text-emerald-700 ml-1 transition-colors hover:underline">
                Sign in here
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
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedRole = signal<number>(0);
  readonly showPassword = signal(false);

  readonly registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+]{9,15}$/)]],
    role: [0, [Validators.required]],
    branchCode: ['BR-AA-01', [Validators.required]],
    businessName: [''],
    livelihoodSector: ['Poultry'],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    agreeTerms: [true, [Validators.requiredTrue]]
  });

  setRole(roleNum: number): void {
    this.selectedRole.set(roleNum);
    this.registerForm.patchValue({ role: roleNum });
  }

  passwordMismatch(): boolean {
    const pwd = this.registerForm.get('password')?.value;
    const confirm = this.registerForm.get('confirmPassword')?.value;
    return !!(pwd && confirm && pwd !== confirm);
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.passwordMismatch()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formVal = this.registerForm.getRawValue();

    this.authService.register({
      fullName: formVal.fullName!,
      username: formVal.username!,
      phoneNumber: formVal.phoneNumber!,
      role: Number(formVal.role),
      branchCode: formVal.branchCode || undefined,
      businessName: formVal.businessName || undefined,
      livelihoodSector: formVal.livelihoodSector || undefined,
      password: formVal.password!
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        // Successful registration redirects exclusively to login page
        this.router.navigate(['/login'], { queryParams: { registered: 'true', user: formVal.username } });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Registration failed. The username may already exist.');
      }
    });
  }
}
