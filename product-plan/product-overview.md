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

**Core Entities:**

- Organization — The distributor company using PSBook
- Shop — Customer locations where payments are collected
- Employee — Field staff or admin users
- Route — Geographic collection of shops
- RouteAssignment — Daily employee-to-route assignment
- Transaction — Collection events with GPS tracking
- PaymentMode — Cash, UPI, or Cheque
- DailyReconciliation — End-of-day closing records

## Design System

**Colors:**

- Primary: indigo
- Secondary: emerald
- Neutral: slate

**Typography:**

- Heading: Inter
- Body: Inter
- Mono: JetBrains Mono

## Implementation Sequence

Build this product in milestones:

1. **Foundation** — Set up design tokens, data model types, routing structure, and application shell
2. **Setup & Configuration** — Master data management (shops, routes, employees)
3. **Daily Operations** — Route assignment and field collection logging
4. **Admin Dashboard** — Real-time monitoring and employee status
5. **End-of-Day Reconciliation** — Cash verification and daily close
6. **Reports & History** — Transaction history and analytics

Each milestone has a dedicated instruction document in `product-plan/instructions/`.
