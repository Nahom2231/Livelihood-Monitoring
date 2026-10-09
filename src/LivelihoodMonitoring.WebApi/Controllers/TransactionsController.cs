using MediatR;
using Microsoft.AspNetCore.Mvc;
using LivelihoodMonitoring.Application.Transactions.Commands;

namespace LivelihoodMonitoring.WebApi.Controllers;

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
    public async Task<IActionResult> SyncTransactions([FromBody] SyncTransactionsCommand command, CancellationToken ct)
    {
        var result = await _sender.Send(command, ct);
        return Ok(result);
    }
}