# PROVENTA TECHNICAL ARCHITECTURE SPECIFICATION
**Product**: Proventa — Concierge Life OS  
**Positioning**: Life, Handled.  
**Launch Cohort**: Ahmedabad Wave 1  

---

## 1. System Architecture Overview

Proventa is built as a unified, full-stack Next.js App Router application engineered for high-trust concierge operations and intelligent AI-assisted orchestration:

- **Frontend**: Next.js 16.x (App Router), Tailwind CSS, customized Radix UI primitive design system, Inter & Playfair Display typography, responsive mobile and desktop viewports.
- **Backend & APIs**: Next.js Server Components, Server Actions, Route Handlers, Zod schema validation, Auth.js (NextAuth v5) JWT session strategy with role injection.
- **Data Layer**: PostgreSQL database managed through Prisma ORM with 50+ normalized entities, strict relation integrity, and audit logging.
- **AI Layer**: Google Gemini API integration with an allowlist-restricted 8-tool boundary. AI operates strictly as an understanding, research, and drafting assistant.
- **Operating System**: Dedicated Concierge Operations workspace (`/concierge-ops/queue`, `/concierge-ops/requests/[id]`) with live triage and internal private notes.
- **Administration**: Executive Command Center (`/admin/overview`, `/admin/wave1`, `/admin/providers`, `/admin/requests`, `/admin/audit`, `/admin/settings`).

---

## 2. Security & Anti-Fabrication Guarantees

1. **Anti-Fabrication Policy**:
   - Neither AI nor Concierge agents may fabricate booking availability or confirmation codes.
   - Bookings are created in `DRAFT` or `AWAITING_APPROVAL` and can only transition to `CONFIRMED` when a real external reference is supplied.

2. **Customer Data Isolation**:
   - All customer queries enforce tenant isolation at the query level (`where: { customer: { userId: user.id } }`).
   - Customer A can never access Customer B’s requests, preferences, or conversation logs.
   - Internal concierge notes are strictly filtered from customer-facing API responses.

3. **Cryptographic Integrity**:
   - Invitations and password resets use cryptographic 32-byte tokens hashed via SHA-256 in the database.
   - Constant-time string comparisons (`timingSafeEqual`) prevent side-channel timing attacks.
