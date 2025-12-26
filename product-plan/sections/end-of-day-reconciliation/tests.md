# Test Instructions: End-of-Day Reconciliation

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup.

## User Flow Tests

### Flow 1: Verify Matching Cash

**Success Path:**

1. Admin clicks "Verify" button for employee
2. Verification modal shows expected cash amount
3. Admin reviews transaction log
4. Admin clicks "Yes, Matches"
5. Expected: Employee marked as verified, status changes to "Closed", timestamp recorded

### Flow 2: Handle Cash Mismatch

**Success Path:**

1. Admin clicks "Verify" button for employee
2. Admin clicks "No, Mismatch"
3. Mismatch form appears
4. Admin enters actual cash received
5. System calculates variance (shows overage in green or shortage in red)
6. Admin enters mandatory note explaining discrepancy
7. Admin clicks "Save"
8. Expected: Employee marked with mismatch status, variance and note recorded for audit

**Failure Path - Validation:**

1. Admin clicks "No, Mismatch"
2. Admin tries to save without entering note
3. Expected: Validation error, "Note is required for mismatches"

### Flow 3: Complete Daily Close

**Success Path:**

1. Admin verifies all employees
2. Progress indicator shows "5 of 5 employees verified"
3. Expected: Completion summary appears, option to generate EOD report

## Empty State Tests

- **No field staff worked today:** Shows "No field staff worked today"
- **All employees already verified:** Shows completion message

## Component Interaction Tests

- Progress indicator updates as each employee is verified
- Verification button disabled after employee is closed
- Variance calculation: Actual - Expected, positive = overage (green), negative = shortage (red)
- Transaction log in modal is scrollable
- Confirmation dialog appears before saving mismatch

## Edge Cases

- Verifying the same employee twice (button should be disabled)
- Large variance (₹1000+ shortage/overage)
- Historical EOD sessions (view past dates)
- Employee with 0 expected cash (digital payments only)
