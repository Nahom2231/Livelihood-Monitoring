import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'lm_preferred_theme';
  readonly isDark = signal<boolean>(this.getInitialTheme());

  constructor() {
    // Whenever isDark changes, update HTML root class and localStorage
    effect(() => {
      const dark = this.isDark();
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (dark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
      try {
        localStorage.setItem(this.storageKey, dark ? 'dark' : 'light');
      } catch {
        // In case localStorage is blocked
      }
    });
  }

  toggleTheme(): void {
    this.isDark.update(prev => !prev);
  }

  setTheme(mode: ThemeMode): void {
    this.isDark.set(mode === 'dark');
  }

  private getInitialTheme(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  }
}
