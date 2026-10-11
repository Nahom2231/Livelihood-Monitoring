using MediatR;
using Microsoft.EntityFrameworkCore;
using LivelihoodMonitoring.Application.Common.Interfaces;
using LivelihoodMonitoring.Application.LearningResources.Commands;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Application.LearningResources.Queries;

public record GetLearningResourcesQuery(
    LearningCategory? Category = null,
    string? Sector = null,
    string? Language = null
) : IRequest<List<LearningResourceDto>>;

public class GetLearningResourcesQueryHandler : IRequestHandler<GetLearningResourcesQuery, List<LearningResourceDto>>
{
    private readonly IApplicationDbContext _context;

    public GetLearningResourcesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<LearningResourceDto>> Handle(GetLearningResourcesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.LearningResources
            .AsNoTracking()
            .Where(r => !r.IsDeleted);

        if (request.Category.HasValue)
        {
            query = query.Where(r => r.Category == request.Category.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Sector))
        {
            query = query.Where(r => r.Sector == request.Sector || r.Sector == "All");
        }

        if (!string.IsNullOrWhiteSpace(request.Language))
        {
            var lang = request.Language.Trim().ToLower();
            query = query.Where(r => r.Language == lang);
        }

        var results = await query
            .OrderBy(r => r.Category)
            .ThenByDescending(r => r.CreatedAtUtc)
            .Select(r => new LearningResourceDto(
                r.Id,
                r.Title,
                r.Content,
                r.Category.ToString(),
                r.Sector,
                r.Language,
                r.CreatedAtUtc
            ))
            .ToListAsync(cancellationToken);

        return results;
    }
}
