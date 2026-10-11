using MediatR;
using Microsoft.EntityFrameworkCore;
using LivelihoodMonitoring.Application.BusinessPlanning.Commands;
using LivelihoodMonitoring.Application.Common.Interfaces;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Application.BusinessPlanning.Queries;

public record GetBusinessGoalsByBeneficiaryQuery(
    Guid BeneficiaryProfileId,
    GoalType? Type = null
) : IRequest<List<BusinessGoalDto>>;

public class GetBusinessGoalsByBeneficiaryQueryHandler : IRequestHandler<GetBusinessGoalsByBeneficiaryQuery, List<BusinessGoalDto>>
{
    private readonly IApplicationDbContext _context;

    public GetBusinessGoalsByBeneficiaryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BusinessGoalDto>> Handle(GetBusinessGoalsByBeneficiaryQuery request, CancellationToken cancellationToken)
    {
        var query = _context.BusinessGoals
            .AsNoTracking()
            .Where(g => g.BeneficiaryProfileId == request.BeneficiaryProfileId && !g.IsDeleted);

        if (request.Type.HasValue)
        {
            query = query.Where(g => g.Type == request.Type.Value);
        }

        var goals = await query
            .OrderBy(g => g.IsAchieved)
            .ThenBy(g => g.TargetDateUtc)
            .ToListAsync(cancellationToken);

        return goals.Select(g => new BusinessGoalDto(
            g.Id,
            g.BeneficiaryProfileId,
            g.Title,
            g.Description,
            g.Type.ToString(),
            g.TargetAmount,
            g.CurrentAmount,
            g.TargetAmount > 0 ? Math.Round((g.CurrentAmount / g.TargetAmount) * 100m, 1) : 0m,
            g.TargetDateUtc,
            g.IsAchieved
        )).ToList();
    }
}
