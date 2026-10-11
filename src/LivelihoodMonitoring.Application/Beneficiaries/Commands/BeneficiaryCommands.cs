using MediatR;
using Microsoft.EntityFrameworkCore;
using LivelihoodMonitoring.Application.Common.Interfaces;
using LivelihoodMonitoring.Domain.Entities;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Application.Beneficiaries.Commands;

public record CreateBeneficiaryProfileCommand(
    string FullName,
    string PhoneNumber,
    BeneficiaryType BeneficiaryType,
    string BusinessName,
    string BranchCode,
    string Region,
    string Cluster,
    string PartnerOrganization,
    string LivelihoodSector,
    decimal SeedCapitalAmount,
    DateTime SeedCapitalDisbursedDate,
    string? InitialUsername = null,
    string? InitialPassword = null
) : IRequest<BeneficiaryProfileCreatedDto>;

public record BeneficiaryProfileCreatedDto(
    Guid BeneficiaryProfileId,
    string UserId,
    string FullName,
    string PhoneNumber,
    string BusinessName,
    string BranchCode,
    string Sector,
    decimal SeedCapitalAmount
);

public record UpdateBeneficiaryStatusCommand(
    Guid BeneficiaryProfileId,
    BusinessStatus Status
) : IRequest<bool>;

public class BeneficiaryCommandHandler : 
    IRequestHandler<CreateBeneficiaryProfileCommand, BeneficiaryProfileCreatedDto>,
    IRequestHandler<UpdateBeneficiaryStatusCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public BeneficiaryCommandHandler(IApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<BeneficiaryProfileCreatedDto> Handle(CreateBeneficiaryProfileCommand request, CancellationToken cancellationToken)
    {
        string userId;
        var username = request.InitialUsername ?? $"ben_{Guid.NewGuid().ToString()[..6]}";
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == request.PhoneNumber, cancellationToken);

        if (existingUser != null)
        {
            userId = existingUser.Id.ToString();
        }
        else
        {
            var rawPass = request.InitialPassword ?? "Password123!";
            var (hash, salt) = _passwordHasher.HashPassword(rawPass);

            var newUser = new User
            {
                Username = username,
                PasswordHash = hash,
                PasswordSalt = salt,
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                Role = UserRole.Beneficiary,
                BranchCode = request.BranchCode
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync(cancellationToken);
            userId = newUser.Id.ToString();
        }

        var profile = new BeneficiaryProfile
        {
            UserId = userId,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            BeneficiaryType = request.BeneficiaryType,
            BusinessName = request.BusinessName,
            BranchCode = request.BranchCode,
            Region = request.Region,
            Cluster = request.Cluster,
            PartnerOrganization = request.PartnerOrganization,
            LivelihoodSector = request.LivelihoodSector,
            SeedCapitalAmount = request.SeedCapitalAmount,
            SeedCapitalDisbursedDate = request.SeedCapitalDisbursedDate,
            Status = BusinessStatus.Active
        };

        _context.BeneficiaryProfiles.Add(profile);
        await _context.SaveChangesAsync(cancellationToken);

        return new BeneficiaryProfileCreatedDto(
            BeneficiaryProfileId: profile.Id,
            UserId: userId,
            FullName: profile.FullName,
            PhoneNumber: profile.PhoneNumber,
            BusinessName: profile.BusinessName,
            BranchCode: profile.BranchCode,
            Sector: profile.LivelihoodSector,
            SeedCapitalAmount: profile.SeedCapitalAmount
        );
    }

    public async Task<bool> Handle(UpdateBeneficiaryStatusCommand request, CancellationToken cancellationToken)
    {
        var profile = await _context.BeneficiaryProfiles
            .FirstOrDefaultAsync(b => b.Id == request.BeneficiaryProfileId && !b.IsDeleted, cancellationToken);

        if (profile == null)
        {
            return false;
        }

        profile.Status = request.Status;
        profile.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
