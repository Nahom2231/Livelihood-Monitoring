using MediatR;
using Microsoft.EntityFrameworkCore;
using LivelihoodMonitoring.Application.Common.Interfaces;
using LivelihoodMonitoring.Domain.Entities;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Application.LearningResources.Commands;

public record CreateLearningResourceCommand(
    string Title,
    string Content,
    LearningCategory Category,
    string Sector = "All",
    string Language = "en"
) : IRequest<LearningResourceDto>;

public record LearningResourceDto(
    Guid Id,
    string Title,
    string Content,
    string Category,
    string Sector,
    string Language,
    DateTime CreatedAtUtc
);

public class CreateLearningResourceCommandHandler : IRequestHandler<CreateLearningResourceCommand, LearningResourceDto>
{
    private readonly IApplicationDbContext _context;

    public CreateLearningResourceCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LearningResourceDto> Handle(CreateLearningResourceCommand request, CancellationToken cancellationToken)
    {
        var item = new LearningResource
        {
            Title = request.Title,
            Content = request.Content,
            Category = request.Category,
            Sector = request.Sector,
            Language = request.Language.ToLower()
        };

        _context.LearningResources.Add(item);
        await _context.SaveChangesAsync(cancellationToken);

        return new LearningResourceDto(
            item.Id,
            item.Title,
            item.Content,
            item.Category.ToString(),
            item.Sector,
            item.Language,
            item.CreatedAtUtc
        );
    }
}
