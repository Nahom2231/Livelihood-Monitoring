using MediatR;
using Microsoft.EntityFrameworkCore;
using LivelihoodMonitoring.Application.Common.Interfaces;
using LivelihoodMonitoring.Domain.Entities;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Application.BusinessPlanning.Commands;

public record CreateBusinessGoalCommand(
    Guid BeneficiaryProfileId,
    string Title,
    string Description,
    GoalType Type,
    decimal TargetAmount,
    decimal CurrentAmount = 0m,
    DateTime? TargetDateUtc = null
) : IRequest<BusinessGoalDto?>;

public record UpdateBusinessGoalProgressCommand(
    Guid GoalId,
    decimal Amount,
    bool IsIncremental = true,
    bool? MarkAchieved = null
) : IRequest<BusinessGoalDto?>;

public record DeleteBusinessGoalCommand(Guid GoalId) : IRequest<bool>;

public record BusinessGoalDto(
    Guid Id,
    Guid BeneficiaryProfileId,
    string Title,
    string Description,
    string GoalType,
    decimal TargetAmount,
    decimal CurrentAmount,
    decimal ProgressPercentage,
    DateTime? TargetDateUtc,
    bool IsAchieved
);

public class BusinessPlanningCommandHandler :
    IRequestHandler<CreateBusinessGoalCommand, BusinessGoalDto?>,
    IRequestHandler<UpdateBusinessGoalProgressCommand, BusinessGoalDto?>,
    IRequestHandler<DeleteBusinessGoalCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public BusinessPlanningCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BusinessGoalDto?> Handle(CreateBusinessGoalCommand request, CancellationToken cancellationToken)
    {
        var beneficiaryExists = await _context.BeneficiaryProfiles
            .AnyAsync(b => b.Id == request.BeneficiaryProfileId && !b.IsDeleted, cancellationToken);

        if (!beneficiaryExists)
        {
            return null;
        }

        var goal = new BusinessGoal
        {
            BeneficiaryProfileId = request.BeneficiaryProfileId,
            Title = request.Title,
            Description = request.Description,
            Type = request.Type,
            TargetAmount = request.TargetAmount,
            CurrentAmount = request.CurrentAmount,
            TargetDateUtc = request.TargetDateUtc,
            IsAchieved = request.CurrentAmount >= request.TargetAmount && request.TargetAmount > 0
        };

        _context.BusinessGoals.Add(goal);
        await _context.SaveChangesAsync(cancellationToken);

        var pct = goal.TargetAmount > 0 ? Math.Round((goal.CurrentAmount / goal.TargetAmount) * 100m, 1) : 0m;

        return new BusinessGoalDto(
            goal.Id,
            goal.BeneficiaryProfileId,
            goal.Title,
            goal.Description,
            goal.Type.ToString(),
            goal.TargetAmount,
            goal.CurrentAmount,
            pct,
            goal.TargetDateUtc,
            goal.IsAchieved
        );
    }

    public async Task<BusinessGoalDto?> Handle(UpdateBusinessGoalProgressCommand request, CancellationToken cancellationToken)
    {
        var goal = await _context.BusinessGoals
            .FirstOrDefaultAsync(g => g.Id == request.GoalId && !g.IsDeleted, cancellationToken);

        if (goal == null)
        {
            return null;
        }

        if (request.IsIncremental)
        {
            goal.CurrentAmount += request.Amount;
        }
        else
        {
            goal.CurrentAmount = request.Amount;
        }

        if (request.MarkAchieved.HasValue)
        {
            goal.IsAchieved = request.MarkAchieved.Value;
        }
        else if (goal.TargetAmount > 0 && goal.CurrentAmount >= goal.TargetAmount)
        {
            goal.IsAchieved = true;
        }

        goal.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        var pct = goal.TargetAmount > 0 ? Math.Round((goal.CurrentAmount / goal.TargetAmount) * 100m, 1) : 0m;

        return new BusinessGoalDto(
            goal.Id,
            goal.BeneficiaryProfileId,
            goal.Title,
            goal.Description,
            goal.Type.ToString(),
            goal.TargetAmount,
            goal.CurrentAmount,
            pct,
            goal.TargetDateUtc,
            goal.IsAchieved
        );
    }

    public async Task<bool> Handle(DeleteBusinessGoalCommand request, CancellationToken cancellationToken)
    {
        var goal = await _context.BusinessGoals
            .FirstOrDefaultAsync(g => g.Id == request.GoalId && !g.IsDeleted, cancellationToken);

        if (goal == null)
        {
            return false;
        }

        goal.IsDeleted = true;
        goal.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
