import { Component, HostListener, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    :host { display: block; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes floatSoft {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-10px); }
    }
    @keyframes sparklePulse {
      0%, 100% { opacity: .35; transform: scale(.8) rotate(0deg); }
      50%      { opacity: 1;   transform: scale(1.15) rotate(12deg); }
    }
    @keyframes waveDrift {
      0%, 100% { transform: translateX(0); }
      50%      { transform: translateX(-2.4%); }
    }
    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50%      { background-position: 100% 50%; }
    }
    @keyframes shimmerSweep {
      0%   { transform: translateX(-140%) skewX(-12deg); }
      100% { transform: translateX(240%) skewX(-12deg); }
    }
    @keyframes spinSlow { to { transform: rotate(360deg); } }
    @keyframes orbFloatA {
      0%, 100% { transform: translate3d(0,0,0) scale(1); }
      50%      { transform: translate3d(30px,-40px,0) scale(1.08); }
    }
    @keyframes orbFloatB {
      0%, 100% { transform: translate3d(0,0,0) scale(1); }
      50%      { transform: translate3d(-40px,30px,0) scale(1.12); }
    }
    @keyframes orbFloatC {
      0%, 100% { transform: translate3d(0,0,0) scale(1); }
      50%      { transform: translate3d(20px,30px,0) scale(1.1); }
    }
    @keyframes pulseGlow {
      0%, 100% { opacity: .55; }
      50%      { opacity: .95; }
    }

    .rise-in       { animation: fadeUp .9s cubic-bezier(.22,.85,.32,1) both; }
    .rise-in-delay { animation: fadeUp 1s cubic-bezier(.22,.85,.32,1) .18s both; }
    .float-gently  { animation: floatSoft 7.5s ease-in-out infinite; }
    .sparkle       { animation: sparklePulse 3.8s ease-in-out infinite; }
    .sparkle-delay { animation-delay: 1.3s; }
    .sparkle-slow  { animation-duration: 5.6s; }
    .spin-slow     { animation: spinSlow 16s linear infinite; }
    .pulse-glow    { animation: pulseGlow 6s ease-in-out infinite; }

    .orb-a { animation: orbFloatA 14s ease-in-out infinite; }
    .orb-b { animation: orbFloatB 18s ease-in-out infinite; }
    .orb-c { animation: orbFloatC 22s ease-in-out infinite; }

    .animated-gradient-text {
      background-size: 220% 220%;
      animation: gradientShift 7s ease-in-out infinite;
    }

    .shimmer-badge { position: relative; overflow: hidden; }
    .shimmer-badge::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(110deg, transparent 35%, rgba(255,255,255,.75) 50%, transparent 65%);
      animation: shimmerSweep 4.2s ease-in-out infinite;
      pointer-events: none;
    }

    .dot-grid {
      background-image: radial-gradient(rgba(15, 42, 34, .10) 1px, transparent 1px);
      background-size: 26px 26px;
    }

    .scroll-wave {
      transform: translateY(var(--scroll-wave-bounce, 0px));
      transition: transform .2s ease-out;
      will-change: transform;
    }
    .wave-layer-back  { animation: waveDrift 13s ease-in-out infinite; }
    .wave-drift       { animation: waveDrift 10s ease-in-out infinite reverse; }
    .wave-layer-front { animation: waveDrift 11s ease-in-out infinite; }

    .cta-aura {
      background: radial-gradient(circle at 50% 50%, rgba(246,184,74,.4), rgba(72,174,186,.25) 45%, transparent 70%);
      filter: blur(40px);
    }

    @media (prefers-reduced-motion: reduce) {
      .rise-in, .rise-in-delay, .float-gently, .sparkle, .spin-slow, .pulse-glow,
      .orb-a, .orb-b, .orb-c, .animated-gradient-text,
      .wave-layer-back, .wave-drift, .wave-layer-front { animation: none !important; }
    }
  `],
  template: `
    <div class="min-h-screen overflow-hidden bg-[#f6f3ec] dark:bg-slate-950 text-[#0f2a22] dark:text-slate-100 antialiased selection:bg-emerald-200 selection:text-emerald-950 transition-colors duration-200">
      <main id="home">
        <!-- ========================================== -->
        <!-- HERO SECTION                               -->
        <!-- ========================================== -->
        <section class="hero-surface grain relative isolate overflow-hidden transition-colors duration-200">

          <!-- Ambient orbs -->
          <div class="orb-a pointer-events-none absolute -left-24 top-10 size-[28rem] rounded-full bg-emerald-400/25 blur-[110px]"></div>
          <div class="orb-b pointer-events-none absolute -right-32 top-32 size-[32rem] rounded-full bg-sky-400/20 blur-[120px]"></div>
          <div class="orb-c pointer-events-none absolute bottom-0 left-1/3 size-[26rem] rounded-full bg-amber-300/20 blur-[110px]"></div>

          <!-- Ring ornaments -->
          <div class="pointer-events-none absolute -right-24 top-10 -z-0 size-60 rounded-full border border-[#e8a841]/40 sm:size-80"></div>
          <div class="pointer-events-none absolute -right-10 top-24 -z-0 size-44 rounded-full border border-[#48aeba]/40 sm:size-64"></div>
          <div class="pointer-events-none absolute -left-32 bottom-32 -z-0 hidden size-96 rounded-full border border-emerald-400/20 lg:block"></div>

          <!-- Sparkles -->
          <span class="sparkle pointer-events-none absolute left-[47%] top-[14%] z-10 hidden text-[#d78b2f] sm:block" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" class="size-7 drop-shadow-[0_0_12px_rgba(215,139,47,.6)]"><path d="M12 0c1.45 6.55 3.45 8.55 10 10-6.55 1.45-8.55 3.45-10 10C10.55 13.45 8.55 11.45 2 10c6.55-1.45 8.55-3.45 10-10Z"/></svg>
          </span>
          <span class="sparkle sparkle-delay sparkle-slow pointer-events-none absolute right-[8%] top-[40%] z-10 text-[#8d65bb]" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" class="size-5 drop-shadow-[0_0_10px_rgba(141,101,187,.6)]"><path d="M12 0c1.45 6.55 3.45 8.55 10 10-6.55 1.45-8.55 3.45-10 10C10.55 13.45 8.55 11.45 2 10c6.55-1.45 8.55-3.45 10-10Z"/></svg>
          </span>
          <span class="sparkle sparkle-delay pointer-events-none absolute bottom-[24%] left-[7%] z-10 hidden text-[#3389a3] sm:block" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" class="size-4 drop-shadow-[0_0_8px_rgba(51,137,163,.6)]"><path d="M12 0c1.45 6.55 3.45 8.55 10 10-6.55 1.45-8.55 3.45-10 10C10.55 13.45 8.55 11.45 2 10c6.55-1.45 8.55-3.45 10-10Z"/></svg>
          </span>

          <div class="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-5 pb-28 pt-16 sm:px-8 sm:pb-32 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 lg:px-10 lg:pb-40 lg:pt-24">
            <div class="max-w-2xl rise-in">
              <div class="shimmer-badge mb-7 inline-flex items-center gap-2.5 rounded-full border border-emerald-300/70 dark:border-emerald-700/60 bg-white/70 dark:bg-slate-900/80 px-4 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-[0_8px_30px_-12px_rgba(16,122,73,.45)] ring-1 ring-inset ring-white/80 dark:ring-slate-700 backdrop-blur-xl sm:text-sm">
                <span class="relative flex size-2.5">
                  <span class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-40"></span>
                  <span class="relative inline-flex size-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600"></span>
                </span>
                {{ lang.t('landing.badge') }}
              </div>

              <h1 class="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-[#0f2a22] dark:text-white sm:text-6xl lg:text-[5rem]">
                {{ lang.t('landing.heroTitle1') }}<br />
                <span class="animated-gradient-text bg-gradient-to-r from-[#0f7a49] via-[#1a7fa8] to-[#7c4bb5] dark:from-emerald-400 dark:via-sky-400 dark:to-purple-400 bg-clip-text font-serif font-normal italic text-transparent">{{ lang.t('landing.heroTitle2') }}</span>
              </h1>

              <p class="mt-7 max-w-xl text-base leading-8 text-[#3f5549] dark:text-slate-300 sm:text-lg">
                {{ lang.t('landing.heroSubtitle') }}
              </p>

              <div class="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  routerLink="/login"
                  class="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-[#1a9155] to-[#0c6a41] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_-12px_rgba(15,122,73,.7),inset_0_1px_0_rgba(255,255,255,.25)] ring-1 ring-inset ring-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_26px_55px_-14px_rgba(15,122,73,.85),inset_0_1px_0_rgba(255,255,255,.35)] active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  <span class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"></span>
                  {{ lang.t('landing.ctaDiscover') }}
                  <svg viewBox="0 0 20 20" fill="none" class="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                    <path d="M4.167 10h11.666m0 0L10 4.167M15.833 10 10 15.833" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </a>
                <button
                  type="button"
                  (click)="scrollTo('approach')"
                  class="inline-flex items-center justify-center rounded-full border border-[#c9dec9] dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-7 py-3.5 text-sm font-semibold text-[#294538] dark:text-slate-200 shadow-[0_8px_24px_-14px_rgba(15,42,34,.35)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-[0_16px_30px_-14px_rgba(15,122,73,.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 cursor-pointer"
                >
                  {{ lang.t('landing.ctaHow') }}
                </button>
              </div>

              <div class="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#c6d6c3]/70 dark:border-slate-800 pt-6 text-xs font-medium text-[#4f685a] dark:text-slate-400 sm:text-sm">
                <span class="inline-flex items-center gap-2">
                  <svg viewBox="0 0 20 20" fill="none" class="size-4 text-[#1f9b4b] dark:text-emerald-400" aria-hidden="true">
                    <path d="m5 10 3.1 3.1L15.5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ lang.t('landing.badgeTracking') }}
                </span>
                <span class="inline-flex items-center gap-2">
                  <svg viewBox="0 0 20 20" fill="none" class="size-4 text-[#1f9b4b] dark:text-emerald-400" aria-hidden="true">
                    <path d="m5 10 3.1 3.1L15.5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ lang.t('landing.badgeFollowUp') }}
                </span>
              </div>
            </div>

            <!-- Dashboard preview -->
            <div class="relative z-10 mx-auto w-full max-w-xl rise-in-delay lg:ml-auto">
              <div class="pointer-events-none absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-emerald-300/30 via-sky-300/20 to-amber-200/30 dark:from-emerald-900/30 dark:via-sky-900/20 dark:to-amber-900/20 blur-3xl pulse-glow"></div>

              <div class="absolute -left-7 top-12 hidden size-24 rounded-full border-2 border-[#f6b84a]/70 sm:block"></div>
              <div class="absolute -bottom-7 -right-4 hidden size-32 rounded-full bg-[#ffe9ad] dark:bg-amber-950/60 shadow-[0_18px_40px_-20px_rgba(246,184,74,.6)] sm:block"></div>

              <div class="float-gently relative rounded-[2rem] border border-white/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-[0_40px_100px_-32px_rgba(18,80,50,0.5),0_8px_24px_-12px_rgba(18,80,50,.2)] dark:shadow-[0_40px_100px_-32px_rgba(0,0,0,0.7)] ring-1 ring-black/[0.04] dark:ring-white/[0.06] backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 hover:rotate-[0.4deg] sm:p-5">
                <div class="relative mb-4 h-44 overflow-hidden rounded-[1.4rem] bg-[#b8d8a7] sm:h-52">
                  <img
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85"
                    alt="Sunlit green fields stretching across a rural landscape"
                    class="h-full w-full object-cover transition duration-700 hover:scale-105"
                    fetchpriority="high"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-[#0f2a22]/85 via-[#143b2b]/20 to-transparent"></div>
                  <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 sm:bottom-5 sm:left-5 sm:right-5">
                    <div class="text-white">
                      <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e5f4c9]">{{ lang.t('landing.previewTag') }}</p>
                      <p class="mt-1 text-lg font-semibold tracking-tight sm:text-xl">{{ lang.t('landing.previewTitle') }}</p>
                    </div>
                    <span class="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white backdrop-blur-md">
                      <svg viewBox="0 0 24 24" fill="none" class="size-5">
                        <path d="M12 20v-9m0 6c-4.8 0-7.3-2.6-7.3-7.3 4.7 0 7.3 2.5 7.3 7.3Zm0-3.7c0-4.8 2.6-7.3 7.3-7.3 0 4.7-2.5 7.3-7.3 7.3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </div>

                <div class="flex items-center justify-between border-b border-[#edf0eb] dark:border-slate-800 px-2 pb-4 pt-1">
                  <div class="flex items-center gap-3">
                    <span class="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 text-emerald-700 dark:text-emerald-300 shadow-inner">
                      <svg viewBox="0 0 24 24" fill="none" class="size-5" aria-hidden="true">
                        <path d="M4 19V5m0 14h17M8 15l3-4 3 2 5-7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                    <div>
                      <p class="text-sm font-semibold text-[#203c30] dark:text-white">{{ lang.t('landing.previewOverview') }}</p>
                      <p class="mt-0.5 text-[11px] text-[#65756b] dark:text-slate-400">{{ lang.t('landing.previewOverviewSub') }}</p>
                    </div>
                  </div>
                  <span class="rounded-full bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-950 dark:to-emerald-900 px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-200/70 dark:ring-emerald-800">{{ lang.t('landing.previewFieldView') }}</span>
                </div>

                <div class="grid grid-cols-2 gap-3 py-4">
                  <div class="rounded-2xl bg-gradient-to-br from-[#f6f8f4] to-[#eef4ea] dark:from-slate-800/90 dark:to-slate-800/60 p-4 ring-1 ring-inset ring-black/[0.03] dark:ring-white/[0.05]">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-[11px] font-medium text-[#58695f] dark:text-slate-300">{{ lang.t('landing.previewBizActivity') }}</span>
                      <span class="flex size-7 items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm">
                        <svg viewBox="0 0 20 20" fill="none" class="size-4" aria-hidden="true">
                          <path d="M3 14.5 7.2 10l3.1 2.6L17 5.5M13 5.5h4v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </span>
                    </div>
                    <div class="mt-5 flex h-14 items-end gap-1.5" aria-hidden="true">
                      <span class="h-[35%] flex-1 rounded-t bg-[#c8d9c4] dark:bg-slate-700"></span>
                      <span class="h-[52%] flex-1 rounded-t bg-[#b3ccb0] dark:bg-slate-600"></span>
                      <span class="h-[44%] flex-1 rounded-t bg-[#cfddc9] dark:bg-slate-700"></span>
                      <span class="h-[68%] flex-1 rounded-t bg-[#9ebc9c] dark:bg-emerald-800"></span>
                      <span class="h-[59%] flex-1 rounded-t bg-[#b3ccb0] dark:bg-slate-600"></span>
                      <span class="h-[82%] flex-1 rounded-t bg-gradient-to-t from-[#4f8256] to-[#82b17e] dark:from-emerald-600 dark:to-emerald-400"></span>
                      <span class="h-[72%] flex-1 rounded-t bg-[#8eae8e] dark:bg-emerald-700"></span>
                    </div>
                    <div class="mt-2 flex justify-between text-[9px] text-[#66766c] dark:text-slate-400"><span>{{ lang.t('landing.previewEarlier') }}</span><span>{{ lang.t('landing.previewRecent') }}</span></div>
                  </div>

                  <div class="rounded-2xl bg-gradient-to-br from-[#f6f8f4] to-[#eef4ea] dark:from-slate-800/90 dark:to-slate-800/60 p-4 ring-1 ring-inset ring-black/[0.03] dark:ring-white/[0.05]">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-[11px] font-medium text-[#58695f] dark:text-slate-300">{{ lang.t('landing.previewFieldFollowUp') }}</span>
                      <span class="flex size-7 items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm">
                        <svg viewBox="0 0 20 20" fill="none" class="size-4" aria-hidden="true">
                          <path d="M10 3.3a6.7 6.7 0 1 0 6.4 4.7M10 6.2v4l2.6 1.5M13.7 3.5h3v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </span>
                    </div>
                    <div class="mt-5 space-y-3">
                      <div>
                        <div class="mb-1.5 flex justify-between text-[9px] text-[#7d8981] dark:text-slate-400"><span>{{ lang.t('landing.previewVisitsRecorded') }}</span><span>{{ lang.t('landing.previewInProgress') }}</span></div>
                        <div class="h-1.5 overflow-hidden rounded-full bg-[#e4eae1] dark:bg-slate-700"><div class="h-full w-3/4 rounded-full bg-gradient-to-r from-[#45a05d] to-[#6fc07d]"></div></div>
                      </div>
                      <div>
                        <div class="mb-1.5 flex justify-between text-[9px] text-[#7d8981] dark:text-slate-400"><span>{{ lang.t('landing.previewActionsFollowed') }}</span><span>{{ lang.t('landing.previewOngoing') }}</span></div>
                        <div class="h-1.5 overflow-hidden rounded-full bg-[#e4eae1] dark:bg-slate-700"><div class="h-full w-1/2 rounded-full bg-gradient-to-r from-[#edb84f] to-[#f5cf7c]"></div></div>
                      </div>
                    </div>
                    <p class="mt-3 text-[9px] text-[#66766c] dark:text-slate-400">{{ lang.t('landing.previewActivityTracking') }}</p>
                  </div>
                </div>

                <div class="rounded-2xl border border-[#edf0eb] dark:border-slate-800 bg-gradient-to-br from-white to-[#fafaf7] dark:from-slate-850 dark:to-slate-900 p-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-xs font-semibold text-[#294538] dark:text-white">{{ lang.t('landing.previewFieldNotes') }}</p>
                      <p class="mt-1 text-[10px] text-[#64746a] dark:text-slate-400">{{ lang.t('landing.previewFieldNotesSub') }}</p>
                    </div>
                    <span class="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 text-amber-700 dark:text-amber-300">
                      <svg viewBox="0 0 20 20" fill="none" class="size-4" aria-hidden="true">
                        <path d="M11.7 3.3H5.8a1.7 1.7 0 0 0-1.7 1.7v10a1.7 1.7 0 0 0 1.7 1.7h8.4a1.7 1.7 0 0 0 1.7-1.7v-6m-5.8 0 5.8-5.7M8.3 11.7l2.5-.6 5.8-5.8-1.9-1.9-5.8 5.8-.6 2.5Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  </div>
                  <div class="mt-4 flex items-center gap-3 rounded-xl bg-[#faf9f6] dark:bg-slate-800 px-3 py-2.5">
                    <span class="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,.8)]"></span>
                    <span class="text-[10px] text-[#66746b] dark:text-slate-300">{{ lang.t('landing.previewVisitRecorded') }}</span>
                    <span class="ml-auto text-[10px] font-medium text-[#819087] dark:text-slate-400">{{ lang.t('landing.previewFollowUpNoted') }}</span>
                  </div>
                </div>
              </div>

              <div class="absolute -left-8 bottom-10 hidden items-center gap-3 rounded-2xl border border-white/80 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-4 py-3 shadow-[0_24px_46px_-20px_rgba(35,69,49,.45)] backdrop-blur-xl sm:flex">
                <span class="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 text-emerald-700 dark:text-emerald-300">
                  <svg viewBox="0 0 20 20" fill="none" class="size-4" aria-hidden="true">
                    <path d="M10 2.8v2.4m0 9.6v2.4m7.2-7.2h-2.4m-9.6 0H2.8m12.3-5.1-1.7 1.7M6.6 13.4l-1.7 1.7m10.2 0-1.7-1.7m-6.8-6.8L4.9 4.9M13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                  </svg>
                </span>
                <span>
                  <span class="block text-xs font-semibold text-[#294538] dark:text-white">{{ lang.t('landing.previewMadeForField') }}</span>
                  <span class="mt-0.5 block text-[10px] text-[#64746a] dark:text-slate-400">{{ lang.t('landing.previewUsefulWhere') }}</span>
                </span>
              </div>
            </div>
          </div>

          <svg class="scroll-wave pointer-events-none absolute bottom-0 left-0 h-28 w-[112%] sm:h-36" viewBox="0 0 1440 150" preserveAspectRatio="none" aria-hidden="true">
            <path class="wave-layer-back dark:opacity-40" fill="#f5c7a4" fill-opacity=".72" d="M0 57 60 69c60 12 180 36 300 34 120-2 240-30 360-38 120-8 240 2 360 17s240 35 300 39l60 4v25H0Z"/>
            <path class="wave-drift dark:opacity-30" fill="#cae9e9" fill-opacity=".88" d="M0 84 60 73c60-11 180-33 300-28 120 5 240 37 360 43 120 6 240-13 360-20s240-1 300 3l60 4v75H0Z"/>
            <path class="wave-layer-front dark:opacity-20" fill="#ffffff" fill-opacity=".94" d="M0 104 60 91c60-13 180-39 300-37 120 2 240 30 360 39 120 9 240-1 360-6s240-5 300 1l60 6v56H0Z"/>
            <path class="fill-[#ffffff] dark:fill-slate-900 transition-colors" d="M0 125c170-16 270 15 440 4 158-10 227-35 390-20 174 16 240 27 365 11 114-15 158-12 245-1v31H0Z"/>
          </svg>
        </section>

        <!-- ========================================== -->
        <!-- APPROACH SECTION                           -->
        <!-- ========================================== -->
        <section id="approach" class="relative border-y border-[#d9dfd0] dark:border-slate-800 bg-gradient-to-r from-[#e9f0e4] via-[#e8f1ed] to-[#e8eef5] dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 scroll-mt-16 transition-colors duration-200">
          <div class="absolute inset-0 dot-grid opacity-[0.35] dark:opacity-[0.1] pointer-events-none"></div>
          <div class="relative mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-[0.8fr_1.2fr_0.9fr] md:items-center lg:px-10">
            <div>
              <p class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">
                <span class="size-1.5 rounded-full bg-emerald-500"></span> {{ lang.t('landing.approachPill') }}
              </p>
              <h2 class="mt-3 text-2xl font-semibold tracking-tight text-[#1d3d30] dark:text-white sm:text-3xl">{{ lang.t('landing.approachTitle') }}</h2>
            </div>
            <p class="max-w-3xl text-sm leading-7 text-[#52645a] dark:text-slate-300 sm:text-base">
              {{ lang.t('landing.approachDesc') }}
            </p>
            <figure class="relative h-40 overflow-hidden rounded-2xl bg-[#e9f2dc] dark:bg-slate-800 shadow-[0_24px_50px_-24px_rgba(40,91,54,.55)] dark:shadow-black/50 ring-1 ring-white/60 dark:ring-slate-700 sm:h-44">
              <img
                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80"
                alt="Fresh produce growing in a sunlit field"
                class="h-full w-full object-cover transition duration-700 hover:scale-105"
                loading="lazy"
              />
              <figcaption class="absolute bottom-3 left-3 rounded-full bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 text-[10px] font-semibold text-[#285b36] dark:text-emerald-300 shadow-sm backdrop-blur-sm">
                {{ lang.t('landing.approachFigcaption') }}
              </figcaption>
            </figure>
          </div>
        </section>

        <!-- ========================================== -->
        <!-- REAL LIVELIHOODS IN ACTION                 -->
        <!-- ========================================== -->
        <section id="livelihoods" class="relative bg-gradient-to-b from-[#f7ead6] via-[#f5ede0] to-[#edf2e9] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20 sm:py-28 scroll-mt-16 transition-colors duration-200">
          <div class="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/0 to-transparent pointer-events-none"></div>
          <div class="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div class="max-w-2xl">
                <p class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#bd7834] dark:text-amber-400">
                  <span class="size-1.5 rounded-full bg-amber-500"></span> {{ lang.t('landing.livelihoodsPill') }}
                </p>
                <h2 class="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#0f2a22] dark:text-white sm:text-[2.5rem] sm:leading-[1.1]">{{ lang.t('landing.livelihoodsTitle') }}</h2>
                <p class="mt-4 text-sm leading-7 text-[#52645a] dark:text-slate-300 sm:text-base">
                  {{ lang.t('landing.livelihoodsDesc') }}
                </p>
              </div>
              <span class="mb-1 inline-flex w-fit items-center gap-2 rounded-full border border-[#f1dfbc] dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-4 py-2 text-xs font-semibold text-[#8c6838] dark:text-amber-300 shadow-sm backdrop-blur-md">
                <svg viewBox="0 0 20 20" fill="none" class="size-4 text-[#bc8b42] dark:text-amber-400" aria-hidden="true">
                  <path d="M10 2.8v2.4m0 9.6v2.4m7.2-7.2h-2.4m-9.6 0H2.8m12.3-5.1-1.7 1.7M6.6 13.4l-1.7 1.7m10.2 0-1.7-1.7m-6.8-6.8L4.9 4.9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                  <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.4"/>
                </svg>
                {{ lang.t('landing.livelihoodsBadge') }}
              </span>
            </div>

            <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <article class="group relative rounded-3xl bg-gradient-to-br from-white via-[#ece9df] to-white dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-[1px] shadow-[0_14px_38px_-22px_rgba(81,70,44,.5)] dark:shadow-black/40 transition-all duration-500 hover:-translate-y-2 hover:from-emerald-300 hover:via-amber-200 hover:to-rose-300 hover:shadow-[0_36px_70px_-26px_rgba(81,70,44,.55)]">
                <div class="overflow-hidden rounded-[calc(1.5rem-1px)] bg-white dark:bg-slate-900 transition-colors">
                  <div class="relative h-52 overflow-hidden bg-[#e7efd9] dark:bg-slate-800">
                    <img src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=900&q=85" alt="Chickens in a poultry setting" class="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    <span class="absolute left-4 top-4 rounded-full bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#477343] dark:text-emerald-400 shadow-sm backdrop-blur-sm">{{ lang.t('landing.sectorPoultry') }}</span>
                  </div>
                  <div class="p-5">
                    <h3 class="text-base font-semibold text-[#244235] dark:text-white">{{ lang.t('landing.poultryTitle') }}</h3>
                    <p class="mt-2 text-sm leading-6 text-[#56665d] dark:text-slate-300">{{ lang.t('landing.poultryDesc') }}</p>
                  </div>
                </div>
              </article>

              <article class="group relative rounded-3xl bg-gradient-to-br from-white via-[#ece9df] to-white dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-[1px] shadow-[0_14px_38px_-22px_rgba(81,70,44,.5)] dark:shadow-black/40 transition-all duration-500 hover:-translate-y-2 hover:from-emerald-300 hover:via-amber-200 hover:to-rose-300 hover:shadow-[0_36px_70px_-26px_rgba(81,70,44,.55)]">
                <div class="overflow-hidden rounded-[calc(1.5rem-1px)] bg-white dark:bg-slate-900 transition-colors">
                  <div class="relative h-52 overflow-hidden bg-[#f1e7d7] dark:bg-slate-800">
                    <img src="https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=900&q=85" alt="Sheep grazing in a green pasture" class="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    <span class="absolute left-4 top-4 rounded-full bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8c6838] dark:text-amber-400 shadow-sm backdrop-blur-sm">{{ lang.t('landing.sectorLivestock') }}</span>
                  </div>
                  <div class="p-5">
                    <h3 class="text-base font-semibold text-[#244235] dark:text-white">{{ lang.t('landing.livestockTitle') }}</h3>
                    <p class="mt-2 text-sm leading-6 text-[#56665d] dark:text-slate-300">{{ lang.t('landing.livestockDesc') }}</p>
                  </div>
                </div>
              </article>

              <article class="group relative rounded-3xl bg-gradient-to-br from-white via-[#ece9df] to-white dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-[1px] shadow-[0_14px_38px_-22px_rgba(81,70,44,.5)] dark:shadow-black/40 transition-all duration-500 hover:-translate-y-2 hover:from-emerald-300 hover:via-amber-200 hover:to-rose-300 hover:shadow-[0_36px_70px_-26px_rgba(81,70,44,.55)]">
                <div class="overflow-hidden rounded-[calc(1.5rem-1px)] bg-white dark:bg-slate-900 transition-colors">
                  <div class="relative h-52 overflow-hidden bg-[#e4f0df] dark:bg-slate-800">
                    <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85" alt="Fresh vegetables and daily goods at a local market" class="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    <span class="absolute left-4 top-4 rounded-full bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#36805c] dark:text-teal-400 shadow-sm backdrop-blur-sm">{{ lang.t('landing.sectorDailyGoods') }}</span>
                  </div>
                  <div class="p-5">
                    <h3 class="text-base font-semibold text-[#244235] dark:text-white">{{ lang.t('landing.dailyGoodsTitle') }}</h3>
                    <p class="mt-2 text-sm leading-6 text-[#56665d] dark:text-slate-300">{{ lang.t('landing.dailyGoodsDesc') }}</p>
                  </div>
                </div>
              </article>

              <article class="group relative rounded-3xl bg-gradient-to-br from-white via-[#ece9df] to-white dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-[1px] shadow-[0_14px_38px_-22px_rgba(81,70,44,.5)] dark:shadow-black/40 transition-all duration-500 hover:-translate-y-2 hover:from-emerald-300 hover:via-amber-200 hover:to-rose-300 hover:shadow-[0_36px_70px_-26px_rgba(81,70,44,.55)]">
                <div class="overflow-hidden rounded-[calc(1.5rem-1px)] bg-white dark:bg-slate-900 transition-colors">
                  <div class="relative h-52 overflow-hidden bg-[#eee4f1] dark:bg-slate-800">
                    <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=85" alt="Colorful garments displayed in a clothing shop" class="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    <span class="absolute left-4 top-4 rounded-full bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#82568d] dark:text-purple-400 shadow-sm backdrop-blur-sm">{{ lang.t('landing.sectorClothing') }}</span>
                  </div>
                  <div class="p-5">
                    <h3 class="text-base font-semibold text-[#244235] dark:text-white">{{ lang.t('landing.clothingTitle') }}</h3>
                    <p class="mt-2 text-sm leading-6 text-[#56665d] dark:text-slate-300">{{ lang.t('landing.clothingDesc') }}</p>
                  </div>
                </div>
              </article>

              <article class="group relative rounded-3xl bg-gradient-to-br from-white via-[#ece9df] to-white dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-[1px] shadow-[0_14px_38px_-22px_rgba(81,70,44,.5)] dark:shadow-black/40 transition-all duration-500 hover:-translate-y-2 hover:from-emerald-300 hover:via-amber-200 hover:to-rose-300 hover:shadow-[0_36px_70px_-26px_rgba(81,70,44,.55)]">
                <div class="overflow-hidden rounded-[calc(1.5rem-1px)] bg-white dark:bg-slate-900 transition-colors">
                  <div class="relative h-52 overflow-hidden bg-[#f4e6dd] dark:bg-slate-800">
                    <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85" alt="Welcoming tables inside a small restaurant" class="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    <span class="absolute left-4 top-4 rounded-full bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#ad654d] dark:text-rose-400 shadow-sm backdrop-blur-sm">{{ lang.t('landing.sectorFood') }}</span>
                  </div>
                  <div class="p-5">
                    <h3 class="text-base font-semibold text-[#244235] dark:text-white">{{ lang.t('landing.foodTitle') }}</h3>
                    <p class="mt-2 text-sm leading-6 text-[#56665d] dark:text-slate-300">{{ lang.t('landing.foodDesc') }}</p>
                  </div>
                </div>
              </article>

              <article class="group relative rounded-3xl bg-gradient-to-br from-white via-[#ece9df] to-white dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-[1px] shadow-[0_14px_38px_-22px_rgba(81,70,44,.5)] dark:shadow-black/40 transition-all duration-500 hover:-translate-y-2 hover:from-emerald-300 hover:via-amber-200 hover:to-rose-300 hover:shadow-[0_36px_70px_-26px_rgba(81,70,44,.55)]">
                <div class="overflow-hidden rounded-[calc(1.5rem-1px)] bg-white dark:bg-slate-900 transition-colors">
                  <div class="relative h-52 overflow-hidden bg-[#e2edf2] dark:bg-slate-800">
                    <img src="https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=900&q=85" alt="Aisles stocked with products in a neighborhood mini-market" class="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    <span class="absolute left-4 top-4 rounded-full bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#4c7393] dark:text-blue-400 shadow-sm backdrop-blur-sm">{{ lang.t('landing.sectorRetail') }}</span>
                  </div>
                  <div class="p-5">
                    <h3 class="text-base font-semibold text-[#244235] dark:text-white">{{ lang.t('landing.retailTitle') }}</h3>
                    <p class="mt-2 text-sm leading-6 text-[#56665d] dark:text-slate-300">{{ lang.t('landing.retailDesc') }}</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <!-- ========================================== -->
        <!-- CONNECTED TOOLKIT CAPABILITIES             -->
        <!-- ========================================== -->
        <section id="capabilities" class="relative scroll-mt-16 overflow-hidden bg-gradient-to-b from-[#e6edf6] via-[#eee9f4] to-[#f4eadc] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20 sm:py-28 transition-colors duration-200">
          <div class="orb-b pointer-events-none absolute -left-40 top-20 size-96 rounded-full bg-sky-300/20 blur-[120px]"></div>
          <div class="orb-a pointer-events-none absolute -right-40 bottom-0 size-96 rounded-full bg-violet-300/20 blur-[120px]"></div>
          <div class="absolute inset-0 dot-grid opacity-30 dark:opacity-10 pointer-events-none"></div>

          <div class="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div class="mx-auto max-w-2xl text-center">
              <p class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-400">
                <span class="size-1.5 rounded-full bg-emerald-500"></span> {{ lang.t('landing.capsPill') }}
              </p>
              <h2 class="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#0f2a22] dark:text-white sm:text-[2.5rem] sm:leading-[1.1]">{{ lang.t('landing.capsTitle') }}</h2>
              <p class="mt-4 text-sm leading-7 text-[#52645a] dark:text-slate-300 sm:text-base">
                {{ lang.t('landing.capsSubtitle') }}
              </p>
            </div>

            <div class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <article class="group relative rounded-3xl bg-gradient-to-br from-[#f2b455] via-[#f6c977] to-[#f2b455] p-[1px] shadow-[0_18px_44px_-24px_rgba(35,69,49,.5)] dark:shadow-black/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_36px_70px_-26px_rgba(35,69,49,.5)]">
                <div class="h-full rounded-[calc(1.5rem-1px)] bg-white/95 dark:bg-slate-900/95 p-6 backdrop-blur-xl sm:p-7 transition-colors">
                  <span class="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#edf4e9] to-[#dfebd8] dark:from-emerald-950 dark:to-emerald-900 text-[#5c8463] dark:text-emerald-300 shadow-inner transition group-hover:scale-105">
                    <svg viewBox="0 0 24 24" fill="none" class="size-5" aria-hidden="true">
                      <path d="M4 5.5h16v13H4v-13Zm0 4h16M8 5.5v4m8-4v4m-8 5h3m2 0h3m-8 2.5h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <h3 class="mt-5 text-base font-semibold text-[#244235] dark:text-white">{{ lang.t('landing.cap1Title') }}</h3>
                  <p class="mt-2 text-sm leading-6 text-[#56665d] dark:text-slate-300">{{ lang.t('landing.cap1Desc') }}</p>
                </div>
              </article>

              <article id="field-work" class="scroll-mt-16 group relative rounded-3xl bg-gradient-to-br from-[#65bac4] via-[#8ecfd6] to-[#65bac4] p-[1px] shadow-[0_18px_44px_-24px_rgba(35,69,49,.5)] dark:shadow-black/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_36px_70px_-26px_rgba(35,69,49,.5)]">
                <div class="h-full rounded-[calc(1.5rem-1px)] bg-white/95 dark:bg-slate-900/95 p-6 backdrop-blur-xl sm:p-7 transition-colors">
                  <span class="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f8f1e5] to-[#f0e3c8] dark:from-amber-950 dark:to-amber-900 text-[#a17c43] dark:text-amber-300 shadow-inner transition group-hover:scale-105">
                    <svg viewBox="0 0 24 24" fill="none" class="size-5" aria-hidden="true">
                      <path d="M12 20s7-4.4 7-10.2a7 7 0 0 0-14 0C5 15.6 12 20 12 20Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                      <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                  </span>
                  <h3 class="mt-5 text-base font-semibold text-[#244235] dark:text-white">{{ lang.t('landing.cap2Title') }}</h3>
                  <p class="mt-2 text-sm leading-6 text-[#56665d] dark:text-slate-300">{{ lang.t('landing.cap2Desc') }}</p>
                </div>
              </article>

              <article class="group relative rounded-3xl bg-gradient-to-br from-[#a88bd1] via-[#c3abdf] to-[#a88bd1] p-[1px] shadow-[0_18px_44px_-24px_rgba(35,69,49,.5)] dark:shadow-black/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_36px_70px_-26px_rgba(35,69,49,.5)]">
                <div class="h-full rounded-[calc(1.5rem-1px)] bg-white/95 dark:bg-slate-900/95 p-6 backdrop-blur-xl sm:p-7 transition-colors">
                  <span class="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eef1f7] to-[#dfe5f0] dark:from-slate-800 dark:to-slate-700 text-[#6c7897] dark:text-slate-300 shadow-inner transition group-hover:scale-105">
                    <svg viewBox="0 0 24 24" fill="none" class="size-5" aria-hidden="true">
                      <path d="M12 3v9l6.4 3.7M20.5 12a8.5 8.5 0 1 1-2.49-6.01L20.5 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <h3 class="mt-5 text-base font-semibold text-[#244235] dark:text-white">{{ lang.t('landing.cap3Title') }}</h3>
                  <p class="mt-2 text-sm leading-6 text-[#56665d] dark:text-slate-300">{{ lang.t('landing.cap3Desc') }}</p>
                </div>
              </article>

              <article class="group relative rounded-3xl bg-gradient-to-br from-[#e9957f] via-[#f1b09b] to-[#e9957f] p-[1px] shadow-[0_18px_44px_-24px_rgba(35,69,49,.5)] dark:shadow-black/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_36px_70px_-26px_rgba(35,69,49,.5)]">
                <div class="h-full rounded-[calc(1.5rem-1px)] bg-white/95 dark:bg-slate-900/95 p-6 backdrop-blur-xl sm:p-7 transition-colors">
                  <span class="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f8ece9] to-[#f1dcd6] dark:from-rose-950 dark:to-rose-900 text-[#ad7665] dark:text-rose-300 shadow-inner transition group-hover:scale-105">
                    <svg viewBox="0 0 24 24" fill="none" class="size-5" aria-hidden="true">
                      <path d="M12 3.5 20 7v5c0 4.5-3.2 7.2-8 8.5C7.2 19.2 4 16.5 4 12V7l8-3.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                      <path d="M12 8v4m0 3h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                    </svg>
                  </span>
                  <h3 class="mt-5 text-base font-semibold text-[#244235] dark:text-white">{{ lang.t('landing.cap4Title') }}</h3>
                  <p class="mt-2 text-sm leading-6 text-[#56665d] dark:text-slate-300">{{ lang.t('landing.cap4Desc') }}</p>
                </div>
              </article>

              <article class="group relative rounded-3xl bg-gradient-to-br from-[#6f9fe2] via-[#96b7ec] to-[#6f9fe2] p-[1px] shadow-[0_18px_44px_-24px_rgba(35,69,49,.5)] dark:shadow-black/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_36px_70px_-26px_rgba(35,69,49,.5)]">
                <div class="h-full rounded-[calc(1.5rem-1px)] bg-white/95 dark:bg-slate-900/95 p-6 backdrop-blur-xl sm:p-7 transition-colors">
                  <span class="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eaf2f1] to-[#d8e6e3] dark:from-teal-950 dark:to-teal-900 text-[#58817b] dark:text-teal-300 shadow-inner transition group-hover:scale-105">
                    <svg viewBox="0 0 24 24" fill="none" class="size-5" aria-hidden="true">
                      <path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <h3 class="mt-5 text-base font-semibold text-[#244235] dark:text-white">{{ lang.t('landing.cap5Title') }}</h3>
                  <p class="mt-2 text-sm leading-6 text-[#56665d] dark:text-slate-300">{{ lang.t('landing.cap5Desc') }}</p>
                </div>
              </article>

              <article class="group relative rounded-3xl bg-gradient-to-br from-[#d581b0] via-[#e2a3c5] to-[#d581b0] p-[1px] shadow-[0_18px_44px_-24px_rgba(35,69,49,.5)] dark:shadow-black/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_36px_70px_-26px_rgba(35,69,49,.5)]">
                <div class="h-full rounded-[calc(1.5rem-1px)] bg-white/95 dark:bg-slate-900/95 p-6 backdrop-blur-xl sm:p-7 transition-colors">
                  <span class="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f2edf6] to-[#e5d9ee] dark:from-purple-950 dark:to-purple-900 text-[#85709a] dark:text-purple-300 shadow-inner transition group-hover:scale-105">
                    <svg viewBox="0 0 24 24" fill="none" class="size-5" aria-hidden="true">
                      <path d="M4 6.5h16M4 12h16M4 17.5h16M9 4v5m6 .5v5m-4 1v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </span>
                  <h3 class="mt-5 text-base font-semibold text-[#244235] dark:text-white">{{ lang.t('landing.cap6Title') }}</h3>
                  <p class="mt-2 text-sm leading-6 text-[#56665d] dark:text-slate-300">{{ lang.t('landing.cap6Desc') }}</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <!-- ========================================== -->
        <!-- ACTION CALLOUT SECTION                     -->
        <!-- ========================================== -->
        <section class="relative bg-gradient-to-b from-[#f4eadc] to-[#e9eee3] dark:from-slate-950 dark:to-slate-900 px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:px-10 transition-colors duration-200">
          <div class="relative mx-auto max-w-7xl">
            <!-- Animated aura -->
            <div class="cta-aura spin-slow pointer-events-none absolute -inset-6 rounded-[3rem]"></div>

            <div class="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#0a2e22] via-[#1b5a55] to-[#3a4f82] dark:from-[#051c14] dark:via-[#0f3431] dark:to-[#1e2942] px-7 py-14 text-center shadow-[0_50px_100px_-30px_rgba(10,46,34,.7)] ring-1 ring-inset ring-white/15 sm:px-12 sm:py-20">
              <!-- Inner decor -->
              <div class="pointer-events-none absolute -right-20 -top-36 size-80 rounded-full border border-[#ffd28b]/30"></div>
              <div class="pointer-events-none absolute -right-8 -top-24 size-56 rounded-full border border-[#a8dcf0]/30"></div>
              <div class="pointer-events-none absolute -bottom-40 -left-24 size-96 rounded-full bg-[#e9957f]/20 blur-3xl"></div>
              <div class="pointer-events-none absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl pulse-glow"></div>
              <div class="absolute inset-0 opacity-[0.08]" style="background-image: radial-gradient(rgba(255,255,255,.9) 1px, transparent 1px); background-size: 22px 22px;"></div>

              <p class="relative text-xs font-bold uppercase tracking-[0.24em] text-[#f6dba8]">{{ lang.t('landing.calloutPill') }}</p>
              <h2 class="relative mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-[2.75rem] sm:leading-[1.1]">{{ lang.t('landing.calloutTitle') }}</h2>
              <p class="relative mx-auto mt-5 max-w-xl text-sm leading-7 text-[#dfeaee] sm:text-base">
                {{ lang.t('landing.calloutDesc') }}
              </p>
              <div class="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  routerLink="/register"
                  class="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-[#fff5da] to-[#ffe3a8] px-7 py-3.5 text-sm font-semibold text-[#173a2a] shadow-[0_18px_40px_-12px_rgba(255,240,206,.55),inset_0_1px_0_rgba(255,255,255,.8)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_26px_55px_-14px_rgba(255,240,206,.75),inset_0_1px_0_rgba(255,255,255,.9)] active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#174c3c]"
                >
                  <span class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full"></span>
                  {{ lang.t('landing.calloutCta') }}
                  <svg viewBox="0 0 20 20" fill="none" class="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                    <path d="M4.167 10h11.666m0 0L10 4.167M15.833 10 10 15.833" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </a>
                <button
                  type="button"
                  (click)="scrollTo('home')"
                  class="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/20 cursor-pointer"
                >
                  {{ lang.t('landing.backToTop') }}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- ========================================== -->
      <!-- FOOTER                                     -->
      <!-- ========================================== -->
      <footer class="relative border-t border-[#d1dacd] dark:border-slate-800 bg-[#e6ecdf] dark:bg-slate-950 transition-colors duration-200">
        <div class="absolute inset-0 dot-grid opacity-25 dark:opacity-10 pointer-events-none"></div>
        <div class="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_0.8fr_0.8fr] lg:px-10">
          <div>
            <a href="#home" class="flex w-fit items-center gap-3 font-semibold text-[#294538] dark:text-white">
              <span class="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#17834a] to-[#367bab] text-white shadow-[0_14px_28px_-12px_rgba(23,131,74,.75),inset_0_1px_0_rgba(255,255,255,.35)]">
                <svg viewBox="0 0 32 32" fill="none" class="size-5" aria-hidden="true">
                  <path d="M16 26V13m0 8c-6.5 0-10-3.5-10-10 6.5 0 10 3.5 10 10Zm0-5c0-6.5 3.5-10 10-10 0 6.5-3.5 10-10 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span>
                <span class="block text-sm font-bold">{{ lang.t('nav.brand') }}</span>
                <span class="mt-0.5 block text-[10px] font-semibold tracking-wide text-[#64746a] dark:text-slate-400 uppercase">{{ lang.t('landing.footerTagline') }}</span>
              </span>
            </a>
            <p class="mt-4 max-w-sm text-sm leading-6 text-[#56665d] dark:text-slate-300">
              {{ lang.t('landing.footerBrandDesc') }}
            </p>
          </div>

          <div>
            <h2 class="text-xs font-bold uppercase tracking-[0.18em] text-[#355849] dark:text-slate-300">{{ lang.t('landing.footerExplore') }}</h2>
            <nav class="mt-4 flex flex-col items-start gap-3 text-sm text-[#56665d] dark:text-slate-300" aria-label="Footer navigation">
              <button type="button" (click)="scrollTo('approach')" class="transition hover:text-[#1f9b4b] dark:hover:text-emerald-400 cursor-pointer text-left">{{ lang.t('nav.ourApproach') }}</button>
              <button type="button" (click)="scrollTo('capabilities')" class="transition hover:text-[#1f9b4b] dark:hover:text-emerald-400 cursor-pointer text-left">{{ lang.t('nav.platformCaps') }}</button>
              <button type="button" (click)="scrollTo('field-work')" class="transition hover:text-[#1f9b4b] dark:hover:text-emerald-400 cursor-pointer text-left">{{ lang.t('nav.fieldTeams') }}</button>
              <a class="transition hover:text-[#1f9b4b] dark:hover:text-emerald-400" routerLink="/register">{{ lang.t('nav.register') }}</a>
            </nav>
          </div>

          <div>
            <h2 class="text-xs font-bold uppercase tracking-[0.18em] text-[#355849] dark:text-slate-300">{{ lang.t('landing.footerConnectedView') }}</h2>
            <p class="mt-4 text-sm leading-6 text-[#56665d] dark:text-slate-300">
              {{ lang.t('landing.footerConnectedDesc') }}
            </p>
            <button type="button" (click)="scrollTo('home')" class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#347b58] dark:text-emerald-400 transition hover:text-[#245c40] dark:hover:text-emerald-300 cursor-pointer">
              {{ lang.t('landing.backToTop') }}
              <svg viewBox="0 0 20 20" fill="none" class="size-4" aria-hidden="true">
                <path d="M10 15.833V4.167m0 0L4.167 10M10 4.167 15.833 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="relative border-t border-[#d1dacd] dark:border-slate-800 bg-[#dce5d8] dark:bg-slate-900 transition-colors duration-200">
          <div class="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-4 text-xs text-[#5f6d64] dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
            <p>&copy; 2026 {{ lang.t('landing.footerRights') }}</p>
            <p>{{ lang.t('landing.footerSubtext') }}</p>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class LandingComponent implements OnDestroy {
  readonly lang = inject(LanguageService);
  private previousScrollY = 0;
  private scrollResetTimer: number | undefined;

  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - this.previousScrollY;
    this.previousScrollY = currentScrollY;

    if (scrollDelta === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const bounceDistance = Math.sign(scrollDelta) * Math.min(22, Math.max(7, Math.abs(scrollDelta) * 0.8));
    document.documentElement.style.setProperty('--scroll-wave-bounce', `${bounceDistance}px`);

    window.clearTimeout(this.scrollResetTimer);
    this.scrollResetTimer = window.setTimeout(() => {
      document.documentElement.style.setProperty('--scroll-wave-bounce', '0px');
      this.scrollResetTimer = undefined;
    }, 75);
  }

  ngOnDestroy(): void {
    window.clearTimeout(this.scrollResetTimer);
    document.documentElement.style.removeProperty('--scroll-wave-bounce');
  }
}