namespace LivelihoodMonitoring.Domain.Enums;

public enum UserRole
{
    Beneficiary,
    SocialWorker,
    BranchCoordinator,
    HeadOfficeMAndE,
    Admin
}

public enum BeneficiaryType
{
    Youth,
    Caregiver,
    VocationalGraduate,
    SmallBusinessStarter
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

public enum GoalType
{
    GoalSetting,
    SimpleBudget,
    SavingsTarget
}

public enum LearningCategory
{
    FinancialLiteracy,
    BusinessManagement,
    VocationalGuidance
}