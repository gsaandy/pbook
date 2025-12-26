# Product Requirements Document (PRD)

**Project Name:** Cash Collection & Reconciliation System (MVP)
**Version:** 1.0
**Status:** Final Draft

## 1. Executive Summary

A lightweight web-based application designed to digitize the "Last Mile" cash collection process for food product distributors. The system replaces paper logbooks and WhatsApp messages with a digital ledger, allowing field staff to record collections in real-time and administrators to reconcile physical cash against digital entries at the end of the day.

**Core Philosophy:** Simplicity over complexity. We are tracking **Balances** and **Cash Movement**, not individual invoices or GST compliance.

---

## 2. User Personas

| Role | Description | Key Goal |
| --- | --- | --- |
| **Field Staff (Employee)** | Drivers/Salesmen visiting shops. | Quickly log cash collection with minimal clicks. |
| **Admin (Manager)** | Office staff managing operations. | Assign routes, track live cash-in-hand, and verify EOD cash handover. |

---

## 3. Functional Requirements

### 3.1 Authentication & User Management

* **Google OAuth:** Single Sign-On (SSO) using Google Accounts. No local password management.
* **Role Management:** Users are assigned roles: `Admin` or `Employee`.

### 3.2 Master Data Management (Admin Only)

* **Manage Shops:**
* Add/Edit Shop details (Name, Address, Phone).
* **Manage Balances:** Admin can manually adjust the "Current Balance" (e.g., adding value when new stock is delivered).


* **Manage Routes:** Create named routes (e.g., "Monday - North", "Tuesday - South").
* **Map Shops to Routes:** Assign specific shops to specific routes.
* **Daily Assignment:** Admin assigns an Employee to a Route for the day.

### 3.3 The "Field" Workflow (Employee View)

* **Dashboard:** Displays the "Assigned Route" list for the day.
* **Global Search (Flexibility Rule):** A search bar allows the employee to find *any* shop in the system (even if not on their assigned route) and collect payment.
* **Shop Detail:** Displays Shop Name and **Current Pending Balance**.
* **Log Collection:**
* Input Fields: `Amount`, `Payment Mode` (Dropdown: Cash / UPI / Cheque), `Remarks` (Optional).
* **Validation:** System accepts the entry.
* **Immediate Effect:**
1. Shop Balance decreases by the Amount.
2. Employee's "Cash in Hand" increases (if Mode = Cash).





### 3.4 The "Reconciliation" Workflow (Admin View)

* **Live Dashboard:** View total collections made today by all employees.
* **EOD Settlement:**
* Admin selects an Employee.
* System displays: **"Total Cash to Collect: $X"** (Sum of all 'Cash' mode transactions for that day).
* System displays: **"Total Digital/Cheque: $Y"** (For reference).


* **Closure Action:**
* Admin counts physical cash.
* If matches, Admin clicks **"Verify & Close Day"**.
* **Locking:** All transactions for that employee for that date become **Read-Only** (Immutable).



---

## 4. Data Logic & Rules

### 4.1 The "Bucket" Balance Logic

* We do not track Invoice IDs.
* **Logic:** `Shop Balance = (Previous Balance) + (New Stock Value) - (Total Collections)`.
* *Note:* "New Stock Value" is manually added by Admin as a simplified step in the MVP.

### 4.2 Payment Modes

* **Cash:** Increases the "Cash in Hand" counter. Must be physically reconciled.
* **UPI / Cheque:** Reduces Shop Balance but does *not* increase "Cash in Hand". These are treated as "Digital verifications" and do not require physical handover at EOD.

### 4.3 Data Integrity

* **No Deletions:** Employees cannot delete an entry once saved. They can only add a "Negative Entry" (reversal) if they made a mistake, which highlights it for the Admin.
* **Audit Trail:** Every transaction records `Timestamp`, `User`, `Shop`, and `GPS Location` (optional, browser-based).

---

## 5. Non-Functional Requirements

* **Platform:** Web Application (Responsive). Must look like a Native App on mobile browsers.
* **Performance:** Pages must load in <2 seconds on 4G networks.
* **Offline Tolerance:** (Phase 2 feature, but UI should warn if internet is lost).
* **Security:** All endpoints protected by Token Authentication (via Google Auth).

---

## 6. Success Metrics (KPIs)

1. **Zero Manual Math:** Employees never need to calculate totals; the app does it.
2. **EOD Time:** Reconciliation process takes <5 minutes per employee.
3. **Adoption:** 100% of cash collections are logged in the app before physical handover.

---

## 7. Out of Scope (For MVP)

* GST Calculation / Tax Reporting.
* Photo Uploads (Proof of payment).
* Inventory Management (SKU level tracking).
* SMS/WhatsApp automated notifications to customers.
