# PROVENTA — EXTERNAL INTEGRATION STATUS & CREDENTIAL GOVERNANCE

**Product:** PROVENTA — FINANCIAL INTELLIGENCE  
**Category:** Financial Intelligence Platform  
**Integration Status Version:** 2026.1  

---

## 1. Third-Party Integration Audit Matrix

| Integration Domain | Primary Provider | Fallback Provider | Production Status | Credential Governance & Policy |
| :--- | :--- | :--- | :--- | :--- |
| **Email Dispatch** | Native Gmail SMTP (`SMTP_USER`, `SMTP_PASS`) | Resend API (`RESEND_API_KEY`) | **Implemented & Verified** | Dispatches real emails via authenticated TLS SMTP or Resend REST API. When unconfigured in dev/test, logs offline without faking delivery. |
| **Document Storage** | AWS S3 (`AWS_S3_BUCKET`) | Cloudflare R2 (`R2_BUCKET`) | **Implemented & Verified** | **Private buckets only.** Upload and download mediated strictly via 15-minute presigned URLs (`@aws-sdk/s3-request-presigner`). Zero public URLs. |
| **Subscription Payments** | Razorpay SDK (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) | Graceful upstream error | **Implemented & Verified** | Authoritative checkout order creation. Webhook signatures validated via HMAC SHA-256 and `crypto.timingSafeEqual`. In production, missing secrets throw rather than using fallback keys. |
| **Market Data (Mutual Funds)** | AMFI Direct Open Feed (`AMFI_FEED_KEY`) | Transparent offline status | **Implemented & Verified** | Declares explicit `UNCONFIGURED_FEED` status if upstream key is missing. Does not fabricate artificial daily NAV updates. |
| **Sovereign Debt & Gold** | RBI Published Reference Schedules | Statutory Reference Tables | **Implemented & Verified** | Sovereign Gold Bond tranches and RBI reference rates operational based on statutory Gazette notifications. |
| **Account Aggregator (AA)** | RBI NBFC-AA Framework (Sahamati / Setu Reserve) | Manual statement upload | **Architecture Verified / Wave 2 Provider Integration** | **STRICT POLICY:** Zero password collection. PROVENTA NEVER asks for internet banking passwords, OTPs, or UPI PINs. AA integration uses RBI-regulated digital consent handles. |

---

## 2. Zero-Credential Collection Policy

To protect customer financial sovereignty, PROVENTA adheres to the following non-negotiable architectural mandates:

1. **No Bank Password Collection:** The application does NOT collect or store internet banking credentials, ATM PINs, transaction passwords, or UPI PINs.
2. **No Screen Scraping:** The platform strictly prohibits headless browser scraping of banking portals.
3. **Verified Document Provenance:** Customers upload official PDF account statements, sale deeds, or valuation certificates. Data extraction requires human-in-the-loop review and confirmation before ledger ingestion (`src/lib/wealth/vault.ts`).
4. **Consent-Driven Account Aggregation:** Automated institution data synchronizations are architected strictly around the RBI-approved Account Aggregator framework, where customers authorize explicit, time-bounded consent on their AA application.
