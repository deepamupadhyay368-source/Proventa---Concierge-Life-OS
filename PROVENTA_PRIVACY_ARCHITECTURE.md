# PROVENTA — PRIVACY & DATA PROTECTION ARCHITECTURE

**Product:** PROVENTA — FINANCIAL INTELLIGENCE  
**Category:** Financial Intelligence Platform  
**Architecture Document Version:** 2026.1  
**Regulatory Framework Reference:** Digital Personal Data Protection Act, 2023 (DPDP Act, India) & Global Privacy Standards  

---

## 1. Architectural Principles

1. **Purpose Limitation:** Financial records, asset details, and personal identification data are collected and processed solely for delivering verified financial intelligence, estate continuity, and automated scenario analysis.
2. **Data Minimization:** No unnecessary personal identifying data is collected. Bank passwords, Internet banking login credentials, OTPs, and UPI PINs are **strictly prohibited** and never collected.
3. **Storage Limitation & Right to Erasure:** Customers hold sovereign ownership over their financial dossiers. At any point, customers can initiate irreversible cascade deletion under Section 12 of the DPDP Act 2023.
4. **Access Transparency:** Multi-generational family sharing is guarded by transparent audit logging (`ACCESS_SENSITIVE_DATA`), allowing trustees to audit which member or advisor inspected sensitive financial records.
5. **Private Storage by Default:** Financial documents, deeds, and wills in the Vault are stored in private object storage. No document is ever exposed via public URLs. Access is mediated strictly via temporary presigned URLs expiring within 15 minutes.

---

## 2. Technical Privacy Engine (`src/lib/privacy/privacy-engine.ts`)

The central privacy engine provides standardized interfaces for consent management, data portability, cascade erasure, access auditing, and retention governance.

### 2.1 Granular Consent Model
Consents are tracked independently in `db.consentRecord` and `db.policyAcceptance`:

- `TERMS_AND_CONDITIONS` (Statutory Terms of Service)
- `PRIVACY_POLICY` (General Privacy Policy)
- `FINANCIAL_INTELLIGENCE_PROCESSING` (Core calculation and net worth indexing)
- `AI_ASSISTANT_DISCLOSURE` (Deterministic multi-desk assistant reasoning)
- `FAMILY_SHARING_CONSENT` (Multi-member family workspace consolidation)
- `ACCOUNT_AGGREGATOR_CONSENT` (RBI-regulated AA data fetch consent)
- `MARKETING_COMMUNICATIONS` (Optional newsletters and announcements)

#### API Endpoints
- `GET /api/privacy/consent`: Fetches all active and historical consent records for the authenticated user.
- `POST /api/privacy/consent`: Records user acceptance of a specific consent version.
- `DELETE /api/privacy/consent?consentType=...`: Records explicit withdrawal of consent.

### 2.2 Machine-Readable Data Portability (Section 12 DPDP)
Endpoint `GET /api/customer/data-export` generates an authenticated, machine-readable JSON dossier containing:
- Account profile metadata
- Verified asset records and historical valuations
- Liabilities, balances, and interest rates
- Monthly cashflow ledgers
- Financial goals and target trajectory points
- Vault document metadata
- Historical policy acceptances and privacy consent records

### 2.3 Verified Cascade Account Erasure Workflow
Endpoint `POST /api/privacy/account-closure` implements irreversible erasure:
1. Validates authentication session.
2. Requires exact confirmation token: `"PERMANENT_ERASURE"`.
3. Verifies account is not an un-erasable administrative root (`SUPER_ADMIN` / `FOUNDER`).
4. Logs an audit entry in `db.auditLog` with action `DELETE_DATA` and statutory ground `DPDP Section 12`.
5. Records a security event `ACCOUNT_LOCKED`.
6. Deletes all customer preferences (`db.customerPreference`) belonging to the customer's profile, purging all recorded assets, liabilities, goals, cashflows, and continuity data.
7. Anonymizes the user record:
   - `email: erased-{userId}-{timestamp}@anonymized.proventa.in`
   - `name: "Erased Account"`
   - `phone: null`
   - `status: "DELETED"`
   - `securityKeyHash: null`, `passwordHash: null`
8. Revokes and purges all active session tokens in `db.session`.

---

## 3. Statutory Data Retention Schedule

| Category | Retention Period | Statutory & Regulatory Basis | Disposal Action |
| :--- | :--- | :--- | :--- |
| **Financial Ledger & Transaction Audit Logs** | 7 Years | Section 128, Companies Act, 2013 & Section 44AA, Income Tax Act, 1961 | Cryptographic archival, immutable audit freeze, irreversible purge post 7-year statutory window |
| **Customer Financial Assets & Liabilities Input** | Active Lifecycle + 30 Days | DPDP Act, 2023 (Section 8 Purpose Limitation) | Immediate scrub upon account erasure request |
| **Vault Documents & Encryption Keys** | Duration of Active Workspace | DPDP Act, 2023 & Information Technology Act, 2000 | Immediate deletion of private object storage binaries and key destruction upon user request |
| **Active Session Tokens & Access Credentials** | 30 Days Inactivity Expiration | OWASP Application Security Standard | Automatic TTL invalidation & purge from Redis/PostgreSQL session store |
| **Security Threat & Authentication Events** | 365 Days | CERT-In Cyber Security Directions, 2022 | Rolling automated purge of expired security event logs |

---

## 4. Legal & Regulatory Review Notice

> [!IMPORTANT]
> **Statutory Disclaimer:** The technical controls, consent mechanisms, and erasure pipelines implemented in PROVENTA provide structural alignment with India's Digital Personal Data Protection Act (DPDP Act, 2023). However, formal compliance certification, grievance officer designations, and legal consent disclosures require formal review by qualified Indian legal counsel prior to commercial production launch.
