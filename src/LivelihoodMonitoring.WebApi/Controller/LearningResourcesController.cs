using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LivelihoodMonitoring.Application.LearningResources.Commands;
using LivelihoodMonitoring.Application.LearningResources.Queries;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.WebApi.Controllers;

[ApiController]
[Route("api/learning-resources")]
[Route("api/learning/resources")]
[Route("api/learning")]
public class LearningResourcesController : ControllerBase
{
    private readonly ISender _sender;

    public LearningResourcesController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<LearningResourceDto>>> GetLearningResources(
        [FromQuery] LearningCategory? category,
        [FromQuery] string? sector,
        [FromQuery] string? language,
        CancellationToken ct)
    {
        var result = await _sender.Send(new GetLearningResourcesQuery(category, sector, language), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "HeadOfficeMAndE,Admin")]
    public async Task<ActionResult<LearningResourceDto>> CreateLearningResource(
        [FromBody] CreateLearningResourceCommand command,
        CancellationToken ct)
    {
        var result = await _sender.Send(command, ct);
        return CreatedAtAction(nameof(GetLearningResources), new { id = result.Id }, result);
    }
}
