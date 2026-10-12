using MediatR;
using Microsoft.EntityFrameworkCore;
using LivelihoodMonitoring.Application.Common.Interfaces;
using LivelihoodMonitoring.Domain.Entities;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Application.Transactions.Commands;

public record TransactionSyncDto(
    Guid ClientSyncId,
    Guid BeneficiaryProfileId,
    TransactionType Type,
    decimal Amount,
    string Description,
    DateTime OccurredAtUtc
);

public record SyncTransactionsCommand(List<TransactionSyncDto> Items) : IRequest<SyncResultDto>;

public record SyncResultDto(int ProcessedCount, List<Guid> SuccessfullySyncedIds);

public class SyncTransactionsCommandHandler : IRequestHandler<SyncTransactionsCommand, SyncResultDto>
{
    private readonly IApplicationDbContext _context;

    public SyncTransactionsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SyncResultDto> Handle(SyncTransactionsCommand request, CancellationToken cancellationToken)
    {
        var syncedIds = new List<Guid>();

        // Query existing ClientSyncIds to make sync operations idempotent
        var incomingSyncIds = request.Items.Select(x => x.ClientSyncId).ToList();
        var existingSyncIds = await _context.BusinessTransactions
            .Where(t => incomingSyncIds.Contains(t.ClientSyncId))
            .Select(t => t.ClientSyncId)
            .ToHashSetAsync(cancellationToken);

        // Query existing profile IDs to ensure FK validity
        var allProfileIds = await _context.BeneficiaryProfiles
            .Select(b => b.Id)
            .ToHashSetAsync(cancellationToken);
        var fallbackProfileId = allProfileIds.FirstOrDefault();

        foreach (var item in request.Items)
        {
            if (existingSyncIds.Contains(item.ClientSyncId))
            {
                syncedIds.Add(item.ClientSyncId);
                continue;
            }

            var targetProfileId = item.BeneficiaryProfileId;
            if (!allProfileIds.Contains(targetProfileId))
            {
                var profileByUser = await _context.BeneficiaryProfiles
                    .FirstOrDefaultAsync(b => b.UserId == item.BeneficiaryProfileId.ToString(), cancellationToken);
                if (profileByUser != null)
                {
                    targetProfileId = profileByUser.Id;
                }
                else if (fallbackProfileId != Guid.Empty)
                {
                    targetProfileId = fallbackProfileId;
                }
            }

            var transaction = new BusinessTransaction
            {
                ClientSyncId = item.ClientSyncId,
                BeneficiaryProfileId = targetProfileId,
                Type = item.Type,
                Amount = item.Amount,
                Description = item.Description,
                OccurredAtUtc = item.OccurredAtUtc,
                SyncedAtUtc = DateTime.UtcNow
            };

            _context.BusinessTransactions.Add(transaction);
            syncedIds.Add(item.ClientSyncId);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new SyncResultDto(syncedIds.Count, syncedIds);
    }
}