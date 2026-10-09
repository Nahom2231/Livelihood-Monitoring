using LivelihoodMonitoring.Domain.Common;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Domain.Entities;

public class BusinessTransaction : BaseAuditableEntity
{
    public Guid BeneficiaryProfileId { get; set; }
    public BeneficiaryProfile BeneficiaryProfile { get; set; } = null!;
    
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime OccurredAtUtc { get; set; }
    
    // Offline sync tracking
    public Guid ClientSyncId { get; set; }
}