## SportZone Portal -> Blazor Migration Plan

### Existing React Routes

- `/` & `/homepage` -> marketing landing (`Header`, `HeroSection`, `FeaturedFacilitiesSection`, `WhyChooseUsSection`, `FeedbackSection`, `Footer`). Mostly static content plus highlighted facilities.
- `/login` -> credential form (`SignInForm`, `RegisterForm`, Google OAuth callback, token persistence in `localStorage`).
- `/google-auth-callback` -> handles OAuth redirect, exchanges Google auth code for JWT.
- `/field_list` -> public facility search with filter, view toggle, and pagination (`useFacilities` fetches `GET /api/Facility/with-details`).
- `/facility/:facId` -> detailed facility profile using slider gallery, schedule preview, booking CTA.
- `/booking/:facId` -> booking wizard that fetches facility, fields, and price slots; posts bookings; integrates with payment flow.
- `/payment` -> VNPay integration screens (QR rendering, countdown, status polling); `/payment-success` & `/payment-failed` show outcomes.
- `/booking-history` -> authenticated customer booking history list with filters.
- `/facility_manager` -> field owner facility CRUD (modal forms, table, pagination) via `FacilityController`.
- `/field_manager` -> field inventory CRUD with upload, validation, pagination.
- `/service_manager` -> ancillary services CRUD.
- `/order_manager` -> booking/order table with status updates (`OrderController`).
- `/staff_manager` -> staff roster CRUD (`StaffController`).
- `/users_manager` -> admin user and role management.
- `/regulation_manager` -> system/facility regulation CRUD.
- `/finance_manager` -> revenue dashboards using `chart.js`, summary cards, date filters hitting finance endpoints.
- `/weekly_schedule` -> schedule calendar view (custom grid) for fields.
- Notifications -> `AppNotificationDemo` + `useNotificationHub` subscribe to SignalR hub (`/notificationHub`) toasts via SweetAlert2.
- Shared layout -> `Sidebar`, `Header`, `Footer`, role-aware navigation, token stored in `localStorage`.

### Blazor Conversion Targets

- Create Blazor host app with routing equivalents for each path above (prefer camel-cased `.razor` pages to keep parity).
- Implement authentication state provider backed by `localStorage` (via `IJSRuntime`) to persist JWT + user profile, mirroring React logic.
- Recreate responsive layout using shared components (`Sidebar`, `Header`, `Footer`) with Tailwind or Bootstrap classes translated to Blazor/SCSS.
- Port API data access to typed `HttpClient` services (`FacilityService`, `FieldService`, `BookingService`, `OrderService`, `FinanceService`, `RegulationService`, `StaffService`, `UserService`, `AuthService`).
- Replace React hooks with scoped services/state containers; leverage `ObservableCollection`/`NotifyPropertyChanged` or `Fluxor` equivalent where necessary for dashboards.
- Rebuild booking flow pages with Blazor components, preserving async fetch, validation, and navigation semantics.
- Integrate SignalR client via `Microsoft.AspNetCore.SignalR.Client` to replicate live notifications with Blazor-friendly toast component.
- Recreate charts using a Blazor chart library (e.g., `ChartJs.Blazor`) or custom JS interop wrappers for Chart.js.
- Translate VNPay payment status pages and QR rendering (using `SkiaSharp.QrCode` or JS interop) to maintain payment UX.
- Port modals/forms using Blazor component patterns (e.g., `<Modal IsOpen=...>`). Consider using `Bootstrap` or `MudBlazor` to accelerate parity.
- Ensure role-based navigation by evaluating JWT claims in Blazor and gating routes with `AuthorizeRouteView` / policies.
- Add unit/component tests where practical (e.g., Bunit) for critical flows.

### Immediate Next Steps

1. Scaffold a Blazor project (Server or WebAssembly) within the solution; decide hosting model (likely WASM + ASP.NET Core API).
2. Set up solution structure, DI registrations, shared DTO models.
3. Begin porting shared layout and the public field search flow to validate end-to-end API integration.
4. Iterate through authenticated management modules, prioritising Field/Facility CRUD, then orders and finance dashboards.
5. Document remaining gaps and parity checklist.
