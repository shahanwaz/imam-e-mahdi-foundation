# API Specification & Integration Contracts
## Imam E Mahdi Foundation Digital Operating System (IMF-DOS)

**Document Version:** 2.0.0  
**Status:** Approved Technical Architecture  
**Protocols:** Next.js 15 Server Actions, RESTful HTTPS/TLS 1.3, Signed Webhooks  

---

## 1. Unified Contract Principles & Response Envelopes

All Server Actions and REST API Route Handlers enforce **Strict Schema Validation via Zod**, **Granular RBAC Authorization**, and **Deterministic Standard Envelopes**.

### 1.1 Standard JSON Response Formats

#### Success Envelope (`200 OK`, `201 Created`)
```typescript
export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    totalRecords?: number;
    totalPages?: number;
    timestamp: string;
  };
}
```

#### Error Envelope (`400`, `401`, `403`, `404`, `409`, `422`, `500`)
```typescript
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  error: {
    code: string; // e.g. "VALIDATION_FAILED", "UNBALANCED_VOUCHER", "UNAUTHORIZED"
    message: string;
    details?: Array<{ field: string; issue: string }>;
  };
  timestamp: string;
}
```

---

## 2. Idempotency & Concurrency Control

For financial, donation, and disbursement operations, requests support an `Idempotency-Key` HTTP header (or Server Action property). 
* When received, Redis checks if the key exists within a 24-hour TTL window.
* If a duplicate request arrives while processing, HTTP `409 Conflict` is returned.
* If already processed, the cached response envelope is returned without re-executing transactions.

---

## 3. Server Actions & REST API Contract Catalog

### 3.1 Authentication & Profile Contracts
```typescript
// Action: loginUserAction(dto: LoginCredentialsDTO) -> Promise<ApiResponse<SessionUser>>
export const LoginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  totpCode: z.string().length(6).optional()
});

// Action: registerDonorAction(dto: RegisterDonorDTO) -> Promise<ApiResponse<DonorProfile>>
export const RegisterDonorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  countryCode: z.string().default("IND")
});
```

### 3.2 Donation & Gateway Contracts
```typescript
// POST /api/donations/create-order
// Request DTO:
export const CreateDonationOrderSchema = z.object({
  campaignId: z.string().optional(),
  donorName: z.string().min(2),
  donorEmail: z.string().email(),
  donorPhone: z.string().optional(),
  donorPan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format").optional(),
  donorAddress: z.string().optional(),
  amount: z.number().positive(),
  currency: z.enum(["INR", "USD", "EUR", "GBP", "SAR"]).default("INR"),
  fundType: z.enum([
    "GENERAL_SADAQAH", "ZAKAT", "KHUMS", "FITRAH", 
    "KAFARAH", "LILLAH", "ORPHAN_SPONSORSHIP", "EDUCATION_AID", "MEDICAL_RELIEF"
  ]),
  paymentMethod: z.enum(["RAZORPAY", "STRIPE", "UPI_INTENT", "BANK_TRANSFER_NEFT"]),
  isAnonymous: z.boolean().default(false),
  is80GRequested: z.boolean().default(true)
});

// Response Data:
export interface DonationOrderData {
  donationId: string;
  receiptNumber: string;
  orderId: string; // Razorpay order_id or Stripe clientSecret
  amount: number;
  currency: string;
  keyId: string;
}
```

### 3.3 Finance & Double-Entry Ledger Contracts
```typescript
// Action: postVoucherAction(dto: CreateVoucherDTO) -> Promise<ApiResponse<VoucherRecord>>
export const CreateVoucherSchema = z.object({
  voucherType: z.enum(["RECEIPT", "PAYMENT", "JOURNAL", "CONTRA"]),
  voucherDate: z.string().datetime(),
  narration: z.string().min(5),
  entries: z.array(z.object({
    accountHeadId: z.string(),
    debitAmount: z.number().nonnegative().default(0),
    creditAmount: z.number().nonnegative().default(0),
    particulars: z.string().optional()
  })).refine(entries => {
    const totalDebits = entries.reduce((sum, e) => sum + e.debitAmount, 0);
    const totalCredits = entries.reduce((sum, e) => sum + e.creditAmount, 0);
    return Math.abs(totalDebits - totalCredits) < 0.001;
  }, {
    message: "Total Debit amount must exactly equal Total Credit amount"
  })
});
```

### 3.4 Beneficiary & Aid Disbursement Contracts
```typescript
// POST /api/beneficiaries
export const CreateBeneficiarySchema = z.object({
  fullName: z.string().min(2),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dateOfBirth: z.string().datetime().optional(),
  nationalIdNumber: z.string().min(4), // Aadhaar or Govt ID (encrypted before DB write)
  phone: z.string().optional(),
  address: z.string().min(5),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  category: z.enum([
    "ORPHAN_FAMILY", "WIDOW_SUPPORT", "CHRONIC_ILLNESS", 
    "EXTREME_POVERTY", "STUDENT_SCHOLARSHIP", "DISASTER_VICTIM", "ELDERLY_CARE"
  ]),
  monthlyHouseholdIncome: z.number().nonnegative(),
  familyMembers: z.array(z.object({
    fullName: z.string(),
    relation: z.string(),
    age: z.number().int().nonnegative(),
    occupation: z.string().optional()
  })).default([]),
  caseNotes: z.string().optional()
});

// POST /api/aid-disbursements
export const DisburseAidSchema = z.object({
  applicationId: z.string(),
  amount: z.number().positive(),
  disbursementMode: z.enum(["DIRECT_BANK_TRANSFER", "CHEQUE", "IN_KIND_RATION"]),
  bankReference: z.string().optional(),
  projectId: z.string().optional()
});
```

### 3.5 Cryptographic Verification Gateway Contract
```typescript
// GET /api/verify/:signatureHash
// Public endpoint for QR code validation
export interface VerificationResultData {
  isValid: boolean;
  certificateType: "80G_TAX_RECEIPT" | "VOLUNTEER_SERVICE" | "MEMBERSHIP_ID" | "EVENT_PASS";
  documentCode: string;
  issuedToName: string;
  issuedDate: string;
  organization: "Imam E Mahdi Foundation";
  attributes: Record<string, string | number>;
  tamperProofHash: string;
}
```

### 3.6 AI Processing Contracts
```typescript
// POST /api/ai/ocr-bank-receipt
export const ReceiptOcrResponseSchema = z.object({
  success: z.boolean(),
  extractedData: z.object({
    utrNumber: z.string().nullable(),
    amount: z.number().nullable(),
    transactionDate: z.string().nullable(),
    remitterName: z.string().nullable(),
    confidenceScore: z.number().min(0).max(1)
  })
});
```

---

## 4. Payment Gateway Webhook Contracts

### 4.1 Razorpay Webhook (`POST /api/webhooks/razorpay`)
* **Header**: `X-Razorpay-Signature`
* **Verification**: `crypto.createHmac('sha256', secret).update(rawBody).digest('hex')`
* **Handled Events**:
  * `payment.captured` $\rightarrow$ Complete donation, trigger 80G receipt BullMQ worker.
  * `payment.failed` $\rightarrow$ Mark donation as failed, send user retry notification.

### 4.2 Stripe Webhook (`POST /api/webhooks/stripe`)
* **Header**: `Stripe-Signature`
* **Handled Events**:
  * `payment_intent.succeeded` $\rightarrow$ Complete multi-currency donation, record forex conversion.
  * `customer.subscription.updated` $\rightarrow$ Renew monthly sponsorship pledge.
