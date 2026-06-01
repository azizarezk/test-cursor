using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ElevatorWeb.Pages;

public class IndexModel : PageModel
{
    public IReadOnlyList<ElevatorStatus> Elevators { get; } =
    [
        new("North Tower A", "Passenger", 18, 42, "In Service", "Inspected 6 days ago", "status-green"),
        new("North Tower B", "Passenger", 4, 19, "Standby", "Inspected 8 days ago", "status-blue"),
        new("Freight Lift 1", "Freight", 1, 67, "Loading", "Inspected 3 days ago", "status-orange"),
        new("Garage Shuttle", "Passenger", -2, 31, "Maintenance", "Technician assigned", "status-red")
    ];

    public IReadOnlyList<ServiceMetric> Metrics { get; } =
    [
        new("99.4%", "Monthly uptime", "Measured across all cab trips and door cycles."),
        new("1,842", "Safe rides today", "Passenger and freight trips completed without incident."),
        new("12 min", "Average response", "Mean technician dispatch time for alerts.")
    ];

    public IReadOnlyList<string> SafetyHighlights { get; } =
    [
        "Door sensor calibration is checked during every scheduled inspection.",
        "Load monitoring prevents dispatch when a cab is above rated capacity.",
        "Emergency phones and backup lighting are included in readiness checks."
    ];
}

public record ElevatorStatus(
    string Name,
    string Type,
    int CurrentFloor,
    int CapacityPercent,
    string Status,
    string InspectionSummary,
    string StatusClass);

public record ServiceMetric(string Value, string Label, string Description);
