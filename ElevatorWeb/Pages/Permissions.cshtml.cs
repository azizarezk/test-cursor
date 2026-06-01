using ElevatorWeb.Models;
using ElevatorWeb.Services;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ElevatorWeb.Pages;

public class PermissionsModel : PageModel
{
    private readonly PermissionCatalog permissionCatalog;

    public PermissionsModel(PermissionCatalog permissionCatalog)
    {
        this.permissionCatalog = permissionCatalog;
    }

    public IReadOnlyList<EmployeePermissionAssignment> Assignments { get; private set; } = [];

    public IReadOnlyList<PermissionGrant> Permissions { get; private set; } = [];

    public void OnGet()
    {
        Assignments = permissionCatalog.Assignments;
        Permissions = permissionCatalog.AllPermissions;
    }
}
