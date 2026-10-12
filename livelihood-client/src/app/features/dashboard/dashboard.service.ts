import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SectorDistribution {
  sector: string;
  beneficiaryCount: number;
  totalRevenue: number;
  averageProfit: number;
}

export interface RegionDistribution {
  region: string;
  beneficiaryCount: number;
  totalSeedDisbursed: number;
  totalRevenue: number;
  netProfit: number;
}

export interface AtRiskBeneficiary {
  beneficiaryId: string;
  fullName: string;
  branchCode: string;
  region: string;
  sector: string;
  seedCapital: number;
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  totalLoggedTransactions: number;
  status: string;
}

export interface DashboardSummary {
  totalBeneficiaries: number;
  activeBeneficiaries: number;
  inactiveBeneficiaries: number;
  atRiskBeneficiaries: number;
  totalSeedCapitalDisbursed: number;
  totalCapitalInvested: number;
  seedMoneyUtilizationPercentage: number;
  totalRevenue: number;
  totalOperationalExpenses: number;
  totalNetProfit: number;
  sectorBreakdown: SectorDistribution[];
  regionalBreakdown: RegionDistribution[];
  criticalFollowUps: AtRiskBeneficiary[];
}

export interface CashFlowPoint {
  periodLabel: string;
  sales: number;
  expenses: number;
  netProfit: number;
}

export interface BreakEvenAnalysis {
  seedCapitalAmount: number;
  cumulativeNetProfit: number;
  remainingToBreakEven: number;
  breakEvenPercentage: number;
  isBreakEvenAchieved: boolean;
}

export interface FinancialAlert {
  hasAlert: boolean;
  severity: string;
  message: string;
}

export interface BeneficiaryFinancialSummary {
  beneficiaryProfileId: string;
  fullName: string;
  businessName: string;
  sector: string;
  dailyProfit: number;
  weeklyProfit: number;
  monthlyProfit: number;
  totalSalesAllTime: number;
  totalExpensesAllTime: number;
  totalSavingsAllTime: number;
  netProfitAllTime: number;
  breakEven: BreakEvenAnalysis;
  expenseVsIncomeAlert: FinancialAlert;
  weeklyCashFlow: CashFlowPoint[];
  monthlyCashFlow: CashFlowPoint[];
}

export interface MonthlyFinancialMetric {
  monthLabel: string;
  year: number;
  month: number;
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getSummary(branchCode?: string, region?: string, cluster?: string, partnerOrganization?: string): Observable<DashboardSummary> {
    let params = new HttpParams();
    if (branchCode) params = params.set('branchCode', branchCode);
    if (region) params = params.set('region', region);
    if (cluster) params = params.set('cluster', cluster);
    if (partnerOrganization) params = params.set('partnerOrganization', partnerOrganization);

    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard/summary`, { params });
  }

  getFinancialTrends(months: number = 6): Observable<MonthlyFinancialMetric[]> {
    const params = new HttpParams().set('months', months.toString());
    return this.http.get<MonthlyFinancialMetric[]>(`${this.baseUrl}/dashboard/trends`, { params });
  }

  getBeneficiaryFinancialSummary(id: string): Observable<BeneficiaryFinancialSummary> {
    return this.http.get<BeneficiaryFinancialSummary>(`${this.baseUrl}/beneficiaries/${id}/financial-summary`);
  }

  updateBeneficiaryProfile(id: string, data: { fullName?: string; phoneNumber?: string; businessName?: string; livelihoodSector?: string }): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/beneficiaries/${id}/profile`, data);
  }

  logCaseNote(command: {
    beneficiaryProfileId: string;
    staffId: string;
    staffName: string;
    visitDateUtc: string;
    visitFindings: string;
    recommendations: string;
    followUpRequired: boolean;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/case-management/case-notes`, command);
  }

  exportBeneficiariesCsv(branchCode?: string, region?: string): Observable<Blob> {
    let params = new HttpParams();
    if (branchCode) params = params.set('branchCode', branchCode);
    if (region) params = params.set('region', region);

    return this.http.get(`${this.baseUrl}/reports/export/beneficiaries-csv`, {
      params,
      responseType: 'blob'
    });
  }

  exportTransactionsCsv(beneficiaryProfileId?: string, branchCode?: string): Observable<Blob> {
    let params = new HttpParams();
    if (beneficiaryProfileId) params = params.set('beneficiaryProfileId', beneficiaryProfileId);
    if (branchCode) params = params.set('branchCode', branchCode);

    return this.http.get(`${this.baseUrl}/reports/export/transactions-csv`, {
      params,
      responseType: 'blob'
    });
  }
}