-- PROVENTA — Reconcile User Authentication Columns & AuthKeyReset Table (Strictly Additive)
-- Resolves P89-CRIT-01: Ensures clean Prisma-migrated databases match prisma/schema.prisma model User.
-- Zero DROP, Zero TRUNCATE, Zero destructive SQL. Safe on both existing staging and fresh databases.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "securityKeyHash" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "authKeyUpdatedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "auth_key_resets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "auth_key_resets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "auth_key_resets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "auth_key_resets_tokenHash_key" ON "auth_key_resets"("tokenHash");
CREATE INDEX IF NOT EXISTS "auth_key_resets_tokenHash_idx" ON "auth_key_resets"("tokenHash");
CREATE INDEX IF NOT EXISTS "auth_key_resets_userId_idx" ON "auth_key_resets"("userId");
