using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LivelihoodMonitoring.Application.BusinessPlanning.Commands;
using LivelihoodMonitoring.Application.BusinessPlanning.Queries;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/business-planning")]
public class BusinessPlanningController : ControllerBase
{
    private readonly ISender _sender;

    public BusinessPlanningController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("goals")]
    [Authorize(Roles = "Beneficiary,SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
    public async Task<ActionResult<BusinessGoalDto>> CreateGoal(
        [FromBody] CreateBusinessGoalCommand command, 
        CancellationToken ct)
    {
        var result = await _sender.Send(command, ct);
        if (result == null)
        {
            return BadRequest(new { message = "Beneficiary not found or goal creation failed." });
        }

        return Ok(result);
    }

    public record UpdateProgressRequest(decimal Amount, bool IsIncremental = true, bool? MarkAchieved = null);

    [HttpPut("goals/{goalId:guid}/progress")]
    [Authorize(Roles = "Beneficiary,SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
    public async Task<ActionResult<BusinessGoalDto>> UpdateGoalProgress(
        Guid goalId, 
        [FromBody] UpdateProgressRequest request, 
        CancellationToken ct)
    {
        var command = new UpdateBusinessGoalProgressCommand(goalId, request.Amount, request.IsIncremental, request.MarkAchieved);
        var result = await _sender.Send(command, ct);
        if (result == null)
        {
            return NotFound(new { message = $"Business goal with ID {goalId} was not found." });
        }

        return Ok(result);
    }

    [HttpDelete("goals/{goalId:guid}")]
    [Authorize(Roles = "Beneficiary,SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
    public async Task<IActionResult> DeleteGoal(Guid goalId, CancellationToken ct)
    {
        var success = await _sender.Send(new DeleteBusinessGoalCommand(goalId), ct);
        if (!success)
        {
            return NotFound(new { message = $"Business goal with ID {goalId} was not found." });
        }

        return NoContent();
    }

    [HttpGet("goals")]
    [Authorize(Roles = "Beneficiary,SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
    public async Task<ActionResult<List<BusinessGoalDto>>> GetAllGoals(
        [FromQuery] GoalType? type, 
        CancellationToken ct)
    {
        var result = await _sender.Send(new GetBusinessGoalsByBeneficiaryQuery(null, type), ct);
        return Ok(result);
    }

    [HttpGet("goals/beneficiary/{beneficiaryProfileId:guid}")]
    [Authorize(Roles = "Beneficiary,SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
    public async Task<ActionResult<List<BusinessGoalDto>>> GetGoalsByBeneficiary(
        Guid beneficiaryProfileId, 
        [FromQuery] GoalType? type, 
        CancellationToken ct)
    {
        var result = await _sender.Send(new GetBusinessGoalsByBeneficiaryQuery(beneficiaryProfileId, type), ct);
        return Ok(result);
    }
}
