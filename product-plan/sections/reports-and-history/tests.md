# Test Instructions: Reports & History

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup.

## User Flow Tests

### Flow 1: View Transaction History

**Success Path:**
1. User views Reports & History page
2. Transaction table loads with last 7 days of data
3. User applies filters (employee, shop, payment mode)
4. User clicks search
5. Expected: Filtered transactions appear, results match criteria

### Flow 2: View Transaction Detail

**Success Path:**
1. User clicks on a transaction row
2. Detail modal opens
3. Expected: Shows GPS location on map, full transaction metadata, before/after balances

### Flow 3: Generate Report

**Success Path:**
1. User selects report type (e.g., "Daily Summary")
2. User chooses date range
3. User clicks "Preview Report"
4. Preview appears
5. User clicks "Export as PDF"
6. Expected: PDF downloads with correct data

### Flow 4: View Audit Trail

**Success Path:**
1. User switches to Audit Trail tab
2. Sees all reconciliation events
3. User filters by "Mismatches only"
4. Expected: Only EOD sessions with variances appear

### Flow 5: Analyze Trends

**Success Path:**
1. User switches to Analytics tab
2. Charts render showing collection trends, employee performance, top shops
3. Expected: Data visualizations are accurate and interactive

## Empty State Tests

- **No transactions:** Shows "No transactions found for selected filters" with clear filters button
- **No results for search:** Shows helpful message with suggestion to adjust search
- **No data for date range:** Shows "No data available for this period"

## Component Interaction Tests

- Date range picker works (defaults to last 7 days, supports custom ranges)
- Quick date options: Today, Yesterday, Last 7 days, Last 30 days
- Filters apply correctly (employee dropdown, shop autocomplete, payment mode checkboxes)
- Search autocomplete suggests transaction IDs and shop names
- Pagination works (50 transactions per page)
- Table sortable by all columns

## Edge Cases

- Very large date range (1 year) with pagination
- Exporting report with 1000+ transactions
- Transaction with missing GPS data
- Historical data from inactive employees/shops
- Filtering by multiple criteria simultaneously

