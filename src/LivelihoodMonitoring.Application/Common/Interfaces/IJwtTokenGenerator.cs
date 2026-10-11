using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(
       string userId,
       string username, 
       UserRole role,
       string? branchCode);
}