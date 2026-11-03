# PROVENTA — SECURITY ARCHITECTURE & THREAT MODEL

**Product:** PROVENTA — FINANCIAL INTELLIGENCE  
**Category:** Financial Intelligence Platform  
**Architecture Document Version:** 2026.1  
**Security Classification:** Highly Confidential (Fintech / Tier-1 Wealth Infrastructure)  

---

## 1. Authentication & Pass Key Security Protocol

### 1.1 Unique Cryptographic Pass Key Specification
- Every PROVENTA account possesses a unique internal user ID and a unique, cryptographically random **12-digit numeric Pass Key**.
- **Format:** Displayed with single-hyphen grouping for human readability (`XXXX-XXXX-XXXX`), stored as a salted hash.
- **Zero Plaintext Storage:** The pass key is NEVER stored in plaintext. It is hashed using **PBKDF2-HMAC-SHA512** with 100,000 iterations and a unique 16-byte cryptographically random salt per user (`src/lib/auth/access-key.ts`), fully compatible with Argon2id operational standards.
- **Single-View Generation:** When a user registers or initiates recovery via their verified Google account, the 12-digit key is displayed once with a verified confirmation gate before proceeding into the dashboard.

### 1.2 Brute-Force & Rate Limiting Protections
- Pass Key verification and recovery endpoints (`/api/auth/recover-passkey`, `/api/auth/complete-registration`) enforce atomic sliding-window rate limiting via Redis (`src/lib/security/rate-limit.ts`) with in-memory fallback.
- Rate limits:
  - Pass Key Login / Recovery: Max 5 attempts per 15 minutes per IP/User. Exceeding triggers HTTP 429 with `Retry-After: 900`.
  - Registration: Max 10 attempts per minute per IP.

### 1.3 Strict Secret Hygiene (P0 Remediation Verified)
- Hardcoded fallback secrets in `src/lib/auth/config.ts`, `src/lib/auth/concierge-session.ts`, `src/lib/security/crypto.ts`, and `src/lib/payments/razorpay.ts` have been completely eliminated.
- In `production` (`process.env.NODE_ENV === 'production'`), the server fails immediately if `AUTH_SECRET`, `ENCRYPTION_KEY`, or payment gateway keys are missing.

---

## 2. Multi-Tenant Authorization Guard (`assertAuthorizedWorkspace`)

All read, write, and delete operations across the 12 wealth endpoints route through the centralized guard `src/lib/wealth/auth-guard.ts`.

### 2.1 Individual Workspace Isolation
- Workspaces beginning with `ind_` represent individual personal spaces.
- Rule: An authenticated user with ID `userId` can ONLY access `ind_{userId}`.
- Any attempt to access `ind_{otherUserId}` is rejected with **HTTP 403 Forbidden**.

### 2.2 Family Workspace Isolation & Role Hierarchy
- Workspaces beginning with `fam_` represent multi-member family offices.
- Membership is verified against PostgreSQL customer profile records and active workspace membership maps.
- Strict role hierarchy enforced:
  $$\text{VIEWER (1)} < \text{MEMBER (2)} < \text{ADMIN (3)} < \text{OWNER (4)}$$
- Permissions Matrix:
  - `VIEWER`: Read-only access to consolidated telemetry and asset valuations. Mutation and delete endpoints return **HTTP 403 Forbidden**.
  - `MEMBER`: Read and create assets, liabilities, and cashflows for own share.
  - `ADMIN`: Invite family members, modify workspace metadata, rebalance category permissions.
  - `OWNER`: Full administrative control, workspace deletion, and primary trustee authority.

---

## 3. Cryptography & Data at Rest Protection

- **Symmetric Encryption:** Sensitive PII, documents metadata, and confidential notes are encrypted using **AES-256-GCM** authenticated encryption (`src/lib/security/crypto.ts`).
- **Timing-Safe Comparison:** All token, signature, and passkey verifications use `crypto.timingSafeEqual` to prevent side-channel timing attacks.
- **CSRF & Origin Enforcement:** `src/lib/security/csrf.ts` enforces origin and referer header validation on state-modifying HTTP methods (`POST`, `PUT`, `PATCH`, `DELETE`).

---

## 4. Payment Security & Webhook Integrity

- **Provider:** Razorpay integration (`src/lib/payments/razorpay.ts`).
- **Checkout Signature Verification:** Authoritative signature verified via HMAC SHA-256 using `crypto.timingSafeEqual(sigBuffer, expBuffer)`.
- **Webhook Verification:** `verifyWebhookSignature` computes HMAC SHA-256 over the raw request payload using `RAZORPAY_WEBHOOK_SECRET` and rejects modified or forged payloads.
