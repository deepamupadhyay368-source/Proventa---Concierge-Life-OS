# PROVENTA — DISASTER RECOVERY & BUSINESS CONTINUITY PLAN

**Product:** PROVENTA — FINANCIAL INTELLIGENCE  
**Category:** Financial Intelligence Platform  
**Target Recovery Point Objective (RPO):** < 1 Hour  
**Target Recovery Time Objective (RTO):** < 30 Minutes  

---

## 1. Backup Strategy & Procedures

### 1.1 Automated Snapshot Routine (`scripts/db-backup.sh`)
- **Frequency:** Automated cron job runs every 6 hours; daily archival at 00:00 UTC.
- **Format:** PostgreSQL custom compressed archive (`pg_dump --format=custom --compress=9`).
- **Integrity Verification:** Every dump file automatically generates a matching SHA-256 checksum file (`.dump.sha256`).
- **Retention Schedule:**
  - Daily snapshots: Retained for 30 days locally and replicated to encrypted cold storage.
  - Weekly snapshots: Retained for 12 weeks.
  - Monthly snapshots: Retained for 7 years (statutory audit retention under Section 128 of the Companies Act, 2013).

### 1.2 Automated Snapshot Integrity Verification (`scripts/verify-backup.ts`)
Automated CI/CD and operational verification checks ensure backup archives are valid and not corrupted:
- Verifies SHA-256 cryptographic checksum matching.
- Validates JSON serializers and schema entity counts.

---

## 2. Disaster Recovery & Restoration Procedure (`scripts/db-restore.sh`)

In the event of database hardware failure, cluster loss, or catastrophic corruption:

1. **Activate Standby Cluster:** Provision a fresh PostgreSQL 16+ instance.
2. **Retrieve Authoritative Snapshot:** Download latest verified `.dump` and `.sha256` files from disaster recovery vault.
3. **Verify Integrity Checksum:**
   ```bash
   sha256sum -c proventa_db_YYYYMMDD_HHMMSSZ.dump.sha256
   ```
   If the checksum fails, the restore script aborts immediately to prevent applying tampered or incomplete data.
4. **Execute Restoration:**
   ```bash
   ./scripts/db-restore.sh /path/to/proventa_db_YYYYMMDD_HHMMSSZ.dump
   ```
5. **Verify Database Health:**
   ```bash
   curl -s https://proventa.in/api/health | jq .
   ```
   Confirm `status: "HEALTHY"` and `database.status: "CONNECTED"`.

---

## 3. Deployment Rollback & Incident Response

### 3.1 Next.js Deployment Rollback
- Every release is tagged in Git (`git tag v2026.X.Y`).
- In case of critical frontend or API regression:
  1. Point deployment proxy (Vercel / AWS ECS / Kubernetes) to the previous container/deployment artifact.
  2. If database schema was modified, execute safe down-migration via Prisma migration scripts.

### 3.2 Security Incident Response Protocol
1. **P0 Vulnerability or Breach Suspected:**
   - Immediately rotate `AUTH_SECRET` and `ENCRYPTION_KEY`.
   - Invalidate all active sessions in `db.session`.
   - Check security event logs:
     ```sql
     SELECT * FROM security_events ORDER BY "createdAt" DESC LIMIT 100;
     ```
2. **Statutory CERT-In Notification:** In accordance with CERT-In directions, cybersecurity incidents must be reported to the Indian Computer Emergency Response Team within 6 hours of identification.
