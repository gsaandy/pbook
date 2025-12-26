# PSBook — Complete Implementation Instructions

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Test-Driven Development

Each section includes a `tests.md` file with detailed test-writing instructions. These are **framework-agnostic** — adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, RSpec, Minitest, PHPUnit, etc.).

**For each section:**
1. Read `product-plan/sections/[section-id]/tests.md`
2. Write failing tests for key user flows (success and failure paths)
3. Implement the feature to make tests pass
4. Refactor while keeping tests green

The test instructions include:
- Specific UI elements, button labels, and interactions to verify
- Expected success and failure behaviors
- Empty state handling (when no records exist yet)
- Data assertions and state validations

---

# PSBook — Product Overview

## Summary

A lightweight cash collection and reconciliation system that digitizes the "last mile" collection process, replacing paper logbooks and WhatsApp messages with real-time balance tracking and automated calculations.

## Planned Sections

1. **Setup & Configuration** — Master data management for shops, routes, and employees.
2. **Daily Operations** — Route assignment and field collection logging.
3. **Admin Dashboard** — Real-time monitoring of collections and cash-in-hand across all employees.
4. **End-of-Day Reconciliation** — Cash handover verification and daily closing workflow.
5. **Reports & History** — Transaction history, audit trail, and analytics.

## Data Model

**Core Entities:** Organization, Shop, Employee, Route, RouteAssignment, Transaction, PaymentMode, DailyReconciliation

## Design System

**Colors:** Primary (indigo), Secondary (emerald), Neutral (slate)
**Typography:** Inter (heading/body), JetBrains Mono (code)

---

# Milestone 1: Foundation

## Goal

Set up design tokens, data model types, routing structure, and application shell.

## What to Implement

### 1. Design Tokens

Configure your styling system with tokens from `product-plan/design-system/`.

**Colors:** indigo (primary), emerald (secondary), slate (neutral)
**Typography:** Inter, JetBrains Mono

### 2. Data Model Types

Create TypeScript interfaces from `product-plan/data-model/types.ts`.

**Core entities:** Organization, Shop, Employee, Route, RouteAssignment, Transaction, PaymentMode, DailyReconciliation

### 3. Routing Structure

Create routes: `/setup`, `/operations`, `/dashboard`, `/reconciliation`, `/reports`

### 4. Application Shell

Copy shell components from `product-plan/shell/components/` and wire up navigation and user menu.

## Done When

- [ ] Design tokens configured
- [ ] Data model types defined
- [ ] Routes exist (can be placeholders)
- [ ] Shell renders with navigation
- [ ] Responsive on mobile

---

# Milestone 2: Setup & Configuration

## Goal

Implement master data management for shops, routes, and employees.

## Overview

A clean CRUD interface for managing shops, routes, and employees using a three-tab layout.

**Key Functionality:**
- Manage shops (add, edit, delete, CSV import)
- Create routes and assign shops to them
- Manage employees with role-based access
- Search and filter all entities
- Mobile-responsive tables→cards

## Recommended Approach: Test-Driven Development

See `product-plan/sections/setup-and-configuration/tests.md` for test instructions.

## What to Implement

### Components

Copy from `product-plan/sections/setup-and-configuration/components/`:
- `SetupAndConfiguration.tsx`

### Data Layer

The component expects: shops[], routes[], employees[]

See `types.ts` for data shapes.

### Callbacks

- `onAddShop`, `onEditShop`, `onDeleteShop`, `onImportShops`
- `onCreateRoute`, `onEditRoute`, `onDeleteRoute`
- `onAddEmployee`, `onEditEmployee`, `onToggleEmployeeStatus`

### Empty States

- No shops: "No shops yet. Add your first shop or import from CSV"
- No routes: "No routes yet. Create your first route"
- No employees: "No employees yet. Add an employee"

## Done When

- [ ] Tests written and passing
- [ ] Components render with real data
- [ ] All CRUD operations work
- [ ] Empty states display properly
- [ ] CSV import validates and imports shops
- [ ] Mobile responsive

---

# Milestone 3: Daily Operations

## Goal

Implement route assignment (admin) and collection logging (field staff).

## Overview

Role-based interface: admins assign routes, field staff log collections.

**Key Functionality:**
- Admin assigns routes to employees
- Field staff views assigned route and shops
- Field staff logs collections (amount + payment mode)
- Search for off-route shops
- Real-time cash-in-bag tracking

## Recommended Approach: Test-Driven Development

See `product-plan/sections/daily-operations/tests.md` for test instructions.

## What to Implement

### Components

Copy from `product-plan/sections/daily-operations/components/`:
- `DailyOperationsFieldStaff.tsx`

### Data Layer

See `types.ts` for data shapes (RouteAssignment, CurrentEmployee, AssignedRoute, PaymentModes).

### Callbacks

- `onLogCollection` - Save collection with GPS
- `onSearchShop` - Find off-route shops

### Empty States

- No route assigned: "No route assigned today"
- No shops in route: "No shops in this route"

## Done When

- [ ] Tests written and passing
- [ ] Route assignment works
- [ ] Collection logging works
- [ ] Cash-in-bag updates correctly
- [ ] Search finds off-route shops
- [ ] GPS location captured
- [ ] Mobile optimized

---

# Milestone 4: Admin Dashboard

## Goal

Implement real-time monitoring dashboard for admins.

## Overview

Live dashboard showing collections, cash-in-hand, and employee status.

**Key Functionality:**
- View summary metrics (Total Collected, Cash in Hand, Digital Payments)
- Monitor employee status in real-time
- View employee transaction details
- Auto-refresh every 30 seconds

## Recommended Approach: Test-Driven Development

See `product-plan/sections/admin-dashboard/tests.md` for test instructions.

## What to Implement

### Components

Copy from `product-plan/sections/admin-dashboard/components/`:
- `AdminDashboard.tsx`

### Data Layer

See `types.ts` for Summary, EmployeeStatus, Transaction data shapes.

### Callbacks

- `onViewEmployeeDetail` - Show transaction log
- `onRefresh` - Manual data refresh

### Empty States

- No collections today: "No collections logged today yet"

## Done When

- [ ] Tests written and passing
- [ ] Metrics display correctly
- [ ] Employee status table works
- [ ] Detail modal shows transactions
- [ ] Auto-refresh works
- [ ] Status indicators (green/gray/red) correct

---

# Milestone 5: End-of-Day Reconciliation

## Goal

Implement cash verification and daily closing workflow.

## Overview

Admins verify cash received from field staff against system calculations.

**Key Functionality:**
- View EOD summary (expected cash, digital payments)
- Verify each employee's cash handover
- Handle matches (mark verified)
- Handle mismatches (enter actual + mandatory note)
- Progress tracking

## Recommended Approach: Test-Driven Development

See `product-plan/sections/end-of-day-reconciliation/tests.md` for test instructions.

## What to Implement

### Components

Copy from `product-plan/sections/end-of-day-reconciliation/components/`:
- `EndOfDayReconciliation.tsx`

### Data Layer

See `types.ts` for EODSummary, EmployeeSettlement data shapes.

### Callbacks

- `onVerifyMatch` - Mark employee as verified
- `onVerifyMismatch` - Record variance and note

### Empty States

- No field staff worked: "No field staff worked today"

## Done When

- [ ] Tests written and passing
- [ ] Verification modal works
- [ ] Match confirmation works
- [ ] Mismatch form validates (requires note)
- [ ] Variance calculated correctly
- [ ] Progress indicator updates

---

# Milestone 6: Reports & History

## Goal

Implement transaction history, reports, and analytics.

## Overview

Comprehensive filtering, search, reporting, and analytics for historical data.

**Key Functionality:**
- View transaction history with filters
- View transaction details with GPS
- Generate reports (PDF/CSV export)
- View audit trail of reconciliation events
- Analyze trends with charts

## Recommended Approach: Test-Driven Development

See `product-plan/sections/reports-and-history/tests.md` for test instructions.

## What to Implement

### Components

Copy from `product-plan/sections/reports-and-history/components/`:
- `ReportsAndHistory.tsx`

### Data Layer

See `types.ts` for Transaction, ReconciliationEvent, TrendData shapes.

### Callbacks

- `onViewTransaction` - Show detail modal
- `onGenerateReport` - Create PDF/CSV
- `onExport` - Export filtered data

### Empty States

- No transactions: "No transactions found for selected filters"
- No results for search: "Try adjusting your filters"

## Done When

- [ ] Tests written and passing
- [ ] Transaction history loads
- [ ] Filters and search work
- [ ] Detail modal shows GPS map
- [ ] Reports generate correctly
- [ ] Charts render with real data
- [ ] Export works (PDF/CSV)

---

## Final Notes

- All components are props-based and ready to integrate
- Focus on backend APIs, database schema, and business logic
- Test-driven development ensures quality
- Empty states are critical for good UX
- Components handle loading/error states - wire them up

