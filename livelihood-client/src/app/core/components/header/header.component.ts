import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo & Branding -->
        <div class="flex items-center gap-3">
          <a routerLink="/" class="flex items-center gap-3 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:shadow transition-shadow">
              LM
            </div>
            <div>
              <span class="text-base sm:text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                Livelihoods <span class="text-emerald-700">Monitoring</span>
              </span>
              <span class="text-[11px] text-slate-500 font-medium">Economic Inclusion & M&E Portal</span>
            </div>
          </a>
        </div>

        <!-- Section Navigation Links (ONLY visible on the Landing Page, hidden on Login/Register/Dashboard) -->
        @if (isLandingPage()) {
          <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button 
              type="button"
              (click)="scrollTo('approach')" 
              class="hover:text-emerald-600 transition-colors cursor-pointer focus:outline-none">
              Our Approach
            </button>
            <button 
              type="button"
              (click)="scrollTo('capabilities')" 
              class="hover:text-emerald-600 transition-colors cursor-pointer focus:outline-none">
              Platform Capabilities
            </button>
            <button 
              type="button"
              (click)="scrollTo('field-work')" 
              class="hover:text-emerald-600 transition-colors cursor-pointer focus:outline-none">
              Field Teams
            </button>
          </nav>
        }

        <!-- Right Action Button Bar -->
        <div class="flex items-center gap-3">
          @if (authService.isAuthenticated()) {
            <div class="flex items-center gap-3">
              <div class="text-right hidden sm:block">
                <span class="block text-xs font-bold text-slate-800">{{ authService.currentUser()?.fullName || authService.currentUser()?.username }}</span>
                <span class="inline-block px-1.5 py-0.5 rounded text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold uppercase">
                  {{ authService.currentUser()?.role }}
                </span>
              </div>
              <a 
                routerLink="/dashboard" 
                class="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors">
                Dashboard
              </a>
              <button 
                (click)="logout()" 
                class="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">
                Sign Out
              </button>
            </div>
          } @else {
            <div class="flex items-center gap-2.5">
              @if (isLandingPage() || isLoginPage()) {
                <!-- On Landing Page & Login Page: Register button only (no signin, no get started) -->
                <a 
                  routerLink="/register" 
                  class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all hover:shadow hover:-translate-y-0.5">
                  <svg viewBox="0 0 20 20" fill="currentColor" class="size-3.5">
                    <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2.615 16.428a1.224 1.224 0 0 1-.569-1.033 6.002 6.002 0 0 1 11.908 0c0 .428-.225.82-.57 1.033a8.96 8.96 0 0 1-10.769 0Z" />
                    <path fill-rule="evenodd" d="M16 8a1 1 0 0 1 1 1v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 1 1 0-2h1V9a1 1 0 0 1 1-1Z" clip-rule="evenodd" />
                  </svg>
                  Register
                </a>
              } @else if (isRegisterPage()) {
                <!-- On Register Page: Login button only (no get started) -->
                <a 
                  routerLink="/login" 
                  class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all hover:shadow hover:-translate-y-0.5">
                  <svg viewBox="0 0 20 20" fill="currentColor" class="size-3.5">
                    <path fill-rule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clip-rule="evenodd" />
                    <path fill-rule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l2.47-2.47a.75.75 0 1 0-1.06-1.06l-3.75 3.75a.75.75 0 0 0 0 1.06l3.75 3.75a.75.75 0 1 0 1.06-1.06l-2.47-2.47H18.25A.75.75 0 0 0 19 10Z" clip-rule="evenodd" />
                  </svg>
                  Login
                </a>
              }
            </div>
          }
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUrl = signal(this.router.url);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl.set(event.urlAfterRedirects || event.url);
    });
  }

  isLandingPage(): boolean {
    const url = this.currentUrl().split('?')[0].split('#')[0];
    return url === '/' || url === '';
  }

  isLoginPage(): boolean {
    return this.currentUrl().split('?')[0].split('#')[0] === '/login';
  }

  isRegisterPage(): boolean {
    return this.currentUrl().split('?')[0].split('#')[0] === '/register';
  }

  scrollTo(id: string): void {
    if (this.isLandingPage()) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      this.router.navigate(['/'], { fragment: id });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}