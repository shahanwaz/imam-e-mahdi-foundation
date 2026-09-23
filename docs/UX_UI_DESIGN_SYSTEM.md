# UX Architecture & Unified Design System
## Imam E Mahdi Foundation Digital Operating System (IMF-DOS)

**Document Version:** 1.0.0  
**Status:** Approved UX/UI Specification  
**Design System Name:** "Noor" Enterprise Design System (نور - Radiance & Clarity)  
**Lead Agent:** UX/UI Design Agent  

---

## 1. Design System Philosophy & Core Tokens

The **Noor Design System** embodies spiritual dignity, institutional trust, humanitarian warmth, modern minimalism, and strict accessibility (WCAG 2.1 AAA). It ensures seamless visual and functional unity across the **Public Website**, **Donor Portal**, **Volunteer Portal**, and **NGO Admin ERP**.

```
+---------------------------------------------------------------------------------------------------+
|                                  THE NOOR DESIGN SYSTEM TOKENS                                    |
+---------------------------------------------------------------------------------------------------+
|  Primary Brand: Deep Emerald Green (`#0B462D`)   |  Secondary Brand: Imperial Gold (`#C59A4E`)    |
|  Surface Warm:  Ivory Alabaster (`#FDFBF7`)      |  Surface Dark:   Slate Emerald (`#0A100D`)     |
|  Latin Font:    Outfit / Plus Jakarta Sans       |  Arabic Script:  Amiri / Noto Naskh Arabic     |
|  Border Radius: 12px (Cards) / 8px (Controls)    |  Shadows:        Soft Layered Ambient Blur     |
+---------------------------------------------------------------------------------------------------+
```

### 1.1 Color Palette & CSS Variables
```css
:root {
  /* Brand Primary: Deep Emerald */
  --color-primary-50:  #E8F3EE;
  --color-primary-100: #C5E3D5;
  --color-primary-200: #9ECFBA;
  --color-primary-500: #147A50;
  --color-primary-700: #0B462D; /* Primary Brand Base */
  --color-primary-800: #083623;
  --color-primary-900: #052417;

  /* Brand Secondary: Imperial Gold */
  --color-accent-50:   #FAF6EC;
  --color-accent-100:  #F2E7CB;
  --color-accent-200:  #E5D19E;
  --color-accent-500:  #C59A4E; /* Accent Gold Base */
  --color-accent-700:  #94702E;
  --color-accent-900:  #5C441A;

  /* Neutrals & Surfaces */
  --color-surface-bg:      #FDFBF7; /* Warm Ivory Alabaster */
  --color-surface-card:    #FFFFFF;
  --color-surface-muted:   #F3F4F6;
  --color-surface-border:  #E5E7EB;
  --color-text-primary:    #111827; /* Charcoal Slate */
  --color-text-secondary:  #4B5563;
  --color-text-muted:      #9CA3AF;

  /* Semantics */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger:  #EF4444;
  --color-info:    #3B82F6;

  /* Layout & Geometry */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px 0 rgba(11, 70, 45, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(11, 70, 45, 0.08), 0 2px 4px -2px rgba(11, 70, 45, 0.05);
  --shadow-lg: 0 10px 15px -3px rgba(11, 70, 45, 0.10), 0 4px 6px -4px rgba(11, 70, 45, 0.05);
}
```

### 1.2 Typography & Bi-Directional Hierarchy
* **Display & Hero**: *Outfit* / *Plus Jakarta Sans* (Weight: 700 / 800)
* **Body & Data Tables**: *Inter* (Weight: 400 / 500 / 600)
* **Arabic & Urdu Calligraphy**: *Amiri* / *Noto Naskh Arabic* (Full RTL rendering with native ligatures)
* **Type Scale**:
  * `Display 2XL`: 48px / Line-height: 56px (Hero headers)
  * `Heading XL`: 36px / Line-height: 44px (Page titles)
  * `Heading LG`: 24px / Line-height: 32px (Section headers, Modal titles)
  * `Heading MD`: 18px / Line-height: 26px (Card titles, Table headers)
  * `Body Base`: 15px / Line-height: 22px (Standard text, inputs)
  * `Body Small`: 13px / Line-height: 18px (Meta info, badges, tooltips)
  * `Caption`: 11px / Line-height: 14px (Micro-labels, timestamps)

---

## 2. Reusable Component Specifications

Every application interface is composed exclusively from these standardized design primitives:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 REUSABLE COMPONENT ECOSYSTEM                                     │
├─────────────────────────────────┬────────────────────────────────┬───────────────────────────────┤
│ 1. ACTIONS & CONTROLS           │ 2. DATA DISPLAY & SURFACES     │ 3. FEEDBACK & STATES          │
│ • Button (Primary, Gold, Ghost) │ • DataTable with Filter Drawer │ • Skeleton Shimmer Loaders    │
│ • Input (Floating label, Icon)  │ • Metric Stat Card with Trend  │ • Contextual Empty States     │
│ • Amount Preset Selector        │ • Cause Card with Thermometer  │ • Danger Confirmation Dialogs │
│ • Currency / Fund Type Toggle   │ • Beneficiary Dossier Card     │ • Toast Notification Alerts   │
│ • Tabs (Underline & Pill)       │ • Volunteer Verifiable ID Card │ • Unverified Legal Badges     │
└─────────────────────────────────┴────────────────────────────────┴───────────────────────────────┘
```

### 2.1 Button Variants & States
* **Primary Emerald (`.btn-primary`)**: Deep Emerald background (`#0B462D`), white text, subtle gold hover ring. Used for primary CTAs ("Donate Now", "Approve Aid", "Save Voucher").
* **Secondary Gold (`.btn-gold`)**: Imperial Gold background (`#C59A4E`), deep green text, glowing hover. Used for key conversion highlights ("Sponsor an Orphan", "Download 80G").
* **Outline / Ghost (`.btn-outline`)**: Transparent background, 1.5px slate border, dark text, emerald hover background.
* **Destructive (`.btn-danger`)**: Crimson background (`#EF4444`), white text. Used for revoking permissions, deleting drafts.
* **Loading State**: Automatically disables interaction, preserves button dimensions, and renders a centered spinner.

### 2.2 Form Controls & Input Fields
* **Floating Label Inputs**: Crisp borders, emerald focus ring (`#0B462D`), inline error validation messages.
* **Quick Amount Selector**: Pill group (`₹1,000`, `₹2,500`, `₹5,000`, `₹10,000`, `Custom`) with real-time impact explanation (e.g. "₹2,500 provides a 1-month family ration kit").
* **Fund Category Segmented Switch**: Quick toggle between **Zakat**, **Sadaqah**, **Khums**, and **General Aid**.
* **File Dropzone**: Drag-and-drop zone with MIME-type restriction, upload progress bar, and instant image thumbnail preview.

### 2.3 DataTables & Administrative Lists
* **Unified DataTable Anatomy**:
  1. *Top Bar*: Global debounced search, quick filter pills, date range picker, column visibility selector, CSV/PDF export button.
  2. *Header Row*: Sortable columns with directional indicators, select-all checkbox.
  3. *Body Rows*: High-density rows with alternating subtle stripes, hover highlight, quick action icon buttons (View, Edit, Verify, Print).
  4. *Footer Bar*: Pagination controls, total record count, page size selector (10, 25, 50, 100).

### 2.4 Metric & Visual Cards
* **Executive Metric Card**: Numerical value (28px bold), percentage trend delta indicator (+14% vs last month), icon container with emerald/gold background, sparkline chart.
* **Campaign Progress Card**: Cover photograph with category badge overlay, title, truncated description, real-time fundraising progress bar (Emerald with Gold gradient), raised vs target amount, "Donate Now" trigger.

### 2.5 Modals, Drawers & Confirmation Dialogs
* **Action Modal**: Centered dialog with backdrop blur (`backdrop-blur-md`), sticky header with close button, scrollable body, and action footer.
* **Slide-Over Drawer**: Right-anchored drawer (600px width) for complex forms (e.g. Beneficiary Intake, Voucher Creation) without losing page context.
* **Double-Confirmation Dialog**: Required for financial posting, aid rejection, or user suspension: explicit requirement to type "CONFIRM" or click a delayed 3-second button.

### 2.6 States Architecture (Zero Blank Screens)
* **Loading Skeletons**: Tailored shimmer shapes matching the exact geometry of cards, tables, and metric blocks.
* **Cultivated Empty States**: Centered illustration, encouraging headline (e.g. "No pending aid applications"), descriptive subtitle, and direct primary CTA.
* **Verification & Trust Badges**:
  * `VERIFIED 80G RECEIPT` — Green badge with shield check icon.
  * `⚠️ REQUIRES ORGANIZATIONAL / CA / CS / LEGAL VERIFICATION` — Amber warning pill with info tooltip.

---

## 3. Comprehensive Information Architecture & Sitemap

```
                                    +-----------------------------------+
                                    |     IMF-DOS PLATFORM SITEMAP      |
                                    +-----------------+-----------------+
                                                      |
         +--------------------+-----------------------+-----------------------+--------------------+
         |                    |                       |                       |                    |
+--------v--------+  +--------v--------+     +--------v--------+     +--------v--------+  +--------v--------+
|  PUBLIC PORTAL  |  |  DONOR PORTAL   |     | VOLUNTEER HUB   |     |  MEMBER PORTAL  |  |  NGO ADMIN ERP  |
+--------+--------+  +--------+--------+     +--------+--------+     +--------+--------+  +--------+--------+
         |                    |                       |                       |                    |
         |-- / (Home)         |-- /dashboard          |-- /dashboard          |-- /dashboard       |-- /dashboard (KPIs)
         |-- /about           |-- /donations          |-- /opportunities      |-- /profile         |-- /donations
         |-- /causes          |-- /tax-80g            |-- /log-hours          |-- /dues-renewal    |-- /campaigns
         |-- /stories         |-- /pledges            |-- /id-card            |-- /resolutions     |-- /beneficiaries
         |-- /zakat-calc      |-- /impact-feed        |-- /certificates       |-- /agm-notices     |-- /projects
         |-- /leadership      |-- /profile            |-- /profile                                 |-- /finance (Ledger)
         |-- /compliance                                                                           |-- /hr-payroll
         |-- /contact                                                                              |-- /events
         |-- /verify/:id                                                                           |-- /communication
                                                                                                   |-- /compliance-vault
                                                                                                   |-- /analytics
                                                                                                   |-- /ai-tools
                                                                                                   |-- /settings
```

---

## 4. End-to-End User Journeys & Workflows

### 4.1 Donor Giving & 80G Receipt Workflow
```
[ Public Homepage / Cause Card ]
      │ Click "Donate Now"
      ▼
[ Instant Donation Drawer / Page ]
      │ 1. Select Amount (₹1,000 / Custom) & Fund Type (Zakat / Sadaqah / General)
      │ 2. Enter Donor Details (Name, Email, Phone, PAN for 80G exemption)
      │ 3. Select Payment Gateway (Razorpay UPI / Cards / Stripe / NetBanking)
      ▼
[ Payment Gateway Modal ]
      │ Complete UPI Pin / OTP verification
      ▼
[ Thank You & Instant Impact Confirmation ]
      ├── Instant Confetti & Donation Success Banner
      ├── One-Click Download: Official Vector 80G Tax Receipt (with HMAC QR)
      ├── Option to "Create Donor Account" in 1-click via magic link
      └── Automated WhatsApp / SMS Receipt Dispatch to Donor Phone
```

### 4.2 Beneficiary Registration & Aid Disbursement Workflow
```
[ Social Worker / Field Worker ]
      │ 1. Opens Mobile Intake Form -> Captures Family Details & Household Income
      │ 2. Takes photo of National ID (AI extracts name/ID number via OCR)
      ▼
[ System Vulnerability Index Calculator ]
      │ Computes Vulnerability Score (1–100) based on dependents, income, medical needs
      ▼
[ Social Worker Verification & Case Notes ]
      │ Submits application for Welfare Committee review
      ▼
[ Welfare Committee / Director Dashboard ]
      │ Reviews case notes, vulnerability score, and duplicates check
      │ Clicks "Approve Aid" with approved amount & disbursement mode (DBT/Ration)
      ▼
[ Finance & Field Execution ]
      ├── Automated Payment Voucher generated in General Ledger
      ├── DBT Bank transfer processed / In-kind ration coupon generated
      └── Case status updated to "DISBURSED" with recipient photo confirmation
```

### 4.3 Volunteer Onboarding & Digital ID Verification Workflow
```
[ Public Volunteer Onboarding ]
      │ Submits Application (Skills: Medical, Logistics, Teaching; Availability)
      ▼
[ Volunteer Coordinator Approval ]
      │ Reviews profile -> Approves Volunteer
      ▼
[ Volunteer Portal Access ]
      ├── View upcoming drives (Food distribution, Medical camp)
      ├── Register for shift
      └── Download Digital Verifiable ID Card with live HMAC QR Code
            │
            ▼
      [ Field Event Check-in ]
            └── Coordinator scans Volunteer QR -> Hours automatically logged & verified
```

### 4.4 Financial Accounting & Voucher Posting Workflow
```
[ Operational Trigger (Donation Captured / Aid Disbursed / Payroll Run) ]
      │
      ▼
[ Automated Journal Voucher Draft ]
      │ System assigns Account Heads (e.g. Dr: Bank Account / Cr: Zakat Restricted Fund)
      │ Validates mathematical balance: Debit == Credit
      ▼
[ Finance Officer Review & Posting ]
      │ Reviews supporting documents / bank statement matching
      │ Clicks "Post Voucher"
      ▼
[ General Ledger & Financial Statements ]
      └── Real-time Balance Sheet, Trial Balance, and Income & Expenditure updated instantly
```

### 4.5 Event Management & High-Speed QR Gate Check-in Workflow
```
[ Attendee Registration ]
      │ Registers for Event -> Receives Digital Pass with unique cryptographic QR
      ▼
[ Event Gate Day ]
      │ Staff opens Mobile Gate Scanner PWA (Offline-capable)
      │ Points camera at Attendee QR Code
      ▼
[ Instant Gate Response (< 100ms) ]
      ├── Valid Pass: Green Flash + Attendee Name + "CHECKED IN"
      ├── Duplicate Pass: Red Alarm + "ALREADY CHECKED IN AT 10:14 AM"
      └── Invalid QR: Red Alarm + "UNRECOGNIZED PASS"
```

---

## 5. Responsive Breakpoint & Multi-Device Governance

| Viewport | Range | Layout Strategy |
|---|---|---|
| **Mobile** | `320px – 767px` | Single column, bottom navigation bar for portals, collapsible hamburger for public site, full-width touch-friendly form buttons (min-height 48px), swipeable card carousels. |
| **Tablet** | `768px – 1023px` | Two-column grid, compact collapsible left sidebar for ERP, slide-over modals instead of full page redirects. |
| **Desktop** | `1024px – 1439px` | Fixed 260px administrative navigation sidebar, multi-column dashboard grids, sticky top summary bars, split-screen detail views. |
| **Large Desktop** | `1440px+` | Max-width content constraint (`max-w-7xl` / `1440px`), high-density data tables, multi-pane analytics side-by-side. |
