import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LanguageService } from '../../core/services/language.service';

export interface LearningItem {
  id: string;
  title: string;
  content: string;
  category: string;
  sector: string;
  language: string;
  duration?: string;
  takeaways?: string[];
}

@Component({
  selector: 'app-learning',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              {{ lang.t('learn.academy') }}
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">{{ lang.t('learn.academySub') }}</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {{ lang.t('learn.title') }}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ lang.t('learn.subtitle') }}</p>
        </div>

        <!-- Language Switcher Filter -->
        <div class="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button 
            (click)="setLanguage('')" 
            [ngClass]="selectedLanguage() === '' 
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'"
            class="px-2.5 py-1.5 rounded-lg transition-colors">
            {{ lang.t('learn.allLanguages') }}
          </button>
          <button 
            (click)="setLanguage('en')" 
            [ngClass]="selectedLanguage() === 'en' 
              ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-sm' 
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'"
            class="px-2.5 py-1.5 rounded-lg transition-colors">
            English
          </button>
          <button 
            (click)="setLanguage('am')" 
            [ngClass]="selectedLanguage() === 'am' 
              ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-sm' 
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'"
            class="px-2.5 py-1.5 rounded-lg transition-colors">
            አማርኛ
          </button>
          <button 
            (click)="setLanguage('om')" 
            [ngClass]="selectedLanguage() === 'om' 
              ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-sm' 
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'"
            class="px-2.5 py-1.5 rounded-lg transition-colors">
            Afaan Oromoo
          </button>
          <button 
            (click)="setLanguage('ti')" 
            [ngClass]="selectedLanguage() === 'ti' 
              ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-sm' 
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'"
            class="px-2.5 py-1.5 rounded-lg transition-colors">
            ትግርኛ
          </button>
        </div>
      </div>

      <!-- Categories Filter -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1">
        @for (cat of categories; track cat) {
          <button 
            (click)="setCategory(cat)" 
            [ngClass]="selectedCategory() === cat 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors">
            {{ cat === 'All' ? lang.t('learn.allCategories') : cat }}
          </button>
        }
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div class="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">{{ lang.t('common.loading') }}</p>
        </div>
      } @else {
        <!-- Lesson Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (m of filteredResources(); track m.id) {
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors flex flex-col justify-between">
              <div class="space-y-3">
                <div class="flex items-center justify-between text-xs">
                  <span class="px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {{ m.category }}
                  </span>
                  <div class="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-medium">
                    <span class="uppercase text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">{{ m.language }}</span>
                    <span>{{ m.duration || '3 min read' }}</span>
                  </div>
                </div>

                <div>
                  <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ m.title }}</h3>
                  <p class="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{{ m.content }}</p>
                </div>
              </div>

              @if (m.takeaways && m.takeaways.length > 0) {
                <div class="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800 space-y-1.5 mt-2">
                  <div class="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{{ lang.t('learn.takeaways') }}</div>
                  <ul class="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                    @for (pt of m.takeaways; track pt) {
                      <li>{{ pt }}</li>
                    }
                  </ul>
                </div>
              }
            </div>
          } @empty {
            <div class="col-span-2 py-16 text-center text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              {{ lang.t('learn.noGuides') }}
            </div>
          }
        </div>
      }
    </div>
  `
})
export class LearningComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly lang = inject(LanguageService);

  readonly resources = signal<LearningItem[]>([]);
  readonly selectedCategory = signal<string>('All');
  readonly selectedLanguage = signal<string>('');
  readonly isLoading = signal(false);

  readonly categories = [
    'All',
    'FinancialLiteracy',
    'BusinessManagement',
    'VocationalGuidance'
  ];

  constructor() {
    // Automatically match page default filter to user's selected app language
    effect(() => {
      const activeAppLang = this.lang.currentLang();
      this.selectedLanguage.set(activeAppLang);
    });
  }

  ngOnInit(): void {
    this.loadResources();
  }

  setCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  setLanguage(langCode: string): void {
    this.selectedLanguage.set(langCode);
  }

  filteredResources(): LearningItem[] {
    let list = this.resources();
    const cat = this.selectedCategory();
    const langCode = this.selectedLanguage();

    if (cat !== 'All') {
      list = list.filter(r => r.category === cat);
    }

    if (langCode) {
      list = list.filter(r => r.language === langCode);
    }

    return list;
  }

  loadResources(): void {
    this.isLoading.set(true);
    this.http.get<LearningItem[]>(`${environment.apiUrl}/learning/resources`).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res && res.length > 0) {
          this.resources.set(res);
        } else {
          this.loadDefaultModules();
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.loadDefaultModules();
      }
    });
  }

  private loadDefaultModules(): void {
    this.resources.set([
      {
        id: '1',
        title: 'Daily Cash Separation: Household vs. Business',
        content: 'Never mix personal family living money with business sales. Keep two separate envelopes or cash boxes. Pay yourself a fixed modest salary only at the end of each week.',
        category: 'FinancialLiteracy',
        sector: 'All',
        language: 'en',
        duration: '2 min read',
        takeaways: [
          'Maintain two separate lock boxes for home & enterprise cash.',
          'Record daily sales in the app immediately before closing shop.'
        ]
      },
      {
        id: '2',
        title: 'የንግድ ገንዘብን እና የቤት ወጪን መለየት (Cash Flow Separation)',
        content: 'የንግድዎን ገንዘብ ከቤተሰብ ወጪ ጋር ፈጽሞ አይቀላቅሉ። ለራስዎ ሳምንታዊ ወይም ወርሃዊ የተወሰነ ደመወዝ ብቻ ይመድቡ። ሁሉንም የቀን ሽያጭና ወጪ በመተግበሪያው ላይ በትክክል ይመዝግቡ።',
        category: 'FinancialLiteracy',
        sector: 'All',
        language: 'am',
        duration: '2 min read',
        takeaways: [
          'የንግድ ገቢን ለግል ወጪ በቀጥታ አይጠቀሙ።',
          'የቀን ገቢዎን እና ወጪዎን አዘውትረው በመመዝገብ ትርፍዎን ይወቁ።'
        ]
      },
      {
        id: '3',
        title: 'Inventory Turn and Supplier Credit Management',
        content: 'Avoid over-investing working capital into slow-moving stock. Focus on fast-turning staples. Reinvest your net profits into high-margin inventory weekly.',
        category: 'BusinessManagement',
        sector: 'Retail',
        language: 'en',
        duration: '3 min read',
        takeaways: [
          'Identify fast-selling items and keep optimal buffer stock.',
          'Negotiate volume discounts by pooling orders with nearby entrepreneurs.'
        ]
      },
      {
        id: '4',
        title: 'Garaagarummaa Yaa\'a Maallaqaa fi Bu\'aa (Cash Flow vs Profit)',
        content: 'Yaa\'i maallaqaa maallaqa guyyaa guyyaan daldala keessan keessa galuu fi bahuudha. Bu\'aan ammoo erga baasiin hundi hir\'ifamee booda kan hafuudha. Yeroo hunda galii fi baasii guyyaa guyyaan galmeessaa.',
        category: 'FinancialLiteracy',
        sector: 'All',
        language: 'om',
        duration: '3 min read',
        takeaways: [
          'Maallaqa daldalaa fi baasii mana keessaa walitti hin makiinaa!',
          'Galii fi baasii guyyaa guyyaan moobaayila keessan irratti galmeessaa.'
        ]
      },
      {
        id: '5',
        title: 'ፍልልይ ዋሕዚ ገንዘብን መኽሰብን (Cash Flow vs Profit)',
        content: 'ዋሕዚ ገንዘብ ማለት መዓልታዊ ናብ ንግድኹም ዝኣቱን ዝወጽእን ጥረ ገንዘብ እዩ። መኽሰብ ድማ ድሕሪ ኩሉ ወጻኢታት ምቕናስ ዝተርፍ እዩ። ኩሉ ግዜ መዓልታዊ ኣታውን ወጻእን ብግቡእ መዝግቡ።',
        category: 'FinancialLiteracy',
        sector: 'All',
        language: 'ti',
        duration: '3 min read',
        takeaways: [
          'ገንዘብ ንግድን ወጻኢታት ገዛን ፈጺምኩም ኣይትሕውሱ!',
          'መዓልታዊ ዝተሸጠሉን ዝወጸ ወጻእን ኣብ ሞባይልኩም ብቕልጡፍ መዝግቡ።'
        ]
      },
      {
        id: '6',
        title: 'Poultry Disease Prevention & Feeding Tips',
        content: 'Vaccinate chicks on schedule against Newcastle disease. Keep the coop dry and well-ventilated. Measure daily feed strictly according to the bird age to minimize wastage.',
        category: 'VocationalGuidance',
        sector: 'Poultry',
        language: 'en',
        duration: '4 min read',
        takeaways: [
          'Vaccinate according to local branch veterinary schedules.',
          'Record feed consumption against egg/weight yield weekly to spot poor performers.'
        ]
      }
    ]);
  }
}