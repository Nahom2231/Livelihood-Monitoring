using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LivelihoodMonitoring.Application.Reporting.Queries;

namespace LivelihoodMonitoring.WebApi.Controllers;

[Authorize(Roles = "SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
[ApiController]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly ISender _sender;

    public ReportsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("export/beneficiaries-csv")]
    public async Task<IActionResult> ExportBeneficiariesCsv(
        [FromQuery] string? branchCode,
        [FromQuery] string? region,
        CancellationToken ct)
    {
        var csvBytes = await _sender.Send(new ExportBeneficiariesCsvQuery(branchCode, region), ct);
        return File(csvBytes, "text/csv", $"beneficiaries-livelihood-report-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv");
    }

    [HttpGet("export/transactions-csv")]
    public async Task<IActionResult> ExportTransactionsCsv(
        [FromQuery] Guid? beneficiaryProfileId,
        [FromQuery] string? branchCode,
        CancellationToken ct)
    {
        var csvBytes = await _sender.Send(new ExportTransactionsCsvQuery(beneficiaryProfileId, branchCode), ct);
        return File(csvBytes, "text/csv", $"transactions-audit-log-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv");
    }
}
