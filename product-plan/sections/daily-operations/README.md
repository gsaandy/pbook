# Daily Operations

## Overview

Daily Operations handles two workflows: admins assigning routes to employees each morning, and field staff logging collections throughout the day. The interface adapts based on user role.

## Key Functionality

- **Admin:** Assign routes to employees for specific dates
- **Field Staff:** View assigned route and shop list
- **Field Staff:** Log collections with amount and payment mode
- Search for off-route shops for flexible collection
- Real-time cash-in-bag calculation

## User Flows

### Admin: Daily Route Assignment

View today's date and all employees with assignment status, assign routes to employees via dropdown modal, schedule assignments for today or future dates.

### Field Staff: Route Dashboard

View cash in bag (running total), see assigned route details and shop list with pending balances, search for off-route shops.

### Field Staff: Log Collection

Tap shop to open collection form showing current balance, enter amount and select payment mode (Cash/UPI/Cheque), add optional reference/remarks, confirm collection.

## Components Provided

- `DailyOperationsFieldStaff` — Mobile-first collection interface for field staff

## Visual Reference

See `screenshot.png` for the target UI design.
