using MediatR;
using Microsoft.EntityFrameworkCore;
using LivelihoodMonitoring.Application.Common.Interfaces;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Application.Beneficiaries.Queries;

public record GetBeneficiaryFinancialSummaryQuery(Guid BeneficiaryProfileId) : IRequest<BeneficiaryFinancialSummaryDto?>;

public record CashFlowPointDto(
    string PeriodLabel,
    decimal Sales,
    decimal Expenses,
    decimal NetProfit
);

public record BreakEvenAnalysisDto(
    decimal SeedCapitalAmount,
    decimal CumulativeNetProfit,
    decimal RemainingToBreakEven,
    decimal BreakEvenPercentage,
    bool IsBreakEvenAchieved
);

public record FinancialAlertDto(
    bool HasAlert,
    string Severity, // "Info", "Warning", "Critical"
    string Message
);

public record BeneficiaryFinancialSummaryDto(
    Guid BeneficiaryProfileId,
    string FullName,
    string BusinessName,
    string Sector,
    decimal DailyProfit,
    decimal WeeklyProfit,
    decimal MonthlyProfit,
    decimal TotalSalesAllTime,
    decimal TotalExpensesAllTime,
    decimal TotalSavingsAllTime,
    decimal NetProfitAllTime,
    BreakEvenAnalysisDto BreakEven,
    FinancialAlertDto ExpenseVsIncomeAlert,
    List<CashFlowPointDto> WeeklyCashFlow,
    List<CashFlowPointDto> MonthlyCashFlow
);

public class GetBeneficiaryFinancialSummaryQueryHandler 
    : IRequestHandler<GetBeneficiaryFinancialSummaryQuery, BeneficiaryFinancialSummaryDto?>
{
    private readonly IApplicationDbContext _context;

    public GetBeneficiaryFinancialSummaryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BeneficiaryFinancialSummaryDto?> Handle(
        GetBeneficiaryFinancialSummaryQuery request, 
        CancellationToken cancellationToken)
    {
        var profile = await _context.BeneficiaryProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == request.BeneficiaryProfileId && !b.IsDeleted, cancellationToken);

        if (profile == null)
        {
            return null;
        }

        var now = DateTime.UtcNow;
        var startOfToday = now.Date;
        var sevenDaysAgo = now.Date.AddDays(-7);
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var sixMonthsAgo = now.Date.AddMonths(-6);

        var transactions = await _context.BusinessTransactions
            .AsNoTracking()
            .Where(t => t.BeneficiaryProfileId == request.BeneficiaryProfileId && !t.IsDeleted)
            .Select(t => new
            {
                t.Type,
                t.Amount,
                t.OccurredAtUtc
            })
            .ToListAsync(cancellationToken);

        // All-time metrics
        var totalSales = transactions.Where(t => t.Type == TransactionType.Sale).Sum(t => t.Amount);
        var totalExpenses = transactions.Where(t => t.Type == TransactionType.OperationalExpense || t.Type == TransactionType.InventoryPurchase).Sum(t => t.Amount);
        var totalSavings = transactions.Where(t => t.Type == TransactionType.SavingsContribution).Sum(t => t.Amount);
        var totalNetProfit = totalSales - totalExpenses;

        // Daily profit (today)
        var todaySales = transactions.Where(t => t.Type == TransactionType.Sale && t.OccurredAtUtc >= startOfToday).Sum(t => t.Amount);
        var todayExpenses = transactions.Where(t => (t.Type == TransactionType.OperationalExpense || t.Type == TransactionType.InventoryPurchase) && t.OccurredAtUtc >= startOfToday).Sum(t => t.Amount);
        var dailyProfit = todaySales - todayExpenses;

        // Weekly profit (last 7 days)
        var weeklySales = transactions.Where(t => t.Type == TransactionType.Sale && t.OccurredAtUtc >= sevenDaysAgo).Sum(t => t.Amount);
        var weeklyExpenses = transactions.Where(t => (t.Type == TransactionType.OperationalExpense || t.Type == TransactionType.InventoryPurchase) && t.OccurredAtUtc >= sevenDaysAgo).Sum(t => t.Amount);
        var weeklyProfit = weeklySales - weeklyExpenses;

        // Monthly profit (current month)
        var monthlySales = transactions.Where(t => t.Type == TransactionType.Sale && t.OccurredAtUtc >= startOfMonth).Sum(t => t.Amount);
        var monthlyExpenses = transactions.Where(t => (t.Type == TransactionType.OperationalExpense || t.Type == TransactionType.InventoryPurchase) && t.OccurredAtUtc >= startOfMonth).Sum(t => t.Amount);
        var monthlyProfit = monthlySales - monthlyExpenses;

        // Break-even analysis
        var seedCapital = profile.SeedCapitalAmount;
        var breakEvenPct = seedCapital > 0 
            ? Math.Round(Math.Clamp((totalNetProfit / seedCapital) * 100m, 0m, 999m), 1) 
            : 100m;
        var remainingToBreakEven = Math.Max(0m, seedCapital - totalNetProfit);
        var breakEvenAchieved = totalNetProfit >= seedCapital;

        var breakEvenDto = new BreakEvenAnalysisDto(
            SeedCapitalAmount: seedCapital,
            CumulativeNetProfit: totalNetProfit,
            RemainingToBreakEven: remainingToBreakEven,
            BreakEvenPercentage: breakEvenPct,
            IsBreakEvenAchieved: breakEvenAchieved
        );

        // Expense vs Income Alert
        FinancialAlertDto alert;
        if (monthlyExpenses > monthlySales && monthlyExpenses > 0)
        {
            var deficit = monthlyExpenses - monthlySales;
            alert = new FinancialAlertDto(
                HasAlert: true,
                Severity: "Warning",
                Message: $"Warning: Your expenses this month exceed your income by {deficit:N2} ETB. Keep operational costs low to maintain profitability."
            );
        }
        else if (weeklyExpenses > weeklySales && weeklyExpenses > 0)
        {
            alert = new FinancialAlertDto(
                HasAlert: true,
                Severity: "Info",
                Message: "Heads up: Your weekly expenses are higher than weekly sales. Monitor your cash outflow."
            );
        }
        else
        {
            alert = new FinancialAlertDto(
                HasAlert: false,
                Severity: "Normal",
                Message: "Business cash flow is positive. Keep maintaining solid daily records!"
            );
        }

        // Weekly Cash Flow points (day by day for last 7 days)
        var weeklyPoints = new List<CashFlowPointDto>();
        for (int i = 6; i >= 0; i--)
        {
            var day = now.Date.AddDays(-i);
            var nextDay = day.AddDays(1);
            var daySales = transactions.Where(t => t.Type == TransactionType.Sale && t.OccurredAtUtc >= day && t.OccurredAtUtc < nextDay).Sum(t => t.Amount);
            var dayExpenses = transactions.Where(t => (t.Type == TransactionType.OperationalExpense || t.Type == TransactionType.InventoryPurchase) && t.OccurredAtUtc >= day && t.OccurredAtUtc < nextDay).Sum(t => t.Amount);
            weeklyPoints.Add(new CashFlowPointDto(
                PeriodLabel: day.ToString("ddd (MMM dd)"),
                Sales: daySales,
                Expenses: dayExpenses,
                NetProfit: daySales - dayExpenses
            ));
        }

        // Monthly Cash Flow points (last 6 months)
        var monthlyPoints = transactions
            .Where(t => t.OccurredAtUtc >= sixMonthsAgo)
            .GroupBy(t => new { t.OccurredAtUtc.Year, t.OccurredAtUtc.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g =>
            {
                var sales = g.Where(x => x.Type == TransactionType.Sale).Sum(x => x.Amount);
                var expenses = g.Where(x => x.Type == TransactionType.OperationalExpense || x.Type == TransactionType.InventoryPurchase).Sum(x => x.Amount);
                return new CashFlowPointDto(
                    PeriodLabel: $"{g.Key.Year}-{g.Key.Month:D2}",
                    Sales: sales,
                    Expenses: expenses,
                    NetProfit: sales - expenses
                );
            })
            .ToList();

        return new BeneficiaryFinancialSummaryDto(
            BeneficiaryProfileId: profile.Id,
            FullName: profile.FullName,
            BusinessName: profile.BusinessName,
            Sector: profile.LivelihoodSector,
            DailyProfit: dailyProfit,
            WeeklyProfit: weeklyProfit,
            MonthlyProfit: monthlyProfit,
            TotalSalesAllTime: totalSales,
            TotalExpensesAllTime: totalExpenses,
            TotalSavingsAllTime: totalSavings,
            NetProfitAllTime: totalNetProfit,
            BreakEven: breakEvenDto,
            ExpenseVsIncomeAlert: alert,
            WeeklyCashFlow: weeklyPoints,
            MonthlyCashFlow: monthlyPoints
        );
    }
}
