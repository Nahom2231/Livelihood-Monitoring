import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { LanguageService, SupportedLanguage } from '../../services/language.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  template: `
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo & Branding -->
        <div class="flex items-center gap-3">
          <a routerLink="/" class="flex items-center gap-3 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:shadow transition-shadow">
              LM
            </div>
            <div>
              <span class="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
                {{ langService.t('nav.brand') }}
              </span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{{ langService.t('nav.portalSub') }}</span>
            </div>
          </a>
        </div>

        <!-- Section Navigation Links (Landing Page) -->
        @if (isLandingPage()) {
          <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button 
              type="button"
              (click)="scrollTo('approach')" 
              class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer focus:outline-none">
              {{ langService.t('nav.ourApproach') }}
            </button>
            <button 
              type="button"
              (click)="scrollTo('capabilities')" 
              class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer focus:outline-none">
              {{ langService.t('nav.platformCaps') }}
            </button>
            <button 
              type="button"
              (click)="scrollTo('field-work')" 
              class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer focus:outline-none">
              {{ langService.t('nav.fieldTeams') }}
            </button>
          </nav>
        }

        <!-- Authenticated Navigation Bar -->
        @if (authService.isAuthenticated()) {
          <nav class="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a 
              routerLink="/dashboard" 
              routerLinkActive="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800" 
              [routerLinkActiveOptions]="{ exact: true }"
              class="px-3 py-1.5 rounded-lg border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {{ langService.t('nav.dashboard') }}
            </a>

            @if (authService.isBeneficiary()) {
              <a 
                routerLink="/bookkeeping" 
                routerLinkActive="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800" 
                class="px-3 py-1.5 rounded-lg border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {{ langService.t('nav.bookkeeping') }}
              </a>
              <a 
                routerLink="/planning" 
                routerLinkActive="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800" 
                class="px-3 py-1.5 rounded-lg border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {{ langService.t('nav.planning') }}
              </a>
            }

            @if (authService.isStaff()) {
              <a 
                routerLink="/cases" 
                routerLinkActive="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800" 
                class="px-3 py-1.5 rounded-lg border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {{ langService.t('nav.cases') }}
              </a>
            }

            <a 
              routerLink="/learning" 
              routerLinkActive="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800" 
              class="px-3 py-1.5 rounded-lg border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {{ langService.t('nav.learning') }}
            </a>
          </nav>
        }

        <!-- Right Action Button Bar -->
        <div class="flex items-center gap-2">
          <!-- Light / Dark Mode Toggle Button -->
          <button
            type="button"
            (click)="themeService.toggleTheme()"
            [title]="themeService.isDark() ? langService.t('nav.lightMode') : langService.t('nav.darkMode')"
            class="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Toggle light/dark theme">
            @if (themeService.isDark()) {
              <!-- Sun Icon for Light Mode -->
              <svg viewBox="0 0 20 20" fill="currentColor" class="size-4 text-amber-400">
                <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 14.596a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 0 0-1.06 1.06l1.06 1.06ZM5.404 5.404a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 0 0-1.06 1.06l1.06 1.06Z" />
              </svg>
            } @else {
              <!-- Moon Icon for Dark Mode -->
              <svg viewBox="0 0 20 20" fill="currentColor" class="size-4 text-slate-700">
                <path fill-rule="evenodd" d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z" clip-rule="evenodd" />
              </svg>
            }
          </button>

          <!-- Language Selector -->
          <select 
            [ngModel]="langService.currentLang()" 
            (ngModelChange)="onLanguageChange($event)"
            class="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm cursor-pointer">
            @for (lang of langService.languages; track lang.code) {
              <option [value]="lang.code">{{ lang.nativeLabel }}</option>
            }
          </select>

          @if (authService.isAuthenticated()) {
            <div class="flex items-center gap-2">
              <div class="text-right hidden sm:block">
                <span class="block text-xs font-bold text-slate-800 dark:text-slate-200">{{ authService.currentUser()?.fullName || authService.currentUser()?.username }}</span>
                <span class="inline-block px-1.5 py-0.5 rounded text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 font-semibold uppercase">
                  {{ authService.currentUser()?.role }}
                </span>
              </div>
              <button 
                (click)="logout()" 
                class="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                {{ langService.t('nav.signOut') }}
              </button>
            </div>
          } @else {
            <div class="flex items-center gap-2">
              @if (isLandingPage() || isLoginPage()) {
                <a 
                  routerLink="/register" 
                  class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all hover:shadow hover:-translate-y-0.5">
                  <svg viewBox="0 0 20 20" fill="currentColor" class="size-3.5">
                    <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2.615 16.428a1.224 1.224 0 0 1-.569-1.033 6.002 6.002 0 0 1 11.908 0c0 .428-.225.82-.57 1.033a8.96 8.96 0 0 1-10.769 0Z" />
                    <path fill-rule="evenodd" d="M16 8a1 1 0 0 1 1 1v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 1 1 0-2h1V9a1 1 0 0 1 1-1Z" clip-rule="evenodd" />
                  </svg>
                  {{ langService.t('nav.register') }}
                </a>
              } @else if (isRegisterPage()) {
                <a 
                  routerLink="/login" 
                  class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all hover:shadow hover:-translate-y-0.5">
                  <svg viewBox="0 0 20 20" fill="currentColor" class="size-3.5">
                    <path fill-rule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clip-rule="evenodd" />
                    <path fill-rule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l2.47-2.47a.75.75 0 1 0-1.06-1.06l-3.75 3.75a.75.75 0 0 0 0 1.06l3.75 3.75a.75.75 0 1 0 1.06-1.06l-2.47-2.47H18.25A.75.75 0 0 0 19 10Z" clip-rule="evenodd" />
                  </svg>
                  {{ langService.t('nav.login') }}
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
  readonly langService = inject(LanguageService);
  readonly themeService = inject(ThemeService);
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

  onLanguageChange(lang: SupportedLanguage): void {
    this.langService.setLanguage(lang);
  }
}