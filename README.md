# ElevatorWeb

ElevatorWeb is an ASP.NET Core 8 Razor Pages sample project about elevator operations. It presents a simple dashboard for fleet status, maintenance metrics, safety highlights, and employee permission assignments.

## Project structure

- `ElevatorWeb.sln` - Visual Studio solution file.
- `ElevatorWeb/` - ASP.NET Core 8 web application.
- `ElevatorWeb/Pages/` - Razor Pages UI and page model content.
- `ElevatorWeb/wwwroot/css/site.css` - Application styling.
- `ElevatorWeb/Pages/Permissions.cshtml` - AspNet user, employee, and permission dashboard.

## Run locally

Install the .NET 8 SDK, then run:

```bash
dotnet run --project ElevatorWeb/ElevatorWeb.csproj
```

Open the localhost URL printed by the command to view the elevator dashboard.
