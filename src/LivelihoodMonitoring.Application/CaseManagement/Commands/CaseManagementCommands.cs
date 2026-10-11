using MediatR;
using Microsoft.EntityFrameworkCore;
using LivelihoodMonitoring.Application.Common.Interfaces;
using LivelihoodMonitoring.Domain.Entities;

namespace LivelihoodMonitoring.Application.CaseManagement.Commands;

public record AddCaseNoteCommand(
    Guid BeneficiaryProfileId,
    string StaffId,
    string StaffName,
    DateTime VisitDateUtc,
    string VisitFindings,
    string Recommendations,
    bool FollowUpRequired,
    DateTime? NextFollowUpDateUtc = null
) : IRequest<CaseNoteDto?>;

public record RecordBeneficiaryTrainingCommand(
    Guid BeneficiaryProfileId,
    string TrainingTitle,
    string VocationalSector,
    string TrainerOrInstitution,
    DateTime CompletedDateUtc,
    string Notes
) : IRequest<BeneficiaryTrainingDto?>;

public record CaseNoteDto(
    Guid Id,
    Guid BeneficiaryProfileId,
    string StaffId,
    string StaffName,
    DateTime VisitDateUtc,
    string VisitFindings,
    string Recommendations,
    bool FollowUpRequired,
    DateTime? NextFollowUpDateUtc,
    DateTime CreatedAtUtc
);

public record BeneficiaryTrainingDto(
    Guid Id,
    Guid BeneficiaryProfileId,
    string TrainingTitle,
    string VocationalSector,
    string TrainerOrInstitution,
    DateTime CompletedDateUtc,
    string Notes
);

public class CaseManagementCommandHandler :
    IRequestHandler<AddCaseNoteCommand, CaseNoteDto?>,
    IRequestHandler<RecordBeneficiaryTrainingCommand, BeneficiaryTrainingDto?>
{
    private readonly IApplicationDbContext _context;

    public CaseManagementCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CaseNoteDto?> Handle(AddCaseNoteCommand request, CancellationToken cancellationToken)
    {
        var profileExists = await _context.BeneficiaryProfiles
            .AnyAsync(b => b.Id == request.BeneficiaryProfileId && !b.IsDeleted, cancellationToken);

        if (!profileExists)
        {
            return null;
        }

        var caseNote = new CaseNote
        {
            BeneficiaryProfileId = request.BeneficiaryProfileId,
            StaffId = request.StaffId,
            StaffName = request.StaffName,
            VisitDateUtc = request.VisitDateUtc,
            VisitFindings = request.VisitFindings,
            Recommendations = request.Recommendations,
            FollowUpRequired = request.FollowUpRequired,
            NextFollowUpDateUtc = request.NextFollowUpDateUtc
        };

        _context.CaseNotes.Add(caseNote);
        await _context.SaveChangesAsync(cancellationToken);

        return new CaseNoteDto(
            caseNote.Id,
            caseNote.BeneficiaryProfileId,
            caseNote.StaffId,
            caseNote.StaffName,
            caseNote.VisitDateUtc,
            caseNote.VisitFindings,
            caseNote.Recommendations,
            caseNote.FollowUpRequired,
            caseNote.NextFollowUpDateUtc,
            caseNote.CreatedAtUtc
        );
    }

    public async Task<BeneficiaryTrainingDto?> Handle(RecordBeneficiaryTrainingCommand request, CancellationToken cancellationToken)
    {
        var profileExists = await _context.BeneficiaryProfiles
            .AnyAsync(b => b.Id == request.BeneficiaryProfileId && !b.IsDeleted, cancellationToken);

        if (!profileExists)
        {
            return null;
        }

        var training = new BeneficiaryTraining
        {
            BeneficiaryProfileId = request.BeneficiaryProfileId,
            TrainingTitle = request.TrainingTitle,
            VocationalSector = request.VocationalSector,
            TrainerOrInstitution = request.TrainerOrInstitution,
            CompletedDateUtc = request.CompletedDateUtc,
            Notes = request.Notes
        };

        _context.BeneficiaryTrainings.Add(training);
        await _context.SaveChangesAsync(cancellationToken);

        return new BeneficiaryTrainingDto(
            training.Id,
            training.BeneficiaryProfileId,
            training.TrainingTitle,
            training.VocationalSector,
            training.TrainerOrInstitution,
            training.CompletedDateUtc,
            training.Notes
        );
    }
}
