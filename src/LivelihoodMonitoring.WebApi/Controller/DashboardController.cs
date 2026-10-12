using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LivelihoodMonitoring.Application.Dashboard.Queries;

namespace LivelihoodMonitoring.WebApi.Controllers;

[Authorize(Roles = "Beneficiary,SocialWorker,BranchCoordinator,HeadOfficeMAndE,Admin")]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ISender _sender;

    public DashboardController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary(
        [FromQuery] string? branchCode,
        [FromQuery] string? region,
        [FromQuery] string? cluster,
        [FromQuery] string? partnerOrganization,
        CancellationToken ct = default)
    {
        var result = await _sender.Send(new GetMonitoringDashboardSummaryQuery(branchCode, region, cluster, partnerOrganization), ct);
        return Ok(result);
    }

    [HttpGet("trends")]
    public async Task<ActionResult<List<MonthlyFinancialMetricDto>>> GetFinancialTrends(
        [FromQuery] int months = 6, 
        CancellationToken ct = default)
    {
        var result = await _sender.Send(new GetFinancialTrendsQuery(months), ct);
        return Ok(result);
    }

    [HttpGet("public-stats")]
    [AllowAnonymous]
    public async Task<ActionResult<DashboardSummaryDto>> GetPublicStats(CancellationToken ct = default)
    {
        var result = await _sender.Send(new GetMonitoringDashboardSummaryQuery(), ct);
        return Ok(result);
    }
}