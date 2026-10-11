using LivelihoodMonitoring.Domain.Common;

namespace LivelihoodMonitoring.Domain.Entities;

public class CaseNote : BaseAuditableEntity
{
    public Guid BeneficiaryProfileId { get; set; }
    public BeneficiaryProfile BeneficiaryProfile { get; set; } = null!;
    
    public string StaffId { get; set; } = string.Empty;
    public string StaffName { get; set; } = string.Empty;
    public DateTime VisitDateUtc { get; set; } = DateTime.UtcNow;
    public string VisitFindings { get; set; } = string.Empty;
    public string Recommendations { get; set; } = string.Empty;
    public bool FollowUpRequired { get; set; }
    public DateTime? NextFollowUpDateUtc { get; set; }
}