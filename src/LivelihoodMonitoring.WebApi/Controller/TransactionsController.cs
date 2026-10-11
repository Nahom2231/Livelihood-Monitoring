using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LivelihoodMonitoring.Application.Transactions.Commands;
using LivelihoodMonitoring.Application.Transactions.Queries;
using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ISender _sender;

    public TransactionsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("sync")]
    [Authorize(Roles = "Beneficiary,SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
    public async Task<IActionResult> SyncTransactions([FromBody] SyncTransactionsCommand command, CancellationToken ct)
    {
        var result = await _sender.Send(command, ct);
        return Ok(result);
    }

    [HttpGet("beneficiary/{beneficiaryProfileId}")]
    [Authorize(Roles = "Beneficiary,SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
    public async Task<ActionResult<BeneficiaryTransactionListDto>> GetBeneficiaryTransactions(
        Guid beneficiaryProfileId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] TransactionType? type,
        CancellationToken ct)
    {
        var query = new GetTransactionsByBeneficiaryQuery(beneficiaryProfileId, startDate, endDate, type);
        var result = await _sender.Send(query, ct);
        return Ok(result);
    }
}