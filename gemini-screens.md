Here represent the **User Interface (UI) Wireframes** for the two core user experiences.

I have broken this down into the **Mobile App (Field Staff)** and the **Web Dashboard (Admin)**.

### 1. The Architecture Visualized

Before looking at the screens, here is how the data flows between the two users.

### 2. Employee Mobile View (The "Field" App)

*Design Philosophy:* Big buttons, high contrast, easy to use with one thumb while standing in a busy shop.

#### Screen A: The Home / Route Dashboard

This is what John sees immediately after logging in with Google.

```text
+--------------------------------------------------+
|  ≡  [Avatar] John Doe             🔍 (Search)    |
+--------------------------------------------------+
|  TODAY'S SUMMARY                                 |
|  +--------------------------------------------+  |
|  |  CASH IN BAG (To Deposit)                  |  |
|  |  $ 12,500                                  |  |
|  +--------------------------------------------+  |
|                                                  |
|  YOUR ROUTE: Monday - North Zone                 |
|  (20 Shops Remaining)                            |
+--------------------------------------------------+
|  SHOP LIST                                       |
|                                                  |
|  [ Shop A - Supermarket ]             >          |
|  Pending: $ 5,000                                |
|                                                  |
|  [ Shop B - Kirana Store ]            >          |
|  Pending: $ 1,200                                |
|                                                  |
|  [ Shop C - Bakery ]                  >          |
|  Pending: $ 10,000   (High Due!)                 |
|                                                  |
|  [ Shop D - Tea Stall ]               >          |
|  Pending: $ 500                                  |
|                                                  |
+--------------------------------------------------+
|              (Floating Search Button)            |
+--------------------------------------------------+

```

#### Screen B: The "Collection" Action

What happens when John taps on **Shop A**.

```text
+--------------------------------------------------+
|  < Back     Shop A - Supermarket                 |
+--------------------------------------------------+
|  CURRENT BALANCE                                 |
|  $ 5,000                                         |
+--------------------------------------------------+
|  ENTER COLLECTION                                |
|                                                  |
|  Amount:                                         |
|  [  $ 2,000                    ]                 |
|                                                  |
|  Payment Mode:                                   |
|  [ (o) CASH ]   [ ( ) UPI ]   [ ( ) CHEQUE ]     |
|                                                  |
|  Ref/Remarks (Optional):                         |
|  [ e.g. UTR Number or Note...  ]                 |
|                                                  |
+--------------------------------------------------+
|                                                  |
|           [ CONFIRM COLLECTION ]                 |
|            (Big Green Button)                    |
|                                                  |
+--------------------------------------------------+

```

**UX Notes for Developers:**

* **Search Bar (Top Right):** This solves your "Flexibility" requirement. If John needs to visit a shop not on this list, he taps Search -> Types "Shop Z" -> Collects money.
* **Cash in Bag:** This number updates *instantly* when he saves a cash entry. This is his source of truth.

---

### 3. Admin Web Dashboard (Desktop View)

*Design Philosophy:* Dense information, focus on verification and reconciliation.

#### Screen C: The EOD Reconciliation Center

This is the screen the Admin uses at 6:00 PM when drivers return.

```text
+-----------------------------------------------------------------------+
|  LOGO  |  Dashboard  |  Routes  |  Shops  |  Users  |      [Logout]   |
+-----------------------------------------------------------------------+
|                                                                       |
|  Daily Reconciliation: 25th Dec 2025                                  |
|                                                                       |
|  LIVE STATUS                                                          |
|  +-----------------+  +-----------------+  +-----------------+        |
|  | Total Collected |  | Cash (In Hand)  |  | Digital / UPI   |        |
|  | $ 150,000       |  | $ 100,000       |  | $ 50,000        |        |
|  +-----------------+  +-----------------+  +-----------------+        |
|                                                                       |
|  EMPLOYEE SETTLEMENT                                                  |
|                                                                       |
|  Name           | Route         | Cash (Expected) | Status            |
|  -------------------------------------------------------------------  |
|  1. John Doe    | Mon-North     | $ 12,500        | [ VERIFY ] button |
|  2. Sarah Smith | Mon-South     | $ 8,200         | [ VERIFY ] button |
|  3. Mike Jones  | Special Del   | $ 0             | CLOSED            |
|                                                                       |
+-----------------------------------------------------------------------+

```

#### Screen D: The "Verify" Modal

What happens when Admin clicks **[ VERIFY ]** for John Doe.

```text
+---------------------------------------------------------------+
|  VERIFY CASH HANDOVER - JOHN DOE                              |
+---------------------------------------------------------------+
|                                                               |
|  System Logic:                                                |
|  John has logged 12 transactions today.                       |
|                                                               |
|  EXPECTED CASH IN BAG:                                        |
|  $ 12,500                                                     |
|                                                               |
|  -----------------------------------------------------------  |
|                                                               |
|  Step 1: Count the physical cash given by John.               |
|                                                               |
|  Step 2: Does it match?                                       |
|                                                               |
|  [ YES, MATCHES ]           [ NO, MISMATCH ]                  |
|  (Closes the Day)           (Opens Adjustment Box)            |
|                                                               |
|  -----------------------------------------------------------  |
|  Transaction Log (Reference):                                 |
|  - 10:00 AM | Shop A | $2000 | Cash                         |
|  - 10:30 AM | Shop B | $500  | UPI (Ignored for Cash Count) |
|  ...                                                          |
+---------------------------------------------------------------+

```

### 4. Color & Interaction Coding

To keep the development simple, use standard color logic:

* **Green:** Money coming in / Successful Save.
* **Red:** Outstanding Balance (High) / Error.
* **Blue:** Informational (UPI/Cheque transactions).
* **Grey:** Disabled / Closed entries.
