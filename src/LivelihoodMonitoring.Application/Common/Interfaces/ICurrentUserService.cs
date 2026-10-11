using LivelihoodMonitoring.Domain.Enums;

namespace LivelihoodMonitoring.Application.Common.Interfaces;

public interface ICurrentUserService
{
    string? UserId { get; }
    UserRole? Role { get; }
    string? BranchCode { get; }
    bool IsAuthenticated { get; }
}