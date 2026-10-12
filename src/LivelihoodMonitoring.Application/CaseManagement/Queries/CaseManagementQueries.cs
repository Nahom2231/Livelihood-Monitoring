using MediatR;
using Microsoft.EntityFrameworkCore;
using LivelihoodMonitoring.Application.CaseManagement.Commands;
using LivelihoodMonitoring.Application.Common.Interfaces;

namespace LivelihoodMonitoring.Application.CaseManagement.Queries;

public record GetCaseNotesByBeneficiaryQuery(Guid BeneficiaryProfileId) : IRequest<List<CaseNoteDto>>;

public record GetAllCaseNotesQuery(int Limit = 50) : IRequest<List<CaseNoteDto>>;

public record GetBeneficiaryTrainingsQuery(Guid BeneficiaryProfileId) : IRequest<List<BeneficiaryTrainingDto>>;

public record GetAllBeneficiaryTrainingsQuery(int Limit = 50) : IRequest<List<BeneficiaryTrainingDto>>;

public class CaseManagementQueryHandler :
    IRequestHandler<GetCaseNotesByBeneficiaryQuery, List<CaseNoteDto>>,
    IRequestHandler<GetAllCaseNotesQuery, List<CaseNoteDto>>,
    IRequestHandler<GetBeneficiaryTrainingsQuery, List<BeneficiaryTrainingDto>>,
    IRequestHandler<GetAllBeneficiaryTrainingsQuery, List<BeneficiaryTrainingDto>>
{
    private readonly IApplicationDbContext _context;

    public CaseManagementQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CaseNoteDto>> Handle(GetCaseNotesByBeneficiaryQuery request, CancellationToken cancellationToken)
    {
        var notes = await _context.CaseNotes
            .AsNoTracking()
            .Where(n => n.BeneficiaryProfileId == request.BeneficiaryProfileId && !n.IsDeleted)
            .OrderByDescending(n => n.VisitDateUtc)
            .Select(n => new CaseNoteDto(
                n.Id,
                n.BeneficiaryProfileId,
                n.StaffId,
                n.StaffName,
                n.VisitDateUtc,
                n.VisitFindings,
                n.Recommendations,
                n.FollowUpRequired,
                n.NextFollowUpDateUtc,
                n.CreatedAtUtc
            ))
            .ToListAsync(cancellationToken);

        return notes;
    }

    public async Task<List<CaseNoteDto>> Handle(GetAllCaseNotesQuery request, CancellationToken cancellationToken)
    {
        var notes = await _context.CaseNotes
            .AsNoTracking()
            .Where(n => !n.IsDeleted)
            .OrderByDescending(n => n.VisitDateUtc)
            .Take(request.Limit)
            .Select(n => new CaseNoteDto(
                n.Id,
                n.BeneficiaryProfileId,
                n.StaffId,
                n.StaffName,
                n.VisitDateUtc,
                n.VisitFindings,
                n.Recommendations,
                n.FollowUpRequired,
                n.NextFollowUpDateUtc,
                n.CreatedAtUtc
            ))
            .ToListAsync(cancellationToken);

        return notes;
    }

    public async Task<List<BeneficiaryTrainingDto>> Handle(GetBeneficiaryTrainingsQuery request, CancellationToken cancellationToken)
    {
        var trainings = await _context.BeneficiaryTrainings
            .AsNoTracking()
            .Where(t => t.BeneficiaryProfileId == request.BeneficiaryProfileId && !t.IsDeleted)
            .OrderByDescending(t => t.CompletedDateUtc)
            .Select(t => new BeneficiaryTrainingDto(
                t.Id,
                t.BeneficiaryProfileId,
                t.TrainingTitle,
                t.VocationalSector,
                t.TrainerOrInstitution,
                t.CompletedDateUtc,
                t.Notes
            ))
            .ToListAsync(cancellationToken);

        return trainings;
    }

    public async Task<List<BeneficiaryTrainingDto>> Handle(GetAllBeneficiaryTrainingsQuery request, CancellationToken cancellationToken)
    {
        var trainings = await _context.BeneficiaryTrainings
            .AsNoTracking()
            .Where(t => !t.IsDeleted)
            .OrderByDescending(t => t.CompletedDateUtc)
            .Take(request.Limit)
            .Select(t => new BeneficiaryTrainingDto(
                t.Id,
                t.BeneficiaryProfileId,
                t.TrainingTitle,
                t.VocationalSector,
                t.TrainerOrInstitution,
                t.CompletedDateUtc,
                t.Notes
            ))
            .ToListAsync(cancellationToken);

        return trainings;
    }
}
