---

# **📄 SOFTWARE REQUIREMENTS SPECIFICATION (SRS)**

**Project Title:** Hisab Pakka

**Product Version:** 1.0.0

**Status:** Final Draft

---

## **1\. 📌 INTRODUCTION**

### **1.1 Purpose**

The purpose of this document is to outline the functional and non-functional requirements for a SaaS-based billing and client management platform. The system is designed to enable freelancers to manage their financial workflows, from tracking work items to generating invoices and automating payment allocations.

### **1.2 Scope**

- **Public Marketing Website:** To attract and onboard new users.
- **Authenticated System Dashboard:** The core workspace for freelancers.
- **Super Admin Panel:** For platform-wide user management and subscription control.
- **Backend API:** A robust Node.js service handling all business logic and data persistence.

### **1.3 Tech Stack**

- **Frontend:** React + Tailwind + Material UI (Dual-app architecture).
- **State Management:** Redux Toolkit (RTK) for centralized global state.
- **Data Fetching:** RTK Query with Axios for optimized API orchestration and caching.
- **Backend:** Node.js with Express framework.
- **Database:** MongoDB (NoSQL) for flexible document storage.
- **Authentication:** JSON Web Tokens (JWT) for secure, stateless sessions.

---

## **2\. 🏗️ SYSTEM ARCHITECTURE**

### **2.1 Project Structure**

root/  
├── system/ (React App: Marketing \+ User Dashboard)  
├── superadmin/ (React App: Administrative Control Panel)  
├── backend/ (Node.js API: Logic, Auth, & DB Operations)

### **2.2 Applications Overview**

- **System App:** Handles the landing page, user registration/login, and the primary dashboard where clients, projects, and invoices are managed.
- **Super Admin App:** A restricted interface for platform owners to monitor usage, manage user accounts, and update subscription plans.
- **Backend:** The central engine managing the MongoDB connection, executing transactional logic, and serving APIs to both frontend applications.

### **2.3 Frontend Architecture**

- **State Management:** Uses Redux Toolkit to manage global UI state (e.g., authentication, sidebar toggles).
- **API Orchestration:** Employs RTK Query for all server-side data interactions. 
- **Custom Base Query:** A custom Axios-based base query is used within RTK Query to handle authentication headers, base URLs, and consistent error handling.
- **Caching & Synchronization:** Leverages RTK Query's built-in caching mechanism to reduce redundant network requests and ensure UI synchronization across components.

---

## **3\. 🧠 CORE CONCEPTUAL FRAMEWORK**

### **3.1 Client Balance System**

The system operates on a real-time ledger logic:

$$Client\\ Balance \= Total\\ Work \- Total\\ Payment \- Total\\ Discount$$  
**Balance Interpretations:**

- **Positive (+) Value:** The client owes money to the freelancer.
- **Negative (-) Value:** The freelancer holds an advance payment for the client.

### **3.2 Event-Driven Impact**

| Event                | Effect on Balance         |
| :------------------- | :------------------------ |
| **Add Work**         | Increases Balance (+)     |
| **Record Payment**   | Decreases Balance (-)     |
| **Apply Discount**   | Decreases Balance (-)     |
| **Generate Invoice** | No Effect (Informational) |

---

## **4\. 🗄️ DATABASE DESIGN (SCHEMA)**

### **4.1 User & Client Models**

- **User:** \_id, name, email (unique), passwordHash, plan, invoiceCounter, createdAt
- **Client:** \_id, userId, name, email, phone, companyName, currentBalance(default 0), createdAt (userId+email unique)

### **4.2 Project & WorkItem Models**

- **Project:** \_id, userId, clientId, title, description, status, createdAt
- **WorkItem:** \_id, userId, clientId, projectId, title, quantity, rate, totalAmount, billed (boolean), createdAt
- **Project.`status`**: (e.g., "Ongoing" or "Finished"). Used to track project lifecycle
- The **WorkItem.`projectId`** acts as the grouping key. All Work Items belong to a specific Project for organized tracking and billing pdf.

### **4.3 Invoice Model**

- **Fields:** \_id, userId, clientId, invoiceNumber, items, totalAmount, discount, finalAmount, paidAmount, dueAmount, status, createdAt
- **Items Array:** Includes workItemId, title, quantity, rate, totalAmount.

### **4.4 Payment Model**

- **Fields:** \_id, userId, clientId, amount, method, note, allocations, createdAt
- **Allocations Array:** Tracks invoiceId and the specific amount applied to it.

---

## **5\. ⚙️ BUSINESS LOGIC & ALGORITHMS**

### **5.1 Add Work Item (Transactional)**

1. Initiate DB Transaction.
2. Calculate amount \= quantity \* rate.
3. Create WorkItem record.
4. Increment client.currentBalance by amount.
5. Commit Transaction.

### **5.2 Intelligent Invoice Generation**

- **Step 1:** Retrieve the most recent invoice for the client.
- **Step 2:** Check if lastInvoice exists AND paidAmount \== 0.
  - **IF TRUE:** Fetch all unbilled WorkItems. Append them to the existing invoice. Recalculate totalAmount, finalAmount, and dueAmount.
  - **IF FALSE:** Fetch all unbilled WorkItems. Sum their amounts. Create a **NEW** invoice record.
- **Step 3:** Set all included WorkItems to billed \= true.

### **5.3 Discount Logic**

- **Rule:** Discounts can only be applied/edited if the invoice paidAmount is zero.
- **Logic:** difference \= newDiscount \- oldDiscount. Update client.currentBalance by subtracting the difference. Update invoice totals accordingly.

### **5.4 Payment Allocation (FIFO Method)**

1. Initiate DB Transaction.
2. Decrease client.currentBalance by the payment amount.
3. Fetch all invoices where status \!= paid, sorted by createdAt (ASC).
4. Loop through invoices:
   - Calculate due \= finalAmount \- paidAmount.
   - Apply either the full due amount or the remaining payment amount (whichever is smaller).
   - Update invoice.paidAmount & Update Invoice.status and record the allocation.
   - Deduct applied amount from remaining payment.
   - Break loop if remaining \== 0.
5. Commit Transaction.

---

## **6\. 🔒 RULES & CONSTRAINTS**

| Entity           | Condition              | Constraint                                  |
| :--------------- | :--------------------- | :------------------------------------------ |
| **Invoice Edit** | paidAmount \> 0        | Locked (Non-editable)                       |
| **Invoice Edit** | paidAmount \= 0        | Editable                                    |
| **Discount**     | status \= partial/paid | Prohibited                                  |
| **Payments**     | General                | Must use FIFO and be strictly transactional |

---

## **7\. 🎨 UI & UX ARCHITECTURE**

### **7.1 Routing**

- **Public:** / (Marketing), /login, /register.
- **Dashboard:** /app/clients, /app/projects, /app/invoices, /app/payments.

### **7.2 Core Pages**

- **🏠 Dashboard:** High-level view of total balance and recent activities.
- **👤 Clients:** List of all clients with real-time balance indicators.
- **🧾 Work Items:** interface to log tasks before they are billed.
- **📄 Invoices:** Management of generated bills and PDF exports.

---

## **8\. 🔐 SECURITY & INTEGRITY**

- **Data Isolation:** Strictly enforce userId checks on every query to ensure users cannot see other users' data.
- **Input Validation:** Sanitize all quantity and rate inputs to prevent financial errors.
- **Transaction Safety:** No financial operation (Work, Payment, Discount) should execute without a database transaction to prevent desynchronization.

---

## **9\. 🚀 FUTURE ENHANCEMENTS**

- Implementation of a Refund/Credit Note system.
- Automated email delivery for invoices.
- Detailed audit logs for all invoice modifications.
- Support for multi-user teams and role-based access.

---
