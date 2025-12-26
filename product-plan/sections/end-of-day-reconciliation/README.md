# End-of-Day Reconciliation

## Overview

Cash handover verification and daily closing workflow where admins reconcile physical cash received from field staff against system-calculated expected amounts. Designed for speed and accuracy to complete reconciliation in under 5 minutes per employee.

## Key Functionality

- View EOD summary with expected cash and digital payments
- Verify cash handover for each employee
- Handle matching cash (confirm and close)
- Handle mismatches (enter actual amount and mandatory note)
- Progress tracking (X of Y employees verified)

## User Flows

### View EOD Summary
See date selector and live status cards (Total Collected, Cash Expected, Digital Payments), view employee settlement table.

### Verify Cash Handover
Click "Verify" for an employee, review system-calculated expected cash, see transaction log as reference, confirm match or report mismatch.

### Handle Matching Cash
Click "Yes, Matches" to close the day for that employee.

### Handle Cash Mismatch
Click "No, Mismatch", enter actual cash received, system calculates variance, add mandatory note, save with mismatch flag.

## Components Provided

- `EndOfDayReconciliation` — Cash verification workflow with match/mismatch handling

## Visual Reference

See `screenshot.png` for the target UI design.
