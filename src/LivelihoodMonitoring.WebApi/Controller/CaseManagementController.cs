using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LivelihoodMonitoring.Application.CaseManagement.Commands;
using LivelihoodMonitoring.Application.CaseManagement.Queries;

namespace LivelihoodMonitoring.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/case-management")]
public class CaseManagementController : ControllerBase
{
    private readonly ISender _sender;

    public CaseManagementController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("case-notes")]
    [Authorize(Roles = "SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
    public async Task<ActionResult<CaseNoteDto>> AddCaseNote(
        [FromBody] AddCaseNoteCommand command, 
        CancellationToken ct)
    {
        var result = await _sender.Send(command, ct);
        if (result == null)
        {
            return BadRequest(new { message = "Beneficiary not found or case note logging failed." });
        }

        return Ok(result);
    }

    [HttpGet("case-notes")]
    [Authorize(Roles = "SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
    public async Task<ActionResult<List<CaseNoteDto>>> GetAllCaseNotes(
        [FromQuery] int limit = 50, 
        CancellationToken ct = default)
    {
        var result = await _sender.Send(new GetAllCaseNotesQuery(limit), ct);
        return Ok(result);
    }

    [HttpGet("case-notes/beneficiary/{beneficiaryProfileId:guid}")]
    [Authorize(Roles = "SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
    public async Task<ActionResult<List<CaseNoteDto>>> GetCaseNotes(
        Guid beneficiaryProfileId, 
        CancellationToken ct)
    {
        var result = await _sender.Send(new GetCaseNotesByBeneficiaryQuery(beneficiaryProfileId), ct);
        return Ok(result);
    }

    [HttpPost("trainings")]
    [Authorize(Roles = "SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
    public async Task<ActionResult<BeneficiaryTrainingDto>> RecordTraining(
        [FromBody] RecordBeneficiaryTrainingCommand command, 
        CancellationToken ct)
    {
        var result = await _sender.Send(command, ct);
        if (result == null)
        {
            return BadRequest(new { message = "Beneficiary not found or recording training failed." });
        }

        return Ok(result);
    }

    [HttpGet("trainings")]
    [Authorize(Roles = "Beneficiary,SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
    public async Task<ActionResult<List<BeneficiaryTrainingDto>>> GetAllTrainings(
        [FromQuery] int limit = 50, 
        CancellationToken ct = default)
    {
        var result = await _sender.Send(new GetAllBeneficiaryTrainingsQuery(limit), ct);
        return Ok(result);
    }

    [HttpGet("trainings/beneficiary/{beneficiaryProfileId:guid}")]
    [Authorize(Roles = "Beneficiary,SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
    public async Task<ActionResult<List<BeneficiaryTrainingDto>>> GetTrainings(
        Guid beneficiaryProfileId, 
        CancellationToken ct)
    {
        var result = await _sender.Send(new GetBeneficiaryTrainingsQuery(beneficiaryProfileId), ct);
        return Ok(result);
    }
}
