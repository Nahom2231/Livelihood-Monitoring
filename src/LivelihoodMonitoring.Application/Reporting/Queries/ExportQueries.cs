using System.Text;
using MediatR;
using Microsoft.EntityFrameworkCore;
using LivelihoodMonitoring.Application.Common.Interfaces;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Application.Reporting.Queries;

public record ExportBeneficiariesCsvQuery(string? BranchCode = null, string? Region = null) : IRequest<byte[]>;

public record ExportTransactionsCsvQuery(Guid? BeneficiaryProfileId = null, string? BranchCode = null) : IRequest<byte[]>;

public class ExportQueriesHandler :
    IRequestHandler<ExportBeneficiariesCsvQuery, byte[]>,
    IRequestHandler<ExportTransactionsCsvQuery, byte[]>
{
    private readonly IApplicationDbContext _context;

    public ExportQueriesHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<byte[]> Handle(ExportBeneficiariesCsvQuery request, CancellationToken cancellationToken)
    {
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

        var list = await query
            .Select(b => new
            {
                b.Id,
                b.FullName,
                b.PhoneNumber,
                BeneficiaryType = b.BeneficiaryType.ToString(),
                b.BusinessName,
                b.BranchCode,
                b.Region,
                b.Cluster,
                b.PartnerOrganization,
                b.LivelihoodSector,
                b.SeedCapitalAmount,
                b.SeedCapitalDisbursedDate,
                Status = b.Status.ToString(),
                Sales = b.Transactions.Where(t => t.Type == TransactionType.Sale && !t.IsDeleted).Sum(t => (decimal?)t.Amount) ?? 0m,
                Expenses = b.Transactions.Where(t => (t.Type == TransactionType.OperationalExpense || t.Type == TransactionType.InventoryPurchase) && !t.IsDeleted).Sum(t => (decimal?)t.Amount) ?? 0m,
                Savings = b.Transactions.Where(t => t.Type == TransactionType.SavingsContribution && !t.IsDeleted).Sum(t => (decimal?)t.Amount) ?? 0m,
                Transactions = b.Transactions.Count(t => !t.IsDeleted)
            })
            .ToListAsync(cancellationToken);

        var sb = new StringBuilder();
        sb.AppendLine("BeneficiaryId,FullName,PhoneNumber,BeneficiaryType,BusinessName,BranchCode,Region,Cluster,PartnerOrganization,Sector,SeedCapital,DisbursedDate,Status,TotalSales,TotalExpenses,NetProfit,TotalSavings,TransactionCount");

        foreach (var item in list)
        {
            var netProfit = item.Sales - item.Expenses;
            sb.AppendLine($"\"{item.Id}\",\"{Escape(item.FullName)}\",\"{Escape(item.PhoneNumber)}\",\"{item.BeneficiaryType}\",\"{Escape(item.BusinessName)}\",\"{item.BranchCode}\",\"{Escape(item.Region)}\",\"{Escape(item.Cluster)}\",\"{Escape(item.PartnerOrganization)}\",\"{Escape(item.LivelihoodSector)}\",{item.SeedCapitalAmount},{item.SeedCapitalDisbursedDate:yyyy-MM-dd},\"{item.Status}\",{item.Sales},{item.Expenses},{netProfit},{item.Savings},{item.Transactions}");
        }

        return Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
    }

    public async Task<byte[]> Handle(ExportTransactionsCsvQuery request, CancellationToken cancellationToken)
    {
        var query = _context.BusinessTransactions
            .AsNoTracking()
            .Include(t => t.BeneficiaryProfile)
            .Where(t => !t.IsDeleted);

        if (request.BeneficiaryProfileId.HasValue)
        {
            query = query.Where(t => t.BeneficiaryProfileId == request.BeneficiaryProfileId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.BranchCode))
        {
            query = query.Where(t => t.BeneficiaryProfile.BranchCode == request.BranchCode);
        }

        var list = await query
            .OrderByDescending(t => t.OccurredAtUtc)
            .Select(t => new
            {
                t.Id,
                t.ClientSyncId,
                t.BeneficiaryProfileId,
                t.BeneficiaryProfile.FullName,
                t.BeneficiaryProfile.BranchCode,
                Type = t.Type.ToString(),
                t.Amount,
                t.Description,
                t.OccurredAtUtc,
                t.SyncedAtUtc
            })
            .ToListAsync(cancellationToken);

        var sb = new StringBuilder();
        sb.AppendLine("TransactionId,ClientSyncId,BeneficiaryId,BeneficiaryName,BranchCode,Type,Amount,Description,OccurredAtUtc,SyncedAtUtc");

        foreach (var item in list)
        {
            sb.AppendLine($"\"{item.Id}\",\"{item.ClientSyncId}\",\"{item.BeneficiaryProfileId}\",\"{Escape(item.FullName)}\",\"{item.BranchCode}\",\"{item.Type}\",{item.Amount},\"{Escape(item.Description)}\",{item.OccurredAtUtc:yyyy-MM-dd HH:mm:ss},{item.SyncedAtUtc:yyyy-MM-dd HH:mm:ss}");
        }

        return Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
    }

    private static string Escape(string? input) => (input ?? string.Empty).Replace("\"", "\"\"");
}
