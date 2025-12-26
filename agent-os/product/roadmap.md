# Product Roadmap: Cash Collection & Reconciliation System (MVP)

## Overview

This roadmap outlines the phased development plan for the Cash Collection & Reconciliation System MVP. Features are prioritized based on the core philosophy: **Simplicity over complexity**. We focus on tracking **Balances** and **Cash Movement**, not individual invoices.

---

## Phase 1: Foundation & Authentication (Weeks 1-2)

### Goal
Establish the foundation with authentication, user management, and basic data structures.

### Features

#### 1.1 Authentication & User Management
- **Priority**: Critical
- **Tasks**:
  - Clerk authentication integration
  - User session management
  - Role-based access control (Admin/Employee)
  - Employee registration by admin (Email or Clerk user ID)
  - Login/logout flows
  - Protected route middleware
  - User profile management

#### 1.2 Database Schema Setup
- **Priority**: Critical
- **Tasks**:
  - Convex schema definition
  - Shops table (name, address, phone, currentBalance)
  - Routes table (name, description)
  - Employees table (name, email, clerkUserId, role, isActive)
  - Transactions table (amount, paymentMode, shopId, employeeId, timestamp, gpsLocation, remarks)
  - Route-Shop mapping table
  - Daily assignments table (employeeId, routeId, date)
- **Rationale**: Simple schema focused on balances and cash movement

### Deliverables
- ✅ Clerk authentication working
- ✅ User roles and permissions configured
- ✅ Database schema deployed

### Success Criteria
- Users can login with Clerk (Email, OAuth, etc.)
- Admin and Employee roles are enforced
- Database schema supports all MVP requirements

---

## Phase 2: Master Data Management (Weeks 3-4)

### Goal
Enable admins to manage shops, routes, and daily assignments.

### Features

#### 2.1 Shop Management (Admin Only)
- **Priority**: Critical
- **Tasks**:
  - Create/Edit shops (Name, Address, Phone)
  - Shop list view with search
  - **Manual Balance Adjustment**: Admin can add/subtract balance (e.g., when new stock is delivered)
  - Current balance display
  - Shop detail view

#### 2.2 Route Management (Admin Only)
- **Priority**: Critical
- **Tasks**:
  - Create/Edit routes (Name, Description)
  - Route list view
  - **Map Shops to Routes**: Assign shops to specific routes
  - Route detail view showing assigned shops
  - Remove shops from routes

#### 2.3 Daily Assignment (Admin Only)
- **Priority**: Critical
- **Tasks**:
  - Assign Employee to Route for a specific date
  - View today's assignments
  - View assignment history
  - Edit/cancel assignments (before day starts)

### Deliverables
- ✅ Admin can manage shops and balances
- ✅ Admin can create routes and assign shops
- ✅ Admin can assign employees to routes daily

### Success Criteria
- Admin can add/edit shops and adjust balances
- Admin can create routes and map shops
- Admin can assign employees to routes for the day

---

## Phase 3: Field Collection Workflow (Weeks 5-6)

### Goal
Enable field staff to log collections quickly and efficiently.

### Features

#### 3.1 Employee Dashboard
- **Priority**: Critical
- **Tasks**:
  - Display assigned route for today
  - List shops in assigned route with current balance
  - Quick access to collection form
  - **Cash in Hand** counter display (real-time)

#### 3.2 Global Search (Flexibility Rule)
- **Priority**: High
- **Tasks**:
  - Search bar to find any shop in system
  - Search by shop name or phone
  - Results show shop name and current balance
  - Allow collection from shops not on assigned route
- **Rationale**: Flexibility for field staff to handle unexpected collections

#### 3.3 Collection Logging
- **Priority**: Critical
- **Tasks**:
  - Collection form with fields:
    - Shop (selected from route or search)
    - Amount (numeric input)
    - Payment Mode (Dropdown: Cash / UPI / Cheque)
    - Remarks (Optional text field)
  - GPS Location capture (optional, browser-based)
  - Form validation
  - **Immediate Effect**:
    - Shop Balance decreases by Amount
    - Employee's "Cash in Hand" increases (if Mode = Cash)
    - Transaction recorded with timestamp
  - Success confirmation
  - Quick collection flow (<30 seconds)

#### 3.4 Transaction History (Employee View)
- **Priority**: Medium
- **Tasks**:
  - View own transactions for today
  - Filter by shop or payment mode
  - Transaction details (amount, mode, shop, time, remarks)
  - **Negative Entry Support**: Allow negative amount entry for reversals
  - Highlight negative entries for admin review

### Deliverables
- ✅ Employees can view assigned route
- ✅ Employees can search and collect from any shop
- ✅ Employees can log collections quickly
- ✅ Real-time balance updates

### Success Criteria
- Employee can log collection in <30 seconds
- Shop balance updates immediately
- Cash in Hand counter updates for cash transactions
- Negative entries are supported for reversals

---

## Phase 4: Reconciliation & EOD Workflow (Weeks 7-8)

### Goal
Enable admins to reconcile physical cash against digital entries at end of day.

### Features

#### 4.1 Admin Live Dashboard
- **Priority**: Critical
- **Tasks**:
  - View total collections made today by all employees
  - Summary cards:
    - Total Cash Collected (across all employees)
    - Total Digital/Cheque Collected
    - Number of transactions today
    - Active employees today
  - Real-time updates

#### 4.2 EOD Settlement Workflow
- **Priority**: Critical
- **Tasks**:
  - Admin selects an Employee
  - System displays:
    - **"Total Cash to Collect: $X"** (Sum of all 'Cash' mode transactions for that day)
    - **"Total Digital/Cheque: $Y"** (For reference only)
    - List of all transactions for that employee today
    - Transaction breakdown by payment mode
  - Admin counts physical cash
  - Admin enters physical cash amount
  - System shows difference (if any)
  - **"Verify & Close Day"** button
  - Confirmation dialog

#### 4.3 Day Closure & Locking
- **Priority**: Critical
- **Tasks**:
  - When admin clicks "Verify & Close Day":
    - All transactions for that employee for that date become **Read-Only** (Immutable)
    - Employee's cash in hand resets to 0
    - Day marked as "Closed" in system
  - Prevent modifications to closed transactions
  - Visual indicator for closed days
  - Admin can view closed days but cannot modify

#### 4.4 Audit Trail
- **Priority**: High
- **Tasks**:
  - Every transaction records:
    - Timestamp
    - User (Employee)
    - Shop
    - Amount
    - Payment Mode
    - GPS Location (if available)
    - Remarks
  - View transaction history by employee, shop, or date
  - Export transaction data (CSV)

### Deliverables
- ✅ Admin can view live collection dashboard
- ✅ Admin can reconcile and close employee days
- ✅ Closed transactions are immutable
- ✅ Complete audit trail maintained

### Success Criteria
- EOD reconciliation takes <5 minutes per employee
- Closed transactions cannot be modified
- All transactions have complete audit trail
- Cash reconciliation matches digital records

---

## Phase 5: Polish & Optimization (Weeks 9-10)

### Goal
Improve user experience, performance, and add essential polish.

### Features

#### 5.1 UI/UX Improvements
- **Priority**: High
- **Tasks**:
  - Mobile-first responsive design optimization
  - Loading states and skeleton screens
  - Error handling and user-friendly messages
  - Confirmation dialogs for critical actions
  - Touch-optimized inputs and buttons
  - Keyboard navigation support
  - Accessibility improvements (WCAG 2.1 AA)

#### 5.2 Performance Optimization
- **Priority**: High
- **Tasks**:
  - Page load time optimization (<2 seconds on 4G)
  - Convex query optimization
  - Lazy loading for large lists
  - Image optimization
  - CSS purging (Tailwind)
  - PWA caching for faster subsequent loads

#### 5.3 Offline Detection (Phase 2 Prep)
- **Priority**: Medium
- **Tasks**:
  - Detect internet connectivity loss
  - Show warning banner when offline
  - Queue transactions for sync when online
  - UI indicators for connection status
- **Note**: Full offline support is Phase 2, but UI should prepare for it

#### 5.4 Data Validation & Error Handling
- **Priority**: High
- **Tasks**:
  - Input validation for all forms
  - Decimal precision for amounts
  - Prevent negative balances (with warning)
  - Handle edge cases gracefully
  - User-friendly error messages

### Deliverables
- ✅ Polished, responsive UI
- ✅ Optimized performance (<2s page loads)
- ✅ Offline detection working
- ✅ Comprehensive error handling

### Success Criteria
- Page load times under 2 seconds on 4G
- Zero calculation errors
- Graceful error handling
- Mobile-first design fully implemented

---

## Phase 6: Testing & Launch Prep (Weeks 11-12)

### Goal
Ensure quality and prepare for production launch.

### Features

#### 6.1 Testing
- **Priority**: Critical
- **Tasks**:
  - Unit tests for balance calculations
  - Integration tests for workflows
  - End-to-end tests for critical paths
  - Performance testing
  - Security testing
  - User acceptance testing with real field staff

#### 6.2 Documentation
- **Priority**: High
- **Tasks**:
  - User guide for field staff
  - Admin manual
  - API documentation
  - Deployment guide

#### 6.3 Launch Preparation
- **Priority**: Critical
- **Tasks**:
  - Production environment setup
  - Data migration plan (if needed)
  - User training materials
  - Support plan
  - Monitoring and logging setup

### Deliverables
- ✅ Comprehensive test coverage
- ✅ Complete documentation
- ✅ Production-ready application
- ✅ Launch plan

### Success Criteria
- 80%+ test coverage
- All critical workflows tested
- Documentation complete
- Ready for production launch

---

## Future Considerations (Post-MVP)

### Phase 2: Offline Support
- Full offline capability for field staff
- Background sync when connection restored
- Offline-first data strategy

### Phase 3: Enhanced Features
- Photo uploads for proof of payment
- SMS/WhatsApp notifications
- Advanced reporting and analytics
- Trend analysis and insights

### Phase 4: Integrations
- Accounting system integration
- Inventory management integration
- Payment gateway integration

---

## Prioritization Framework

### Priority Levels
- **Critical**: Must have for MVP, blocks other features
- **High**: Important for MVP, significant user value
- **Medium**: Valuable enhancement, can be post-MVP
- **Low**: Nice to have, future consideration

### Dependencies
- Authentication must be completed before any other features
- Shop/Route management must be done before collection workflow
- Collection workflow must be working before reconciliation
- EOD workflow must be implemented before launch

### Risk Mitigation
- **Technical Risks**: Early prototyping of complex features (OAuth, balance calculations)
- **User Adoption**: Early user feedback sessions with field staff
- **Performance**: Load testing early, optimization throughout
- **Data Integrity**: Comprehensive testing of balance calculations

---

## Success Metrics by Phase

### Phase 1
- Clerk authentication success rate > 95%
- Database schema supports all requirements

### Phase 2
- Admin can manage all master data successfully
- Daily assignments working correctly

### Phase 3
- Employee can log collection in <30 seconds
- Zero calculation errors in balance updates

### Phase 4
- EOD reconciliation takes <5 minutes per employee
- 100% transaction accuracy

### Phase 5
- Page load time < 2 seconds (95th percentile)
- Zero critical bugs

### Phase 6
- 80%+ test coverage
- Ready for production launch

---

**Last Updated**: [Current Date]  
**Status**: Active Planning  
**Next Review**: End of Phase 1
