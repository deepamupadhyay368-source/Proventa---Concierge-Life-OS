# PROVENTA — DATA PROTECTION & RECORD OF PROCESSING ACTIVITIES (ROPA)

**Product:** PROVENTA — FINANCIAL INTELLIGENCE  
**Category:** Financial Intelligence Platform  
**Target Legal Jurisdiction:** India (DPDP Act, 2023)  
**Report Date:** November 3, 2026  

---

## 1. Data Classification Matrix

| Data Category | Examples | Sensitivity Level | Encryption at Rest | Retention Schedule |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication Credentials** | 12-Digit Pass Key Hash, Google OAuth Sub ID, Session Tokens | **Tier-1 Critical** | PBKDF2-SHA512 Salted Hashes; Tokens encrypted in Redis/DB | Session: 30 Days; Hashes: Active Account Lifetime |
| **Identity & KYC PII** | Full Legal Name, Verified Email, Mobile Number, City | **Tier-2 High** | Encrypted in PostgreSQL; phone normalized | Retained during active subscription; scrubbed upon erasure |
| **Financial Ledger Data** | Assets, Valuations, Liabilities, EMIs, Cashflow Transactions | **Tier-2 High** | Tenant-isolated in PostgreSQL, integer paise precision | 7 Years (statutory audit requirement under Companies Act 2013) |
| **Vault Legal Documents** | Property Deeds, Wills, Insurance Policies, Share Certificates | **Tier-1 Critical** | Private S3/R2 storage with AES-256 server-side encryption | Active Workspace Duration; deleted upon trustee request |
| **AI Query Telemetry** | Multi-Desk Reasoning Prompts, Anonymized Queries | **Tier-3 Low** | Sanitized, zero prompt injection storage | 90 Days Rolling TTL |

---

## 2. Record of Processing Activities (ROPA)

### Activity 1: Net Worth Calculation & Financial Telemetry
- **Purpose:** Provide unified, real-time family balance sheet, net worth index, and asset allocation breakdown.
- **Lawful Basis:** Explicit Consent (Section 6, DPDP Act 2023).
- **Data Categories:** Asset valuations, outstanding liabilities, cashflow ledgers, ownership percentages.
- **Data Principals:** Platform subscribers (individual users and family trustees).
- **Recipients:** Authenticated workspace members with explicit role privileges.
- **Security Safeguards:** Integer paise arithmetic (zero float drift), BOLA authorization guard, tenant-isolated DB records.

### Activity 2: Identity Authentication & Pass Key Security
- **Purpose:** User registration, multi-factor credential verification, and account recovery.
- **Lawful Basis:** Contractual performance and verified identity assertion.
- **Data Categories:** Name, email, mobile phone, pass key hash.
- **Data Principals:** All registered users.
- **Recipients:** Internal authentication engine; Google OAuth callback.
- **Security Safeguards:** PBKDF2-SHA512 salted hashing, sliding-window rate limiting, timing-safe equality checks.

### Activity 3: Private Vault Archival & Estate Continuity
- **Purpose:** Secure document vaulting, nominee tracking, and family continuity planning.
- **Lawful Basis:** Explicit consent and trusteeship nomination (Section 14 DPDP Act 2023).
- **Data Categories:** Legal documents, deeds, policy numbers, emergency succession triggers.
- **Data Principals:** Trustees, nominated heirs, executors.
- **Recipients:** Private object storage with short-lived presigned URLs (15-minute validity).
- **Security Safeguards:** Zero public URLs, signed download links, human-in-the-loop confirmation before financial extraction.

---

## 3. Data Protection Impact Assessment (DPIA) Summary

1. **Risk of Cross-Tenant Data Leaks:** Mitigated via `assertAuthorizedWorkspace` guard on all 12 wealth endpoints. Validated via automated test `tests/security/launch-readiness-independent-audit.test.ts`.
2. **Risk of Pass Key Brute Force:** Mitigated via 12-digit numeric length ($10^{12}$ combinations) and distributed sliding-window rate limits (max 5 attempts per 15 minutes).
3. **Risk of Public Document Exposure:** Mitigated by prohibiting public S3 buckets. All document access requires an authenticated session to generate a 15-minute presigned URL.
4. **Risk of Calculation Discrepancies:** Mitigated by integer paise arithmetic throughout the entire engine.
