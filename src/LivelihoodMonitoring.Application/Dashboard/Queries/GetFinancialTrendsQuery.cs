using MediatR;
using Microsoft.EntityFrameworkCore;
using LivelihoodMonitoring.Application.Common.Interfaces;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Application.Dashboard.Queries;

public record GetFinancialTrendsQuery(int MonthsBack = 6) : IRequest<List<MonthlyFinancialMetricDto>>;

public record MonthlyFinancialMetricDto(
    string MonthLabel,
    int Year,
    int Month,
    decimal TotalSales,
    decimal TotalExpenses,
    decimal NetProfit
);

public class GetFinancialTrendsQueryHandler : IRequestHandler<GetFinancialTrendsQuery, List<MonthlyFinancialMetricDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFinancialTrendsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MonthlyFinancialMetricDto>> Handle(
        GetFinancialTrendsQuery request, 
        CancellationToken cancellationToken)
    {
        var startDate = DateTime.UtcNow.AddMonths(-request.MonthsBack);

        var transactions = await _context.BusinessTransactions
            .AsNoTracking()
            .Where(t => !t.IsDeleted && t.OccurredAtUtc >= startDate)
            .Select(t => new
            {
                t.OccurredAtUtc.Year,
                t.OccurredAtUtc.Month,
                t.Type,
                t.Amount
            })
            .ToListAsync(cancellationToken);

        var grouped = transactions
            .GroupBy(t => new { t.Year, t.Month })
            .OrderBy(g => g.Key.Year)
            .ThenBy(g => g.Key.Month)
            .Select(g =>
            {
                var sales = g.Where(x => x.Type == TransactionType.Sale).Sum(x => x.Amount);
                var expenses = g.Where(x => x.Type == TransactionType.OperationalExpense || x.Type == TransactionType.InventoryPurchase).Sum(x => x.Amount);
                return new MonthlyFinancialMetricDto(
                    MonthLabel: $"{g.Key.Year}-{g.Key.Month:D2}",
                    Year: g.Key.Year,
                    Month: g.Key.Month,
                    TotalSales: sales,
                    TotalExpenses: expenses,
                    NetProfit: sales - expenses
                );
            })
            .ToList();

        return grouped;
    }
}