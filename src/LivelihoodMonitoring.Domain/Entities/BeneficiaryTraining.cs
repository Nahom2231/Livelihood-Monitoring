using LivelihoodMonitoring.Domain.Common;

namespace LivelihoodMonitoring.Domain.Entities;

public class BeneficiaryTraining : BaseAuditableEntity
{
    public Guid BeneficiaryProfileId { get; set; }
    public BeneficiaryProfile BeneficiaryProfile { get; set; } = null!;

    public string TrainingTitle { get; set; } = string.Empty;
    public string VocationalSector { get; set; } = string.Empty;
    public string TrainerOrInstitution { get; set; } = string.Empty;
    public DateTime CompletedDateUtc { get; set; } = DateTime.UtcNow;
    public string Notes { get; set; } = string.Empty;
}
