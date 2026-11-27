# PROVENTA — PACIFICA PILOT READINESS REPORT
**ILLUSTRATIVE SAMPLE — NOT ACTUAL PACIFICA PROCUREMENT DATA**

**Date:** November 27, 2026  
**External Contact Status:** ZERO external emails, WhatsApp messages, or outreach sent to Pacifica Companies or any supplier.

---

## 1. Pilot Capability Readiness
PROVENTA is ready to onboard an institutional pilot (1 buyer organisation, 1 Ahmedabad project, 1 core material category such as TMT Steel Fe-550D or OPC 53 Cement) across all seven intelligence capabilities:
1. **True Landed Cost Comparison:** Live at `/pilot/pacifica` and `/buyer/comparison` (demonstrates like-for-like landed cost in integer paise and flags non-equivalent Fe-500 substitution).
2. **Material Price Intelligence:** Captures sourced supplier quotations and POs; explicitly displays `"Insufficient verified data to generate a reliable benchmark."` when fewer than 3 verified like-for-like observations exist.
3. **Supplier Reliability Intelligence:** Requires >= 3 completed transactions before issuing a composite score; clearly flags unverified/new suppliers as `INSUFFICIENT_DATA`.
4. **Procurement Leakage Detector:** Scans pilot POs, GRNs, and invoices for price anomalies, quantity variances, approval bypasses, and duplicate invoices with CSV export.
5. **Multi-Project Purchasing Intelligence:** Ready for Phase 2 expansion when Pacifica adds a second Gujarat site.
6. **Procurement Timing Intelligence:** Forecasts slab/podium material shortages from BOQ milestones + site stock + lead times.
7. **Procurement Autopilot:** Stages RFQ drafts, explainable supplier matches, and quotation analysis summaries strictly under human confirmation.

## 2. One-Page Pilot Governance & Evidence Limitations
- All demonstration records on `/pilot/pacifica` carry `isSampleData: true` and banner `INSTITUTIONAL PILOT DEMONSTRATION — SAMPLE DATA (ISOLATED FROM PRODUCTION)`.
- Real Pacifica data will only be entered after formal onboarding, organisation verification, and isolated staging certification.
- PROVENTA never guarantees savings; potential savings (quotation vs. baseline) are strictly separated from verified realised savings (approved PO + GRN + Invoice).
