using Microsoft.EntityFrameworkCore;
using LivelihoodMonitoring.Application.Common.Interfaces;
using LivelihoodMonitoring.Domain.Entities;

namespace LivelihoodMonitoring.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<BeneficiaryProfile> BeneficiaryProfiles => Set<BeneficiaryProfile>();
    public DbSet<BusinessTransaction> BusinessTransactions => Set<BusinessTransaction>();
    public DbSet<CaseNote> CaseNotes => Set<CaseNote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<BeneficiaryProfile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SeedCapitalAmount).HasPrecision(18, 2);
            entity.HasIndex(e => e.BranchCode);
        });

        modelBuilder.Entity<BusinessTransaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.HasIndex(e => e.ClientSyncId).IsUnique();
            entity.HasIndex(e => e.BeneficiaryProfileId);

            entity.HasOne(e => e.BeneficiaryProfile)
                  .WithMany(b => b.Transactions)
                  .HasForeignKey(e => e.BeneficiaryProfileId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CaseNote>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.BeneficiaryProfile)
                  .WithMany(b => b.CaseNotes)
                  .HasForeignKey(e => e.BeneficiaryProfileId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}