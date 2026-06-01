namespace ElevatorWeb.Models;

public enum PermissionLevel
{
    ViewOnly,
    Operate,
    Maintain,
    Administer
}

public record AspNetUserAccount(
    string Id,
    string UserName,
    string Email,
    string Role,
    bool EmailConfirmed,
    string LastSignInSummary);

public record EmployeeProfile(
    string EmployeeNumber,
    string FullName,
    string JobTitle,
    string Department,
    string Shift,
    string AssignedElevatorBank);

public record PermissionGrant(
    string Code,
    string Name,
    string Description,
    PermissionLevel Level);

public record EmployeePermissionAssignment(
    AspNetUserAccount User,
    EmployeeProfile Employee,
    IReadOnlyList<PermissionGrant> Permissions)
{
    public bool CanAdminister => Permissions.Any(permission => permission.Level == PermissionLevel.Administer);
}
