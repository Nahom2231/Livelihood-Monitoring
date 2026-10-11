using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LivelihoodMonitoring.Application.Authentication.Commands;

namespace LivelihoodMonitoring.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ISender _sender;

    public AuthController(ISender sender)
    {
        _sender = sender;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command, CancellationToken ct)
    {
        var result = await _sender.Send(command, ct);
        if (result == null)
        {
            return Unauthorized(new { message = "Invalid credentials. Ensure username and password are correct." });
        }

        return Ok(result);
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterUserCommand command, CancellationToken ct)
    {
        var result = await _sender.Send(command, ct);
        if (result == null)
        {
            return BadRequest(new { message = "Username already exists or registration failed." });
        }

        return Ok(result);
    }
}