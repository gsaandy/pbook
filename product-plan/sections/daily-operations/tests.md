# Test Instructions: Daily Operations

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup.

## User Flow Tests

### Flow 1: Log a Collection (Field Staff)

**Success Path:**

1. Field staff views assigned route and shops
2. Field staff taps shop with pending balance
3. Collection modal opens showing current balance
4. Field staff enters amount and selects payment mode (Cash/UPI/Cheque)
5. Field staff adds optional reference
6. Field staff clicks "Confirm Collection"
7. Expected: Collection saves, balance updates, cash-in-bag increases, success message shown

**Failure Path - Validation:**

1. User enters 0 or negative amount
2. Expected: Validation error, "Amount must be greater than 0"

### Flow 2: Search for Off-Route Shop

**Success Path:**

1. Field staff uses search bar
2. Types shop name not on assigned route
3. Finds shop in search results
4. Taps shop and logs collection
5. Expected: Collection saves successfully even for off-route shop

### Flow 3: Admin Assigns Route

**Success Path:**

1. Admin views Daily Operations
2. Admin clicks "Assign Route" for an employee
3. Admin selects route from dropdown
4. Admin sets date (today or future)
5. Admin clicks "Assign"
6. Expected: Assignment shows in table, employee can see route in their view

## Empty State Tests

- **No route assigned:** Field staff sees "No route assigned today" with helpful message
- **No shops in route:** Shows "No shops in this route"
- **No employees:** Admin sees "No employees yet. Go to Setup to add employees."

## Component Interaction Tests

- Cash in Bag updates immediately after collection
- High balance shops show "High Due!" indicator in red/orange
- Payment mode buttons (Cash/UPI/Cheque) toggle correctly
- GPS location captured in background (mock in tests)
- Search autocomplete shows matching shops as user types

## Edge Cases

- Collecting more than current balance (overpayment)
- Collecting exact balance (balance becomes 0)
- Multiple collections from same shop in one day
- Network error during save (retry mechanism)
