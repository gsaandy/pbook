# Test Instructions: Admin Dashboard

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup.

## User Flow Tests

### Flow 1: View Live Dashboard

**Success Path:**

1. Admin navigates to dashboard
2. Dashboard loads with three metric cards
3. Employee status table shows all active employees
4. Expected: Metrics show correct totals, last updated timestamp is recent

**Auto-Refresh:**

1. Dashboard loads
2. Wait 30 seconds
3. Expected: Data refreshes automatically, timestamp updates

### Flow 2: View Employee Detail

**Success Path:**

1. Admin clicks on employee row
2. Detail modal opens showing transaction log
3. Modal shows all transactions with timestamps, shops, amounts
4. Expected: Running cash-in-hand calculation is correct, GPS locations shown on map

### Flow 3: Manual Refresh

**Success Path:**

1. Admin clicks refresh button
2. Expected: Data reloads, loading indicator shows briefly, updated data appears

## Empty State Tests

- **No collections today:** Shows "No collections logged today yet" with encouraging message
- **Employee with no collections:** Shows 0 in collections column, gray status dot

## Component Interaction Tests

- Table is sortable by name, route, collections, cash, last activity
- Status dots: Green (active today), Gray (no assignment), Red (no activity 2+ hours)
- Last Activity shows relative time ("5 minutes ago", "2 hours ago")
- Transaction detail modal closes on outside click or X button
- Metrics format currency correctly (INR format)

## Edge Cases

- Dashboard with 1 employee and 50+ employees
- Employee with 100+ transactions (scrollable list in modal)
- Very recent activity (shows "Just now")
- Employee assigned but hasn't collected anything yet
