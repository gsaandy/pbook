# Section Implementation Prompt

## Define Section Variables

- **Admin Dashboard** = [Human-readable name, e.g., "Setup & Configuration" or "Daily Operations"]
- **admin-dashboard** = [Folder name in sections/, e.g., "setup-and-configuration" or "daily-operations"]
- **02** = [Milestone number, e.g., "02" or "03" — sections start at 02 since 01 is Foundation]

---

I need you to implement the **Admin Dashboard** section of my application.

## Instructions

Please carefully read and analyze the following files:

1. **@product-plan/product-overview.md** — Product summary for overall context
2. **@product-plan/instructions/incremental/02-admin-dashboard.md** — Specific instructions for this section

Also review the section assets:
- **@product-plan/sections/admin-dashboard/README.md** — Feature overview and design intent
- **@product-plan/sections/admin-dashboard/tests.md** — Test-writing instructions (use TDD approach)
- **@product-plan/sections/admin-dashboard/components/** — React components to integrate
- **@product-plan/sections/admin-dashboard/types.ts** — TypeScript interfaces
- **@product-plan/sections/admin-dashboard/sample-data.json** — Test data

## Before You Begin

Please ask me clarifying questions about:

1. **Authentication & Authorization** (if not yet established)
   - How should users authenticate?
   - What permissions are needed for this section?

2. **Data Relationships**
   - How does this section's data relate to other entities?
   - Are there any cross-section dependencies?

3. **Integration Points**
   - How should this section connect to existing features?
   - Any API endpoints already built that this should use?

4. **Backend Business Logic**
   - Any server-side logic, validations or processes needed beyond what's shown in the UI?
   - Background processes, notifications, or other processes to trigger?

5. **Any Other Clarifications**
   - Questions about specific user flows in this section
   - Edge cases that need clarification

## Implementation Approach

Use test-driven development:
1. Read the `tests.md` file and write failing tests first
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

Lastly, be sure to ask me if I have any other notes to add for this implementation.

Once I answer your questions, proceed with implementation.
