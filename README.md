# SportZone - Blazor Migration

## Overview

The SportZone repository now ships as a .NET 8 solution consisting of:

- `SportZone_API` - ASP.NET Core Web API that exposes facility, booking, payment, and management endpoints.
- `SportZone_Blazor` - Blazor WebAssembly client that replaces the previous React portal.
- `SportZone_Portal` - legacy Vite/React frontend (kept temporarily for reference while the Blazor implementation is completed).

## Getting Started

### Prerequisites

- .NET SDK 8.0 or later
- Node.js (only required if you still need to run the legacy React portal)

### Restore dependencies

```bash
dotnet restore SportZone_API/SportZone_API.sln
```

### Run the API

```bash
cd SportZone_API
dotnet run
```

This launches the backend on `https://localhost:7057` using the existing configuration.

### Run the Blazor client

```bash
cd SportZone_Blazor
dotnet build
dotnet run
```

By default the client hosts at `https://localhost:7179` and consumes the API using the base URL in `wwwroot/appsettings.json`.

## Key Blazor Screens

- **Home** - marketing hero with featured facilities pulled from the API.
- **Field catalog** - search, filter, and paginate facilities (`/field-list`).
- **Booking** - select slots and create bookings (`/booking/{facilityId}`) with API-backed availability.
- **Order manager** - quick lookup for order/payment details.
- **Finance manager** - owner revenue reporting with filterable time ranges.

Additional administrative pages have placeholders and will be expanded during subsequent migrations.

## Legacy React Portal

The former React client remains under `SportZone_Portal/` for historical reference. No new changes should be made there; the Blazor app is the canonical frontend moving forward.

## Configuration

- Update `SportZone_Blazor/wwwroot/appsettings.json` if your API host differs from the default `https://localhost:7057/`.
- The API continues to read its configuration from `appsettings.json` / `appsettings.Development.json` as before.

## Testing & Next Steps

- Prioritise end-to-end testing of booking and finance flows to validate parity with the legacy portal.
- Wire authentication against `AuthenticationController` and migrate SignalR notifications to the Blazor client.
- Replace remaining placeholder management pages with full Blazor components.