using MediatR;
using Microsoft.EntityFrameworkCore;
using LivelihoodMonitoring.Application.Common.Interfaces;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Application.Transactions.Queries;

public record GetTransactionsByBeneficiaryQuery(
    Guid BeneficiaryProfileId,
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    TransactionType? Type = null
) : IRequest<BeneficiaryTransactionListDto>;

public record BeneficiaryTransactionItemDto(
    Guid Id,
    Guid ClientSyncId,
    TransactionType Type,
    decimal Amount,
    string Description,
    DateTime OccurredAtUtc
);

public record BeneficiaryTransactionListDto(
    Guid BeneficiaryProfileId,
    decimal TotalSales,
    decimal TotalExpenses,
    decimal TotalSavings,
    decimal NetProfit,
    int TotalCount,
    List<BeneficiaryTransactionItemDto> Transactions
);

public class GetTransactionsByBeneficiaryQueryHandler : IRequestHandler<GetTransactionsByBeneficiaryQuery, BeneficiaryTransactionListDto>
{
    private readonly IApplicationDbContext _context;

    public GetTransactionsByBeneficiaryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BeneficiaryTransactionListDto> Handle(GetTransactionsByBeneficiaryQuery request, CancellationToken cancellationToken)
    {
        var query = _context.BusinessTransactions
            .AsNoTracking()
            .Where(t => t.BeneficiaryProfileId == request.BeneficiaryProfileId && !t.IsDeleted);

        if (request.StartDate.HasValue)
        {
            query = query.Where(t => t.OccurredAtUtc >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            query = query.Where(t => t.OccurredAtUtc <= request.EndDate.Value);
        }

        if (request.Type.HasValue)
        {
            query = query.Where(t => t.Type == request.Type.Value);
        }

        var items = await query
            .OrderByDescending(t => t.OccurredAtUtc)
            .Select(t => new BeneficiaryTransactionItemDto(
                t.Id,
                t.ClientSyncId,
                t.Type,
                t.Amount,
                t.Description,
                t.OccurredAtUtc
            ))
            .ToListAsync(cancellationToken);

        var totalSales = items.Where(t => t.Type == TransactionType.Sale).Sum(t => t.Amount);
        var totalExpenses = items.Where(t => t.Type == TransactionType.OperationalExpense || t.Type == TransactionType.InventoryPurchase).Sum(t => t.Amount);
        var totalSavings = items.Where(t => t.Type == TransactionType.SavingsContribution).Sum(t => t.Amount);

        return new BeneficiaryTransactionListDto(
            BeneficiaryProfileId: request.BeneficiaryProfileId,
            TotalSales: totalSales,
            TotalExpenses: totalExpenses,
            TotalSavings: totalSavings,
            NetProfit: totalSales - totalExpenses,
            TotalCount: items.Count,
            Transactions: items
        );
    }
}
