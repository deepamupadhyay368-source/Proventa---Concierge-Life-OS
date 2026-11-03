# PROVENTA Family Wealth OS — Production Deployment Checklist

**Target Release:** PROVENTA Production Release  
**Branch:** `fix/p0-security-remediation`  
**Compliance Standards:** SEBI (Investment Advisers) Regulations 2013, DPDP Act 2023, RBI Cybersecurity Guidelines

---

## 1. Pre-Deployment Environment Configuration

Before triggering a production build or starting the application in `NODE_ENV=production`:

- [ ] **Generate and Set `AUTH_SECRET`:**
  - Must be a cryptographically random string of at least 32 characters (recommended: 64 characters).
  - Command: `openssl rand -base64 48`
  - Set as `AUTH_SECRET` in environment variables.
  - *Verification:* Attempting to run with missing or <32-char secret must halt the process.
- [ ] **Configure Google OAuth Provider Credentials:**
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - Ensure authorized redirect URIs match `https://<domain>/api/auth/callback/google`.
- [ ] **Configure PostgreSQL Database:**
  - `DATABASE_URL` (with SSL/TLS enabled: `sslmode=require`).
  - Run migrations: `npx prisma migrate deploy`.
  - Verify tables exist: `User`, `CustomerProfile`, `CustomerPreference`, `PolicyAcceptance`, `AuditLog`.
- [ ] **Configure Storage & S3/Vault:**
  - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET` (or compatible private object store).
  - Verify server-side AES-256 encryption is enabled on the bucket.
- [ ] **Configure Notification Gateways:**
  - `RESEND_API_KEY` (Transactional email).
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (SMS/WhatsApp OTP).

---

## 2. Security & Access Verification

- [ ] **Zero Hardcoded Secrets:**
  - Run `grep -ri "proventa_default_auth_secret" src/` — Must return 0 hits.
- [ ] **Centralized Workspace Authorization Guard:**
  - Confirm `src/lib/wealth/auth-guard.ts` is called in every route in `src/app/api/wealth/`.
  - Unauthenticated requests to any `/api/wealth/*` route return `401 Unauthorized`.
  - Requests querying another user's personal workspace (`ind_*`) return `403 Forbidden`.
  - Requests querying an unassociated family workspace (`fam_*`) return `403 Forbidden`.
- [ ] **Resource Deletion Isolation:**
  - `DELETE /api/wealth/assets`, `DELETE /api/wealth/liabilities`, `DELETE /api/wealth/vault` enforce ownership check against workspace ID.
- [ ] **Pass Key Protocol Integrity:**
  - Pass Keys are 12 numeric digits generated using `crypto.randomBytes`.
  - Stored strictly as salted bcrypt/Argon2id hashes in PostgreSQL. Plaintext is never stored.
  - Rate limiting enforced on pass key verification (5 attempts per 15 minutes).
- [ ] **Regulatory Wording Compliance:**
  - Verify Decision Lab (`src/app/(customer)/decision-lab`) uses comparative modeling terminology (`"Comparative Advantage"`, `"15-Year Projected Capital Differential"`).
  - Verify SEBI disclaimers are visibly rendered.

---

## 3. Build & Release Verification

Execute in release pipeline:

```bash
# 1. Typecheck entire codebase
npx tsc --noEmit

# 2. Run unit and security test suites
npx vitest run tests/wealth tests/unit/12-digit-passkey.test.ts tests/security/p0-security-remediation.test.ts

# 3. Generate Prisma client & build production bundle
npx prisma generate
npm run build
```

- [ ] `tsc --noEmit` exits with code `0`.
- [ ] 39/39 tests pass with 0 failures.
- [ ] `next build` compiles all 163 routes with 0 errors.

---

## 4. Post-Deployment Smoke Verification

1. **New User Registration Flow:**
   - [ ] Visit `https://<domain>/sign-in`.
   - [ ] Click "Continue with Google" and authenticate.
   - [ ] Complete onboarding form (`/complete-registration`).
   - [ ] Verify 12-digit Pass Key is generated and displayed once.
   - [ ] Verify redirection to user dashboard.
2. **Returning User Login Flow:**
   - [ ] Open incognito window.
   - [ ] Sign in with email + 12-digit Pass Key.
   - [ ] Verify user is landed in their isolated workspace.
3. **Data Isolation Smoke Test:**
   - [ ] Add an asset in Workspace A.
   - [ ] Query Workspace B telemetry or assets and verify Workspace A's asset does not appear.
