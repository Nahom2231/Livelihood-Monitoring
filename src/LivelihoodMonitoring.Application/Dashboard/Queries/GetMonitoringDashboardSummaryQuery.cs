using MediatR;
using Microsoft.EntityFrameworkCore;
using LivelihoodMonitoring.Application.Common.Interfaces;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Application.Dashboard.Queries;

public record GetMonitoringDashboardSummaryQuery(
    string? BranchCode = null,
    string? Region = null,
    string? Cluster = null,
    string? PartnerOrganization = null
) : IRequest<DashboardSummaryDto>;

public record DashboardSummaryDto(
    int TotalBeneficiaries,
    int ActiveBeneficiaries,
    int InactiveBeneficiaries,
    int AtRiskBeneficiaries,
    decimal TotalSeedCapitalDisbursed,
    decimal TotalCapitalInvested,
    decimal SeedMoneyUtilizationPercentage,
    decimal TotalRevenue,
    decimal TotalOperationalExpenses,
    decimal TotalNetProfit,
    List<SectorDistributionDto> SectorBreakdown,
    List<RegionDistributionDto> RegionalBreakdown,
    List<AtRiskBeneficiarySummaryDto> CriticalFollowUps
);

public record SectorDistributionDto(
    string Sector,
    int BeneficiaryCount,
    decimal TotalRevenue,
    decimal AverageProfit
);

public record RegionDistributionDto(
    string Region,
    int BeneficiaryCount,
    decimal TotalSeedDisbursed,
    decimal TotalRevenue,
    decimal NetProfit
);

public record AtRiskBeneficiarySummaryDto(
    Guid BeneficiaryId,
    string FullName,
    string BranchCode,
    string Region,
    string Sector,
    decimal SeedCapital,
    decimal TotalRevenue,
    decimal TotalExpense,
    decimal NetProfit,
    int TotalLoggedTransactions,
    string Status
);

public class GetMonitoringDashboardSummaryQueryHandler 
    : IRequestHandler<GetMonitoringDashboardSummaryQuery, DashboardSummaryDto>
{
    private readonly IApplicationDbContext _context;

    public GetMonitoringDashboardSummaryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> Handle(
        GetMonitoringDashboardSummaryQuery request, 
        CancellationToken cancellationToken)
    {
        // 1. Base query with optional regional, cluster, branch, and partner filters
        var query = _context.BeneficiaryProfiles
            .AsNoTracking()
            .Where(b => !b.IsDeleted);

        if (!string.IsNullOrWhiteSpace(request.BranchCode))
        {
            query = query.Where(b => b.BranchCode == request.BranchCode);
        }

        if (!string.IsNullOrWhiteSpace(request.Region))
        {
            query = query.Where(b => b.Region == request.Region);
        }

        if (!string.IsNullOrWhiteSpace(request.Cluster))
        {
            query = query.Where(b => b.Cluster == request.Cluster);
        }

        if (!string.IsNullOrWhiteSpace(request.PartnerOrganization))
        {
            query = query.Where(b => b.PartnerOrganization == request.PartnerOrganization);
        }

        // 2. Fetch required aggregate projections
        var beneficiaries = await query
            .Select(b => new
            {
                b.Id,
                b.FullName,
                b.BranchCode,
                b.Region,
                b.Cluster,
                b.LivelihoodSector,
                b.SeedCapitalAmount,
                b.Status,
                TotalSales = b.Transactions
                    .Where(t => t.Type == TransactionType.Sale && !t.IsDeleted)
                    .Sum(t => (decimal?)t.Amount) ?? 0m,
                TotalExpenses = b.Transactions
                    .Where(t => (t.Type == TransactionType.OperationalExpense || t.Type == TransactionType.InventoryPurchase) && !t.IsDeleted)
                    .Sum(t => (decimal?)t.Amount) ?? 0m,
                TotalInventoryInvested = b.Transactions
                    .Where(t => t.Type == TransactionType.InventoryPurchase && !t.IsDeleted)
                    .Sum(t => (decimal?)t.Amount) ?? 0m,
                TransactionCount = b.Transactions.Count(t => !t.IsDeleted)
            })
            .ToListAsync(cancellationToken);

        // 3. Compute High-Level Metrics
        var totalBeneficiaries = beneficiaries.Count;
        var totalDisbursed = beneficiaries.Sum(b => b.SeedCapitalAmount);
        var totalInvested = beneficiaries.Sum(b => b.TotalInventoryInvested);
        var seedUtilizationPct = totalDisbursed > 0 ? Math.Round((totalInvested / totalDisbursed) * 100m, 1) : 0m;
        var totalRevenue = beneficiaries.Sum(b => b.TotalSales);
        var totalExpenses = beneficiaries.Sum(b => b.TotalExpenses);
        var totalNetProfit = totalRevenue - totalExpenses;

        // 4. Sector breakdown calculation
        var sectorBreakdown = beneficiaries
            .GroupBy(b => b.LivelihoodSector)
            .Select(g => new SectorDistributionDto(
                Sector: string.IsNullOrWhiteSpace(g.Key) ? "General" : g.Key,
                BeneficiaryCount: g.Count(),
                TotalRevenue: g.Sum(x => x.TotalSales),
                AverageProfit: g.Count() > 0 ? (g.Sum(x => x.TotalSales - x.TotalExpenses) / g.Count()) : 0m
            ))
            .OrderByDescending(s => s.BeneficiaryCount)
            .ToList();

        // 5. Regional breakdown calculation (summaries by region)
        var regionalBreakdown = beneficiaries
            .GroupBy(b => string.IsNullOrWhiteSpace(b.Region) ? "Unassigned" : b.Region)
            .Select(g => new RegionDistributionDto(
                Region: g.Key,
                BeneficiaryCount: g.Count(),
                TotalSeedDisbursed: g.Sum(x => x.SeedCapitalAmount),
                TotalRevenue: g.Sum(x => x.TotalSales),
                NetProfit: g.Sum(x => x.TotalSales - x.TotalExpenses)
            ))
            .OrderByDescending(r => r.BeneficiaryCount)
            .ToList();

        // 6. Flag underperforming / at-risk businesses
        var atRiskList = beneficiaries
            .Where(b => b.Status == BusinessStatus.AtRisk 
                     || (b.TotalExpenses > b.TotalSales && b.TransactionCount > 0)
                     || b.TransactionCount == 0)
            .Select(b => new AtRiskBeneficiarySummaryDto(
                BeneficiaryId: b.Id,
                FullName: b.FullName,
                BranchCode: b.BranchCode,
                Region: b.Region,
                Sector: b.LivelihoodSector,
                SeedCapital: b.SeedCapitalAmount,
                TotalRevenue: b.TotalSales,
                TotalExpense: b.TotalExpenses,
                NetProfit: b.TotalSales - b.TotalExpenses,
                TotalLoggedTransactions: b.TransactionCount,
                Status: b.Status.ToString()
            ))
            .OrderBy(b => b.NetProfit)
            .Take(15)
            .ToList();

        var atRiskCount = beneficiaries.Count(b => b.Status == BusinessStatus.AtRisk || (b.TotalExpenses > b.TotalSales && b.TransactionCount > 0));
        var activeCount = beneficiaries.Count(b => b.Status == BusinessStatus.Active && b.TransactionCount > 0);
        var inactiveCount = beneficiaries.Count(b => b.TransactionCount == 0 || b.Status == BusinessStatus.Dormant);

        return new DashboardSummaryDto(
            TotalBeneficiaries: totalBeneficiaries,
            ActiveBeneficiaries: activeCount,
            InactiveBeneficiaries: inactiveCount,
            AtRiskBeneficiaries: atRiskCount,
            TotalSeedCapitalDisbursed: totalDisbursed,
            TotalCapitalInvested: totalInvested,
            SeedMoneyUtilizationPercentage: seedUtilizationPct,
            TotalRevenue: totalRevenue,
            TotalOperationalExpenses: totalExpenses,
            TotalNetProfit: totalNetProfit,
            SectorBreakdown: sectorBreakdown,
            RegionalBreakdown: regionalBreakdown,
            CriticalFollowUps: atRiskList
        );
    }
}