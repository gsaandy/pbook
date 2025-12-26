# Data Model

## Core Entities

### Organization

The distributor company using PSBook to manage cash collections.

### Shop

Customer locations where field staff collect payments and track outstanding balances.

### Employee

Field staff who visit shops and collect payments, or admin users who manage operations and reconcile end-of-day cash.

### Route

A named, predefined collection of shops grouped together for efficient field operations.

### RouteAssignment

The daily assignment linking an employee to a route for a specific day, enabling admins to plan field operations.

### Transaction

A cash collection event recorded by an employee at a shop, including GPS location, timestamp, amount, and payment mode.

### PaymentMode

The method of payment used for a transaction (Cash, UPI, or Cheque).

### DailyReconciliation

The end-of-day closing record when an employee hands over collected cash to the admin, verifying amounts and closing out the day.

## Relationships

- Organization has many Employees, Shops, and Routes
- Route has many Shops
- Employee can be assigned to a Route via RouteAssignment (daily)
- Transaction belongs to an Employee and a Shop
- Transaction uses a PaymentMode
- DailyReconciliation belongs to an Employee
- DailyReconciliation summarizes multiple Transactions
