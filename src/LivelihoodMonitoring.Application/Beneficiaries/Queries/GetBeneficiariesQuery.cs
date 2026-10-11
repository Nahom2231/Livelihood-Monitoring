using MediatR;
using Microsoft.EntityFrameworkCore;
using LivelihoodMonitoring.Application.Common.Interfaces;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Application.Beneficiaries.Queries;

public record GetBeneficiariesQuery(
    string? Search = null,
    string? BranchCode = null,
    string? Region = null,
    string? Cluster = null,
    string? Sector = null,
    BusinessStatus? Status = null,
    BeneficiaryType? BeneficiaryType = null
) : IRequest<List<BeneficiaryListItemDto>>;

public record BeneficiaryListItemDto(
    Guid Id,
    string UserId,
    string FullName,
    string PhoneNumber,
    string BeneficiaryType,
    string BusinessName,
    string BranchCode,
    string Region,
    string Cluster,
    string PartnerOrganization,
    string LivelihoodSector,
    decimal SeedCapitalAmount,
    DateTime SeedCapitalDisbursedDate,
    string Status,
    decimal TotalSales,
    decimal TotalExpenses,
    decimal NetProfit,
    int TotalTransactions
);

public record GetBeneficiaryByIdQuery(Guid Id) : IRequest<BeneficiaryListItemDto?>;

public class GetBeneficiariesQueryHandler : 
    IRequestHandler<GetBeneficiariesQuery, List<BeneficiaryListItemDto>>,
    IRequestHandler<GetBeneficiaryByIdQuery, BeneficiaryListItemDto?>
{
    private readonly IApplicationDbContext _context;

    public GetBeneficiariesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BeneficiaryListItemDto>> Handle(GetBeneficiariesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.BeneficiaryProfiles
            .AsNoTracking()
            .Where(b => !b.IsDeleted);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(b => b.FullName.ToLower().Contains(search) || b.BusinessName.ToLower().Contains(search) || b.PhoneNumber.Contains(search));
        }

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

        if (!string.IsNullOrWhiteSpace(request.Sector))
        {
            query = query.Where(b => b.LivelihoodSector == request.Sector);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(b => b.Status == request.Status.Value);
        }

        if (request.BeneficiaryType.HasValue)
        {
            query = query.Where(b => b.BeneficiaryType == request.BeneficiaryType.Value);
        }

        var result = await query
            .OrderByDescending(b => b.SeedCapitalDisbursedDate)
            .Select(b => new BeneficiaryListItemDto(
                b.Id,
                b.UserId,
                b.FullName,
                b.PhoneNumber,
                b.BeneficiaryType.ToString(),
                b.BusinessName,
                b.BranchCode,
                b.Region,
                b.Cluster,
                b.PartnerOrganization,
                b.LivelihoodSector,
                b.SeedCapitalAmount,
                b.SeedCapitalDisbursedDate,
                b.Status.ToString(),
                b.Transactions.Where(t => t.Type == TransactionType.Sale && !t.IsDeleted).Sum(t => (decimal?)t.Amount) ?? 0m,
                b.Transactions.Where(t => (t.Type == TransactionType.OperationalExpense || t.Type == TransactionType.InventoryPurchase) && !t.IsDeleted).Sum(t => (decimal?)t.Amount) ?? 0m,
                (b.Transactions.Where(t => t.Type == TransactionType.Sale && !t.IsDeleted).Sum(t => (decimal?)t.Amount) ?? 0m) -
                (b.Transactions.Where(t => (t.Type == TransactionType.OperationalExpense || t.Type == TransactionType.InventoryPurchase) && !t.IsDeleted).Sum(t => (decimal?)t.Amount) ?? 0m),
                b.Transactions.Count(t => !t.IsDeleted)
            ))
            .ToListAsync(cancellationToken);

        return result;
    }

    public async Task<BeneficiaryListItemDto?> Handle(GetBeneficiaryByIdQuery request, CancellationToken cancellationToken)
    {
        var item = await _context.BeneficiaryProfiles
            .AsNoTracking()
            .Where(b => b.Id == request.Id && !b.IsDeleted)
            .Select(b => new BeneficiaryListItemDto(
                b.Id,
                b.UserId,
                b.FullName,
                b.PhoneNumber,
                b.BeneficiaryType.ToString(),
                b.BusinessName,
                b.BranchCode,
                b.Region,
                b.Cluster,
                b.PartnerOrganization,
                b.LivelihoodSector,
                b.SeedCapitalAmount,
                b.SeedCapitalDisbursedDate,
                b.Status.ToString(),
                b.Transactions.Where(t => t.Type == TransactionType.Sale && !t.IsDeleted).Sum(t => (decimal?)t.Amount) ?? 0m,
                b.Transactions.Where(t => (t.Type == TransactionType.OperationalExpense || t.Type == TransactionType.InventoryPurchase) && !t.IsDeleted).Sum(t => (decimal?)t.Amount) ?? 0m,
                (b.Transactions.Where(t => t.Type == TransactionType.Sale && !t.IsDeleted).Sum(t => (decimal?)t.Amount) ?? 0m) -
                (b.Transactions.Where(t => (t.Type == TransactionType.OperationalExpense || t.Type == TransactionType.InventoryPurchase) && !t.IsDeleted).Sum(t => (decimal?)t.Amount) ?? 0m),
                b.Transactions.Count(t => !t.IsDeleted)
            ))
            .FirstOrDefaultAsync(cancellationToken);

        return item;
    }
}
