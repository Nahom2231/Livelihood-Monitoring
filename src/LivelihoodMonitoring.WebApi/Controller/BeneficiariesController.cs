using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LivelihoodMonitoring.Application.Beneficiaries.Commands;
using LivelihoodMonitoring.Application.Beneficiaries.Queries;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BeneficiariesController : ControllerBase
{
    private readonly ISender _sender;

    public BeneficiariesController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    [Authorize(Roles = "SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
    public async Task<ActionResult<BeneficiaryProfileCreatedDto>> CreateBeneficiary(
        [FromBody] CreateBeneficiaryProfileCommand command, 
        CancellationToken ct)
    {
        var result = await _sender.Send(command, ct);
        return CreatedAtAction(nameof(GetBeneficiaryById), new { id = result.BeneficiaryProfileId }, result);
    }

    [HttpGet]
    [Authorize(Roles = "SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
    public async Task<ActionResult<List<BeneficiaryListItemDto>>> GetBeneficiaries(
        [FromQuery] string? search,
        [FromQuery] string? branchCode,
        [FromQuery] string? region,
        [FromQuery] string? cluster,
        [FromQuery] string? sector,
        [FromQuery] BusinessStatus? status,
        [FromQuery] BeneficiaryType? beneficiaryType,
        CancellationToken ct)
    {
        var query = new GetBeneficiariesQuery(search, branchCode, region, cluster, sector, status, beneficiaryType);
        var result = await _sender.Send(query, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Beneficiary,SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
    public async Task<ActionResult<BeneficiaryListItemDto>> GetBeneficiaryById(Guid id, CancellationToken ct)
    {
        var result = await _sender.Send(new GetBeneficiaryByIdQuery(id), ct);
        if (result == null)
        {
            return NotFound(new { message = $"Beneficiary profile with ID {id} was not found." });
        }

        return Ok(result);
    }

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] BusinessStatus status, CancellationToken ct)
    {
        var success = await _sender.Send(new UpdateBeneficiaryStatusCommand(id, status), ct);
        if (!success)
        {
            return NotFound(new { message = $"Beneficiary profile with ID {id} was not found." });
        }

        return NoContent();
    }

    [HttpGet("{id:guid}/financial-summary")]
    [Authorize(Roles = "Beneficiary,SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
    public async Task<ActionResult<BeneficiaryFinancialSummaryDto>> GetFinancialSummary(Guid id, CancellationToken ct)
    {
        var result = await _sender.Send(new GetBeneficiaryFinancialSummaryQuery(id), ct);
        if (result == null)
        {
            return NotFound(new { message = $"Beneficiary profile with ID {id} was not found." });
        }

        return Ok(result);
    }
}
