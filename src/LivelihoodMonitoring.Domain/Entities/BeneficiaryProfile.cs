using LivelihoodMonitoring.Domain.Common;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Domain.Entities;

public class BeneficiaryProfile : BaseAuditableEntity
{
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public BeneficiaryType BeneficiaryType { get; set; } = BeneficiaryType.Youth;
    public string BusinessName { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string Cluster { get; set; } = string.Empty;
    public string PartnerOrganization { get; set; } = string.Empty;
    public string LivelihoodSector { get; set; } = string.Empty; // e.g., Poultry, Tailoring, Retail
    public decimal SeedCapitalAmount { get; set; }
    public DateTime SeedCapitalDisbursedDate { get; set; }
    public BusinessStatus Status { get; set; } = BusinessStatus.Active;

    public ICollection<BusinessTransaction> Transactions { get; set; } = new List<BusinessTransaction>();
    public ICollection<CaseNote> CaseNotes { get; set; } = new List<CaseNote>();
    public ICollection<BusinessGoal> Goals { get; set; } = new List<BusinessGoal>();
    public ICollection<BeneficiaryTraining> Trainings { get; set; } = new List<BeneficiaryTraining>();
}