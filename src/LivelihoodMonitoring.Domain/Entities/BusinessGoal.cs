using LivelihoodMonitoring.Domain.Common;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Domain.Entities;

public class BusinessGoal : BaseAuditableEntity
{
    public Guid BeneficiaryProfileId { get; set; }
    public BeneficiaryProfile BeneficiaryProfile { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public GoalType Type { get; set; } = GoalType.GoalSetting;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public DateTime? TargetDateUtc { get; set; }
    public bool IsAchieved { get; set; }
}
