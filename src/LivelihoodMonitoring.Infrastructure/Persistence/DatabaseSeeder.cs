using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using LivelihoodMonitoring.Application.Common.Interfaces;
using LivelihoodMonitoring.Domain.Entities;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedDatabaseAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        try
        {
            await context.Database.MigrateAsync();

            if (!await context.Users.AnyAsync())
            {
                logger.LogInformation("Seeding initial users and livelihood data...");

                var defaultPass = "Password123!";
                var (hash, salt) = passwordHasher.HashPassword(defaultPass);

                var adminUser = new User
                {
                    Username = "admin",
                    PasswordHash = hash,
                    PasswordSalt = salt,
                    FullName = "System Administrator",
                    PhoneNumber = "+251911000001",
                    Role = UserRole.Admin,
                    BranchCode = "HO-001"
                };

                var mneUser = new User
                {
                    Username = "headoffice_mne",
                    PasswordHash = hash,
                    PasswordSalt = salt,
                    FullName = "ABC Head Office M&E Lead",
                    PhoneNumber = "+251911000002",
                    Role = UserRole.HeadOfficeMAndE,
                    BranchCode = "HO-001"
                };

                var coordinator = new User
                {
                    Username = "branch_coord_1",
                    PasswordHash = hash,
                    PasswordSalt = salt,
                    FullName = "Addis Branch Coordinator",
                    PhoneNumber = "+251911000003",
                    Role = UserRole.BranchCoordinator,
                    BranchCode = "BR-AA-01"
                };

                var socialWorker = new User
                {
                    Username = "social_worker_1",
                    PasswordHash = hash,
                    PasswordSalt = salt,
                    FullName = "Almaz Tadesse (Social Worker)",
                    PhoneNumber = "+251911000004",
                    Role = UserRole.SocialWorker,
                    BranchCode = "BR-AA-01"
                };

                var benUser1 = new User
                {
                    Username = "ben_abebe",
                    PasswordHash = hash,
                    PasswordSalt = salt,
                    FullName = "Abebe Kebede",
                    PhoneNumber = "+251922000010",
                    Role = UserRole.Beneficiary,
                    BranchCode = "BR-AA-01"
                };

                var benUser2 = new User
                {
                    Username = "ben_fatima",
                    PasswordHash = hash,
                    PasswordSalt = salt,
                    FullName = "Fatima Mohammed",
                    PhoneNumber = "+251922000020",
                    Role = UserRole.Beneficiary,
                    BranchCode = "BR-DR-02"
                };

                var benUser3 = new User
                {
                    Username = "ben_chala",
                    PasswordHash = hash,
                    PasswordSalt = salt,
                    FullName = "Chala Tolessa",
                    PhoneNumber = "+251922000030",
                    Role = UserRole.Beneficiary,
                    BranchCode = "BR-OR-03"
                };

                context.Users.AddRange(adminUser, mneUser, coordinator, socialWorker, benUser1, benUser2, benUser3);
                await context.SaveChangesAsync(CancellationToken.None);

                // Seed Beneficiary Profiles
                var ben1Profile = new BeneficiaryProfile
                {
                    UserId = benUser1.Id.ToString(),
                    FullName = benUser1.FullName,
                    PhoneNumber = benUser1.PhoneNumber,
                    BeneficiaryType = BeneficiaryType.Youth,
                    BusinessName = "Abebe Custom Tailoring & Embroidery",
                    BranchCode = "BR-AA-01",
                    Region = "Addis Ababa",
                    Cluster = "Central",
                    PartnerOrganization = "XYZ Community Care",
                    LivelihoodSector = "Tailoring",
                    SeedCapitalAmount = 25000m,
                    SeedCapitalDisbursedDate = DateTime.UtcNow.AddMonths(-4),
                    Status = BusinessStatus.Active
                };

                var ben2Profile = new BeneficiaryProfile
                {
                    UserId = benUser2.Id.ToString(),
                    FullName = benUser2.FullName,
                    PhoneNumber = benUser2.PhoneNumber,
                    BeneficiaryType = BeneficiaryType.Caregiver,
                    BusinessName = "Fatima Urban Poultry Farm",
                    BranchCode = "BR-DR-02",
                    Region = "Dire Dawa",
                    Cluster = "Eastern",
                    PartnerOrganization = "ABC Caregiver Empowerment",
                    LivelihoodSector = "Poultry",
                    SeedCapitalAmount = 30000m,
                    SeedCapitalDisbursedDate = DateTime.UtcNow.AddMonths(-3),
                    Status = BusinessStatus.Active
                };

                var ben3Profile = new BeneficiaryProfile
                {
                    UserId = benUser3.Id.ToString(),
                    FullName = benUser3.FullName,
                    PhoneNumber = benUser3.PhoneNumber,
                    BeneficiaryType = BeneficiaryType.VocationalGraduate,
                    BusinessName = "Chala Retail & Corner Shop",
                    BranchCode = "BR-OR-03",
                    Region = "Oromia",
                    Cluster = "South-Central",
                    PartnerOrganization = "Youth Future Initiative",
                    LivelihoodSector = "Retail",
                    SeedCapitalAmount = 20000m,
                    SeedCapitalDisbursedDate = DateTime.UtcNow.AddMonths(-2),
                    Status = BusinessStatus.Underperforming
                };

                context.BeneficiaryProfiles.AddRange(ben1Profile, ben2Profile, ben3Profile);
                await context.SaveChangesAsync(CancellationToken.None);

                // Seed Transactions for Beneficiary 1 (Tailoring)
                context.BusinessTransactions.AddRange(
                    new BusinessTransaction
                    {
                        BeneficiaryProfileId = ben1Profile.Id,
                        Type = TransactionType.InventoryPurchase,
                        Amount = 10000m,
                        Description = "Purchased sewing machine and basic fabrics",
                        OccurredAtUtc = DateTime.UtcNow.AddMonths(-3),
                        ClientSyncId = Guid.NewGuid()
                    },
                    new BusinessTransaction
                    {
                        BeneficiaryProfileId = ben1Profile.Id,
                        Type = TransactionType.Sale,
                        Amount = 4500m,
                        Description = "Uniform tailoring for local school",
                        OccurredAtUtc = DateTime.UtcNow.AddMonths(-2),
                        ClientSyncId = Guid.NewGuid()
                    },
                    new BusinessTransaction
                    {
                        BeneficiaryProfileId = ben1Profile.Id,
                        Type = TransactionType.Sale,
                        Amount = 6200m,
                        Description = "Traditional dresses stitched for festival",
                        OccurredAtUtc = DateTime.UtcNow.AddMonths(-1),
                        ClientSyncId = Guid.NewGuid()
                    },
                    new BusinessTransaction
                    {
                        BeneficiaryProfileId = ben1Profile.Id,
                        Type = TransactionType.OperationalExpense,
                        Amount = 800m,
                        Description = "Electricity bill and machine oil lubrication",
                        OccurredAtUtc = DateTime.UtcNow.AddDays(-15),
                        ClientSyncId = Guid.NewGuid()
                    },
                    new BusinessTransaction
                    {
                        BeneficiaryProfileId = ben1Profile.Id,
                        Type = TransactionType.Sale,
                        Amount = 7800m,
                        Description = "Custom holiday suits",
                        OccurredAtUtc = DateTime.UtcNow.AddDays(-5),
                        ClientSyncId = Guid.NewGuid()
                    },
                    new BusinessTransaction
                    {
                        BeneficiaryProfileId = ben1Profile.Id,
                        Type = TransactionType.SavingsContribution,
                        Amount = 2000m,
                        Description = "Monthly Iddir and bank savings deposit",
                        OccurredAtUtc = DateTime.UtcNow.AddDays(-3),
                        ClientSyncId = Guid.NewGuid()
                    }
                );

                // Seed Transactions for Beneficiary 2 (Poultry)
                context.BusinessTransactions.AddRange(
                    new BusinessTransaction
                    {
                        BeneficiaryProfileId = ben2Profile.Id,
                        Type = TransactionType.InventoryPurchase,
                        Amount = 15000m,
                        Description = "Purchased 100 day-old chicks and starter feeders",
                        OccurredAtUtc = DateTime.UtcNow.AddMonths(-2),
                        ClientSyncId = Guid.NewGuid()
                    },
                    new BusinessTransaction
                    {
                        BeneficiaryProfileId = ben2Profile.Id,
                        Type = TransactionType.OperationalExpense,
                        Amount = 3500m,
                        Description = "Poultry feed and Newcastle vaccines",
                        OccurredAtUtc = DateTime.UtcNow.AddMonths(-1),
                        ClientSyncId = Guid.NewGuid()
                    },
                    new BusinessTransaction
                    {
                        BeneficiaryProfileId = ben2Profile.Id,
                        Type = TransactionType.Sale,
                        Amount = 14000m,
                        Description = "Sold 70 mature chickens to local restaurant",
                        OccurredAtUtc = DateTime.UtcNow.AddDays(-10),
                        ClientSyncId = Guid.NewGuid()
                    },
                    new BusinessTransaction
                    {
                        BeneficiaryProfileId = ben2Profile.Id,
                        Type = TransactionType.SavingsContribution,
                        Amount = 3000m,
                        Description = "Bank savings deposit for next flock expansion",
                        OccurredAtUtc = DateTime.UtcNow.AddDays(-2),
                        ClientSyncId = Guid.NewGuid()
                    }
                );

                // Seed Goals for Beneficiary 1
                context.BusinessGoals.AddRange(
                    new BusinessGoal
                    {
                        BeneficiaryProfileId = ben1Profile.Id,
                        Title = "Purchase Overlock Sewing Machine",
                        Description = "Save up to buy an overlock industrial stitching machine",
                        Type = GoalType.GoalSetting,
                        TargetAmount = 15000m,
                        CurrentAmount = 5000m,
                        TargetDateUtc = DateTime.UtcNow.AddMonths(3),
                        IsAchieved = false
                    },
                    new BusinessGoal
                    {
                        BeneficiaryProfileId = ben1Profile.Id,
                        Title = "Emergency Business Reserve",
                        Description = "Emergency savings in branch credit union",
                        Type = GoalType.SavingsTarget,
                        TargetAmount = 6000m,
                        CurrentAmount = 2000m,
                        TargetDateUtc = DateTime.UtcNow.AddMonths(2),
                        IsAchieved = false
                    }
                );

                // Seed Case Note
                context.CaseNotes.Add(new CaseNote
                {
                    BeneficiaryProfileId = ben1Profile.Id,
                    StaffId = socialWorker.Id.ToString(),
                    StaffName = socialWorker.FullName,
                    VisitDateUtc = DateTime.UtcNow.AddDays(-14),
                    VisitFindings = "Beneficiary has established loyal clients. Shop is clean and bookkeeping is maintained regularly.",
                    Recommendations = "Encouraged beneficiary to diversify into embroidery designs to increase profit margin.",
                    FollowUpRequired = true,
                    NextFollowUpDateUtc = DateTime.UtcNow.AddDays(16)
                });

                // Seed Beneficiary Training
                context.BeneficiaryTrainings.Add(new BeneficiaryTraining
                {
                    BeneficiaryProfileId = ben1Profile.Id,
                    TrainingTitle = "Vocational Tailoring & Garment Construction Level 2",
                    VocationalSector = "Tailoring",
                    TrainerOrInstitution = "ABC National Vocational Center",
                    CompletedDateUtc = DateTime.UtcNow.AddMonths(-5),
                    Notes = "Passed certificate of competency with honors."
                });

                // Seed Learning Resources (Multi-language & Sector-specific)
                context.LearningResources.AddRange(
                    new LearningResource
                    {
                        Title = "Understanding Cash Flow vs. Profit",
                        Content = "Cash flow is the physical money coming into and going out of your business every day. Profit is what remains after subtracting all costs from your total revenue. Even a profitable business can fail if cash runs out before sales are collected!",
                        Category = LearningCategory.FinancialLiteracy,
                        Sector = "All",
                        Language = "en"
                    },
                    new LearningResource
                    {
                        Title = "የገንዘብ ፍሰት እና ትርፍ ልዩነት (Cash Flow vs Profit)",
                        Content = "የገንዘብ ፍሰት ማለት በየዕለቱ ወደ ንግድዎ የሚገባው እና የሚወጣው ጥሬ ገንዘብ ነው። ትርፍ ደግሞ ወጪዎች ተቀናንሰው የሚቀረው ነው። ሁልጊዜም የዕለት ተዕለት ገቢና ወጪዎን በትክክል ይመዝግቡ።",
                        Category = LearningCategory.FinancialLiteracy,
                        Sector = "All",
                        Language = "am"
                    },
                    new LearningResource
                    {
                        Title = "Garaagarummaa Yaa'a Maallaqaa fi Bu'aa (Cash Flow vs Profit)",
                        Content = "Yaa'i maallaqaa maallaqa guyyaa guyyaan daldala keessan keessa galuu fi bahuudha. Bu'aan ammoo erga baasiin hundi hir'ifamee booda kan hafuudha. Yeroo hunda galii fi baasii guyyaa guyyaan galmeessaa.",
                        Category = LearningCategory.FinancialLiteracy,
                        Sector = "All",
                        Language = "om"
                    },
                    new LearningResource
                    {
                        Title = "ፍልልይ ዋሕዚ ገንዘብን መኽሰብን (Cash Flow vs Profit)",
                        Content = "ዋሕዚ ገንዘብ ማለት መዓልታዊ ናብ ንግድኹም ዝኣቱን ዝወጽእን ጥረ ገንዘብ እዩ። መኽሰብ ድማ ድሕሪ ኩሉ ወጻኢታት ምቕናስ ዝተርፍ እዩ። ኩሉ ግዜ መዓልታዊ ኣታውን ወጻእን ብግቡእ መዝግቡ።",
                        Category = LearningCategory.FinancialLiteracy,
                        Sector = "All",
                        Language = "ti"
                    },
                    new LearningResource
                    {
                        Title = "Managing Stock & Preventing Inventory Loss",
                        Content = "1. Always record every batch of goods bought. 2. Track fast-moving vs slow-moving items. 3. Reorder before running out to never lose paying customers.",
                        Category = LearningCategory.BusinessManagement,
                        Sector = "Retail",
                        Language = "en"
                    },
                    new LearningResource
                    {
                        Title = "To'annoo Meeshaalee fi Qisaasama Ittisuu (Stock Controls)",
                        Content = "1. Meeshaalee bitaman hunda galmeessaa. 2. Meeshaalee dafanii gurguraman adda baasaa. 3. Meeshaan dhumachuun dura yeroon ajajaa.",
                        Category = LearningCategory.BusinessManagement,
                        Sector = "Retail",
                        Language = "om"
                    },
                    new LearningResource
                    {
                        Title = "ምምሕዳር ንብረትን ምክልኻል ክሳራን (Stock Controls)",
                        Content = "1. ዝተዓደገ ኩሉ ሸቐጥ ብግቡእ ምዝጋቡ። 2. ቀልጢፉ ዝሽየጥ ንብረት ፍለዩ። 3. እቲ ኣቑሑት ከይተወድአ ኣቐዲምኩም ኣዘዙ።",
                        Category = LearningCategory.BusinessManagement,
                        Sector = "Retail",
                        Language = "ti"
                    },
                    new LearningResource
                    {
                        Title = "Poultry Disease Prevention & Feeding Tips",
                        Content = "Vaccinate chicks on schedule against Newcastle disease. Keep the coop dry and well-ventilated. Measure daily feed strictly according to the bird age to minimize wastage.",
                        Category = LearningCategory.VocationalGuidance,
                        Sector = "Poultry",
                        Language = "en"
                    }
                );

                await context.SaveChangesAsync(CancellationToken.None);
                logger.LogInformation("Database seeded successfully with default users and test livelihoods data.");
            }

            // Ensure multilingual resources exist for existing databases as well
            if (!await context.LearningResources.AnyAsync(r => r.Language == "om"))
            {
                context.LearningResources.AddRange(
                    new LearningResource
                    {
                        Title = "Garaagarummaa Yaa'a Maallaqaa fi Bu'aa (Cash Flow vs Profit)",
                        Content = "Yaa'i maallaqaa maallaqa guyyaa guyyaan daldala keessan keessa galuu fi bahuudha. Bu'aan ammoo erga baasiin hundi hir'ifamee booda kan hafuudha. Yeroo hunda galii fi baasii guyyaa guyyaan galmeessaa.",
                        Category = LearningCategory.FinancialLiteracy,
                        Sector = "All",
                        Language = "om"
                    },
                    new LearningResource
                    {
                        Title = "To'annoo Meeshaalee fi Qisaasama Ittisuu (Stock Controls)",
                        Content = "1. Meeshaalee bitaman hunda galmeessaa. 2. Meeshaalee dafanii gurguraman adda baasaa. 3. Meeshaan dhumachuun dura yeroon ajajaa.",
                        Category = LearningCategory.BusinessManagement,
                        Sector = "Retail",
                        Language = "om"
                    },
                    new LearningResource
                    {
                        Title = "ፍልልይ ዋሕዚ ገንዘብን መኽሰብን (Cash Flow vs Profit)",
                        Content = "ዋሕዚ ገንዘብ ማለት መዓልታዊ ናብ ንግድኹም ዝኣቱን ዝወጽእን ጥረ ገንዘብ እዩ። መኽሰብ ድማ ድሕሪ ኩሉ ወጻኢታት ምቕናስ ዝተርፍ እዩ። ኩሉ ግዜ መዓልታዊ ኣታውን ወጻእን ብግቡእ መዝግቡ።",
                        Category = LearningCategory.FinancialLiteracy,
                        Sector = "All",
                        Language = "ti"
                    },
                    new LearningResource
                    {
                        Title = "ምምሕዳር ንብረትን ምክልኻል ክሳራን (Stock Controls)",
                        Content = "1. ዝተዓደገ ኩሉ ሸቐጥ ብግቡእ ምዝጋቡ። 2. ቀልጢፉ ዝሽየጥ ንብረት ፍለዩ። 3. እቲ ኣቑሑት ከይተወድአ ኣቐዲምኩም ኣዘዙ።",
                        Category = LearningCategory.BusinessManagement,
                        Sector = "Retail",
                        Language = "ti"
                    }
                );
                await context.SaveChangesAsync(CancellationToken.None);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }
}
