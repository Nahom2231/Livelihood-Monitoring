using Microsoft.EntityFrameworkCore;
using LivelihoodMonitoring.Application.Common.Interfaces;
using LivelihoodMonitoring.Domain.Entities;

namespace LivelihoodMonitoring.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<BeneficiaryProfile> BeneficiaryProfiles => Set<BeneficiaryProfile>();
    public DbSet<BusinessTransaction> BusinessTransactions => Set<BusinessTransaction>();
    public DbSet<CaseNote> CaseNotes => Set<CaseNote>();
    public DbSet<BusinessGoal> BusinessGoals => Set<BusinessGoal>();
    public DbSet<BeneficiaryTraining> BeneficiaryTrainings => Set<BeneficiaryTraining>();
    public DbSet<LearningResource> LearningResources => Set<LearningResource>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
        });

        modelBuilder.Entity<BeneficiaryProfile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SeedCapitalAmount).HasPrecision(18, 2);
            entity.HasIndex(e => e.BranchCode);
            entity.HasIndex(e => e.Region);
            entity.HasIndex(e => e.Cluster);
            entity.HasIndex(e => e.PartnerOrganization);
            entity.HasIndex(e => e.UserId);
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

        modelBuilder.Entity<BusinessGoal>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TargetAmount).HasPrecision(18, 2);
            entity.Property(e => e.CurrentAmount).HasPrecision(18, 2);
            entity.HasOne(e => e.BeneficiaryProfile)
                  .WithMany(b => b.Goals)
                  .HasForeignKey(e => e.BeneficiaryProfileId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BeneficiaryTraining>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.BeneficiaryProfile)
                  .WithMany(b => b.Trainings)
                  .HasForeignKey(e => e.BeneficiaryProfileId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LearningResource>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Language);
            entity.HasIndex(e => e.Category);
        });
    }
}