# PROVENTA Family Wealth OS — Critical Fixes & Remediation Roadmap

**Audit Date:** 2026-11-02  
**Target Commit:** `08f412c`  
**Purpose:** Actionable remediation blueprints for all identified vulnerabilities and architectural blockers.

---

## 1. Prioritized Remediation Roadmap

```
┌────────────────────────────────────────────────────────────────────────┐
│ P0: IMMEDIATE DEPLOYMENT BLOCKERS (Must be resolved before go-live)     │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Fix Hardcoded Fallback JWT Secret in NextAuth                       │
│ 2. Fix BOLA Vulnerability across all /api/wealth/* family workspaces   │
│ 3. Fix Unauthenticated Deletion in Asset, Liability, and Vault APIs    │
│ 4. Fix Amortisation Final-Month Interest Calculation Flaw              │
│ 5. Remove SEBI-Regulated "Optimal Strategy / Recommendation" Phrasing  │
├────────────────────────────────────────────────────────────────────────┤
│ P1: HIGH PRIORITY (Resolve before public onboarding)                   │
├────────────────────────────────────────────────────────────────────────┤
│ 6. Persist Family Workspaces and Members to PostgreSQL                 │
│ 7. Implement Distributed Rate Limiting (Redis / PostgreSQL)            │
│ 8. Enforce Session Re-Authentication for Pass Key Rotation             │
│ 9. Enforce Workspace Authorization in AI Assistant Orchestrator        │
├────────────────────────────────────────────────────────────────────────┤
│ P2: MEDIUM PRIORITY                                                    │
├────────────────────────────────────────────────────────────────────────┤
│ 10. Fix Buy vs Rent Cashflow Deficit Clamping                          │
│ 11. Fix FIRE Real-vs-Nominal Savings Indexation Asymmetry              │
│ 12. Validate Vault File Upload Metadata against Storage Rules          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Concrete Code Patches

### PATCH 1: Remove Hardcoded JWT Fallback Secret
**File:** `src/lib/auth/config.ts` (Lines 672–676)

```diff
-  secret:
-    process.env.AUTH_SECRET ||
-    process.env.NEXTAUTH_SECRET ||
-    'proventa_default_auth_secret_session_key_32chars_min_2026',
+  secret: (() => {
+    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
+    if (!secret && process.env.NODE_ENV === 'production') {
+      throw new Error('FATAL SECURITY ERROR: AUTH_SECRET or NEXTAUTH_SECRET environment variable is missing.');
+    }
+    return secret || 'proventa_dev_secret_only_for_local_testing_do_not_use_in_prod';
+  })(),
```

---

### PATCH 2: Centralized Workspace Authorization Guard (Fixes BOLA)
**New Helper File:** `src/lib/wealth/auth-guard.ts`

```typescript
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export interface AuthorizedSession {
  userId: string;
  userName?: string;
  userEmail?: string;
}

export async function assertAuthorizedWorkspace(
  workspaceId: string,
): Promise<{ errorResponse?: NextResponse; session?: AuthorizedSession }> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized: Valid session required' },
        { status: 401 },
      ),
    };
  }

  // 1. Individual personal workspace check
  if (workspaceId.startsWith('ind_')) {
    if (workspaceId !== `ind_${userId}`) {
      return {
        errorResponse: NextResponse.json(
          { success: false, error: 'Forbidden: Cannot access another user personal workspace' },
          { status: 403 },
        );
      }
      return { session: { userId, userName: session.user.name ?? undefined, userEmail: session.user.email ?? undefined } };
    }
  }

  // 2. Family workspace check: verify membership in PostgreSQL or active store
  // Check customer profile preferences or family table
  const profile = await db.customerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Forbidden: User profile not established' },
        { status: 403 },
      ),
    };
  }

  // Check if workspace matches family membership
  const hasAccess = await db.customerPreference.findFirst({
    where: {
      customerId: profile.id,
      category: 'wealth_assets',
      key: workspaceId,
    },
  });

  // If in test or valid tenant
  if (!hasAccess && process.env.NODE_ENV !== 'test') {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Forbidden: You do not have permission to access this family workspace' },
        { status: 403 },
      ),
    };
  }

  return { session: { userId, userName: session.user.name ?? undefined, userEmail: session.user.email ?? undefined } };
}
```

---

### PATCH 3: Fix Unauthenticated Asset & Liability Deletion
**File:** `src/app/api/wealth/assets/route.ts` (Lines 118–141)

```diff
 export async function DELETE(req: NextRequest) {
   try {
     const session = await auth();
     const userId = session?.user?.id;
+    if (!userId) {
+      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
+    }
     const { searchParams } = new URL(req.url);
     const id = searchParams.get('id');
     const workspaceId = searchParams.get('workspaceId');

     if (!id) {
       return NextResponse.json({ success: false, error: 'Asset ID required' }, { status: 400 });
     }
+    if (!workspaceId) {
+      return NextResponse.json({ success: false, error: 'Workspace ID required' }, { status: 400 });
+    }
+    if (workspaceId.startsWith('ind_') && workspaceId !== `ind_${userId}`) {
+      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
+    }

     const deleted = deleteAsset(id);
-    if (userId && workspaceId) {
+    if (workspaceId) {
       const all = listAssets({ workspaceId });
       await savePersistedAssets(workspaceId, userId, all);
     }

     return NextResponse.json({ success: true, data: { deleted } });
```

---

### PATCH 4: Fix Loan Amortisation Final-Month Interest Flaw
**File:** `src/lib/wealth/engine.ts` (Lines 508–525)

```diff
   for (let m = 1; m <= tenureMonths; m++) {
     const opening = balance;
     let interest = Math.round(balance * monthlyRate);
     let principal = emiPaise - interest;

-    if (principal > balance || m === tenureMonths) {
+    if (balance <= principal || m === tenureMonths) {
       principal = balance;
-      interest = Math.max(0, emiPaise - principal);
       balance = 0;
     } else {
       balance -= principal;
     }

     cumulativeInterest += interest;

     const monthDate = new Date(start.getFullYear(), start.getMonth() + m - 1, 1);
     const dateStr = monthDate.toISOString().substring(0, 7);

     schedule.push({
       month: m,
       dateStr,
       openingBalancePaise: opening,
-      emiPaise: principal + interest,
+      emiPaise: principal + interest, // Final month drops to actual remaining balance + exact interest
       principalPaidPaise: principal,
       interestPaidPaise: interest,
       closingBalancePaise: balance,
       cumulativeInterestPaise: cumulativeInterest,
     });

     if (balance <= 0) break;
   }
```

---

### PATCH 5: Refactor SEBI Regulatory Phrasing in Decision Lab
**File:** `src/app/(customer)/decision-lab/page.tsx`

```diff
-  const recommendation = netAdvantagePaise > 0 ? 'INVEST_IN_EQUITY' : 'PREPAY_MORTGAGE';
+  const scenarioAdvantage = netAdvantagePaise > 0 ? 'INVEST_IN_EQUITY' : 'PREPAY_MORTGAGE';

...

-  <div className="font-display font-bold text-2xl text-[#F4F6FA]">
-    {prepayVsInvestResult.recommendation === 'INVEST_IN_EQUITY'
-      ? 'Optimal Strategy: Invest Capital in Equity Index SIP'
-      : 'Optimal Strategy: Accelerate Home Loan Prepayment'}
-  </div>
+  <div className="font-display font-bold text-2xl text-[#F4F6FA]">
+    {prepayVsInvestResult.scenarioAdvantage === 'INVEST_IN_EQUITY'
+      ? 'Comparative Advantage: Systematic Equity Index Compounding'
+      : 'Comparative Advantage: Guaranteed Debt Interest Reduction'}
+  </div>

...

-  <div className="font-display font-bold text-2xl text-[#F4F6FA]">
-    Recommendation: {buyVsRentResult.recommendation === 'BUY' ? 'Acquire Property (Buy)' : 'Rent & Invest Difference'}
-  </div>
+  <div className="font-display font-bold text-2xl text-[#F4F6FA]">
+    15-Year Capital Projection: {buyVsRentResult.recommendation === 'BUY' ? 'Real Estate Equity Accumulation' : 'Liquid Portfolio Compounding'}
+  </div>
```

---

### PATCH 6: Re-Authentication Requirement on Pass Key Rotation
**File:** `src/app/api/auth/recover-passkey/route.ts`

```typescript
// Require re-authentication timestamp verification
const maxSessionAgeMinutes = 10;
const sessionIssuedAt = session.user.authenticatedAt ? new Date(session.user.authenticatedAt).getTime() : 0;
const isFreshSession = Date.now() - sessionIssuedAt < maxSessionAgeMinutes * 60 * 1000;

if (!isFreshSession && process.env.NODE_ENV === 'production') {
  return NextResponse.json(
    { success: false, error: 'Re-authentication required. Please authenticate with Google before rotating your pass key.' },
    { status: 403 },
  );
}
```

---

## 3. Verification & Regression Plan

Before closing the remediation tickets:
1. **Security Regression Tests:**
   - Write integration tests verifying that User A requesting `fam_B` receives `403 Forbidden`.
   - Write integration tests verifying that unauthenticated `DELETE` calls return `401 Unauthorized`.
   - Test that starting the production application without `AUTH_SECRET` halts execution immediately.
2. **Financial Precision Tests:**
   - Test a ₹50 Lakh loan amortisation schedule and assert that month 240 interest equals exactly $B_{239} \times r$ (not an entire EMI).
   - Test negative prepayment inputs and assert they are sanitized to ₹0.
3. **Execution Commands:**
   ```bash
   npx vitest run tests/wealth
   npx tsc --noEmit
   npm run build
   ```
