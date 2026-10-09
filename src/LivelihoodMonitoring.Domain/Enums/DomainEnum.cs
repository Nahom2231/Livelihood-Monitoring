namespace LivelihoodMonitoring.Domain.Enums;

public enum UserRole
{
    Beneficiary,
    SocialWorker,
    BranchCoordinator,
    HeadOfficeMAndE,
    Admin
}

public enum TransactionType
{
    Sale,
    OperationalExpense,
    InventoryPurchase,
    SavingsContribution
}

public enum BusinessStatus
{
    Active,
    Underperforming,
    AtRisk,
    Dormant
}