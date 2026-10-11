using LivelihoodMonitoring.Domain.Common;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Domain.Entities;

public class LearningResource : BaseAuditableEntity
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public LearningCategory Category { get; set; } = LearningCategory.FinancialLiteracy;
    public string Sector { get; set; } = "All"; // "All", "Poultry", "Tailoring", "Retail", etc.
    public string Language { get; set; } = "en"; // "en", "am", "om", "ti"
}
