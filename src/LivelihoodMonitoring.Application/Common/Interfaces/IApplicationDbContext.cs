using Microsoft.EntityFrameworkCore;
using LivelihoodMonitoring.Domain.Entities;

namespace LivelihoodMonitoring.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<BeneficiaryProfile> BeneficiaryProfiles { get; }
    DbSet<BusinessTransaction> BusinessTransactions { get; }
    DbSet<CaseNote> CaseNotes { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}