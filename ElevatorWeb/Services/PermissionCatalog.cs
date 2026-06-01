using ElevatorWeb.Models;

namespace ElevatorWeb.Services;

public class PermissionCatalog
{
    public PermissionCatalog()
    {
        AllPermissions =
        [
            new(
                "Elevator.ViewDashboard",
                "View dashboard",
                "Read elevator fleet status, uptime, and safety summaries.",
                PermissionLevel.ViewOnly),
            new(
                "Elevator.DispatchCab",
                "Dispatch cabs",
                "Send available passenger elevators to requested floors.",
                PermissionLevel.Operate),
            new(
                "Elevator.RecordInspection",
                "Record inspections",
                "Create inspection notes and attach maintenance observations.",
                PermissionLevel.Maintain),
            new(
                "Elevator.LockOutCab",
                "Lock out cab",
                "Temporarily remove a cab from passenger service for safety.",
                PermissionLevel.Maintain),
            new(
                "Elevator.ViewAuditLog",
                "View audit log",
                "Review user actions and permission-sensitive elevator events.",
                PermissionLevel.ViewOnly),
            new(
                "Elevator.ManageAccess",
                "Manage access",
                "Grant or revoke employee elevator permissions.",
                PermissionLevel.Administer)
        ];

        Assignments =
        [
            CreateAssignment(
                new("b98cda83-7f8d-4d7f-8895-21d3f927d001", "fmorales", "fmorales@elevatorweb.local", "FacilitiesAdmin", true, "Signed in 12 minutes ago"),
                new("EMP-1001", "Francis Morales", "Facilities Manager", "Building Operations", "Weekday day shift", "All elevator banks"),
                "Elevator.ViewDashboard",
                "Elevator.DispatchCab",
                "Elevator.RecordInspection",
                "Elevator.LockOutCab",
                "Elevator.ViewAuditLog",
                "Elevator.ManageAccess"),
            CreateAssignment(
                new("2e31b62e-3c5b-42e2-9709-3e752c497002", "akhan", "akhan@elevatorweb.local", "ElevatorTechnician", true, "Signed in 44 minutes ago"),
                new("EMP-1024", "Aisha Khan", "Elevator Technician", "Maintenance", "Rotating service shift", "North tower and freight lifts"),
                "Elevator.ViewDashboard",
                "Elevator.RecordInspection",
                "Elevator.LockOutCab",
                "Elevator.ViewAuditLog"),
            CreateAssignment(
                new("a5cbec27-fb1f-4a17-8da8-873829140003", "jreed", "jreed@elevatorweb.local", "FrontDeskOperator", true, "Signed in 1 hour ago"),
                new("EMP-1099", "Jordan Reed", "Front Desk Coordinator", "Tenant Services", "Weekday evening shift", "Passenger elevators"),
                "Elevator.ViewDashboard",
                "Elevator.DispatchCab"),
            CreateAssignment(
                new("7198bf0a-f2f7-4f39-8d6f-524fd8800004", "lchen", "lchen@elevatorweb.local", "SafetyAuditor", false, "Invitation pending"),
                new("EMP-1138", "Lena Chen", "Safety Auditor", "Compliance", "Quarterly audit coverage", "All elevator banks"),
                "Elevator.ViewDashboard",
                "Elevator.ViewAuditLog")
        ];
    }

    public IReadOnlyList<PermissionGrant> AllPermissions { get; }

    public IReadOnlyList<EmployeePermissionAssignment> Assignments { get; }

    private EmployeePermissionAssignment CreateAssignment(
        AspNetUserAccount user,
        EmployeeProfile employee,
        params string[] permissionCodes)
    {
        var permissions = AllPermissions
            .Where(permission => permissionCodes.Contains(permission.Code, StringComparer.OrdinalIgnoreCase))
            .ToArray();

        return new EmployeePermissionAssignment(user, employee, permissions);
    }
}
