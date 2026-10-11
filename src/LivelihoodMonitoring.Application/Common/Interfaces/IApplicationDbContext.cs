using Microsoft.EntityFrameworkCore;
using LivelihoodMonitoring.Domain.Entities;

namespace LivelihoodMonitoring.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<BeneficiaryProfile> BeneficiaryProfiles { get; }
    DbSet<BusinessTransaction> BusinessTransactions { get; }
    DbSet<CaseNote> CaseNotes { get; }
    DbSet<BusinessGoal> BusinessGoals { get; }
    DbSet<BeneficiaryTraining> BeneficiaryTrainings { get; }
    DbSet<LearningResource> LearningResources { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}