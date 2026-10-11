using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LivelihoodMonitoring.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLivelihoodEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "NextFollowUpDateUtc",
                table: "CaseNotes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StaffName",
                table: "CaseNotes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "VisitDateUtc",
                table: "CaseNotes",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "BeneficiaryType",
                table: "BeneficiaryProfiles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "BusinessName",
                table: "BeneficiaryProfiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Cluster",
                table: "BeneficiaryProfiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PartnerOrganization",
                table: "BeneficiaryProfiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Region",
                table: "BeneficiaryProfiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "BeneficiaryTrainings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BeneficiaryProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    TrainingTitle = table.Column<string>(type: "text", nullable: false),
                    VocationalSector = table.Column<string>(type: "text", nullable: false),
                    TrainerOrInstitution = table.Column<string>(type: "text", nullable: false),
                    CompletedDateUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    SyncedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BeneficiaryTrainings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BeneficiaryTrainings_BeneficiaryProfiles_BeneficiaryProfile~",
                        column: x => x.BeneficiaryProfileId,
                        principalTable: "BeneficiaryProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BusinessGoals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BeneficiaryProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    TargetAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CurrentAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TargetDateUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsAchieved = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    SyncedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BusinessGoals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BusinessGoals_BeneficiaryProfiles_BeneficiaryProfileId",
                        column: x => x.BeneficiaryProfileId,
                        principalTable: "BeneficiaryProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LearningResources",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    Sector = table.Column<string>(type: "text", nullable: false),
                    Language = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    SyncedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningResources", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    PasswordSalt = table.Column<string>(type: "text", nullable: false),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    PhoneNumber = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    BranchCode = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    SyncedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BeneficiaryProfiles_Cluster",
                table: "BeneficiaryProfiles",
                column: "Cluster");

            migrationBuilder.CreateIndex(
                name: "IX_BeneficiaryProfiles_PartnerOrganization",
                table: "BeneficiaryProfiles",
                column: "PartnerOrganization");

            migrationBuilder.CreateIndex(
                name: "IX_BeneficiaryProfiles_Region",
                table: "BeneficiaryProfiles",
                column: "Region");

            migrationBuilder.CreateIndex(
                name: "IX_BeneficiaryProfiles_UserId",
                table: "BeneficiaryProfiles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_BeneficiaryTrainings_BeneficiaryProfileId",
                table: "BeneficiaryTrainings",
                column: "BeneficiaryProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_BusinessGoals_BeneficiaryProfileId",
                table: "BusinessGoals",
                column: "BeneficiaryProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_LearningResources_Category",
                table: "LearningResources",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_LearningResources_Language",
                table: "LearningResources",
                column: "Language");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BeneficiaryTrainings");

            migrationBuilder.DropTable(
                name: "BusinessGoals");

            migrationBuilder.DropTable(
                name: "LearningResources");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropIndex(
                name: "IX_BeneficiaryProfiles_Cluster",
                table: "BeneficiaryProfiles");

            migrationBuilder.DropIndex(
                name: "IX_BeneficiaryProfiles_PartnerOrganization",
                table: "BeneficiaryProfiles");

            migrationBuilder.DropIndex(
                name: "IX_BeneficiaryProfiles_Region",
                table: "BeneficiaryProfiles");

            migrationBuilder.DropIndex(
                name: "IX_BeneficiaryProfiles_UserId",
                table: "BeneficiaryProfiles");

            migrationBuilder.DropColumn(
                name: "NextFollowUpDateUtc",
                table: "CaseNotes");

            migrationBuilder.DropColumn(
                name: "StaffName",
                table: "CaseNotes");

            migrationBuilder.DropColumn(
                name: "VisitDateUtc",
                table: "CaseNotes");

            migrationBuilder.DropColumn(
                name: "BeneficiaryType",
                table: "BeneficiaryProfiles");

            migrationBuilder.DropColumn(
                name: "BusinessName",
                table: "BeneficiaryProfiles");

            migrationBuilder.DropColumn(
                name: "Cluster",
                table: "BeneficiaryProfiles");

            migrationBuilder.DropColumn(
                name: "PartnerOrganization",
                table: "BeneficiaryProfiles");

            migrationBuilder.DropColumn(
                name: "Region",
                table: "BeneficiaryProfiles");
        }
    }
}
