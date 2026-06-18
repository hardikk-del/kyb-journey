# 01 — Product requirements (PRD)

## Problem

For banks, onboarding a business and turning it into an active merchant is slow, fragmented, and leaky:

- Manual KYB and document review takes 3–10 days.
- Merchants drop out because the journey is long and repetitive.
- Fraud enters through fake GST, shell entities, mule accounts, and proxy operators.
- Current-account opening and POS/QR deployment are run by different teams with separate KYB.
- No one holds a single, unified view of a business's legitimacy and ownership.

## What Secure ID does

One platform that runs the whole journey: **Lead → Verify → Approve → Open account → Deploy POS/QR → Activate → Monitor.** It collapses the two separate KYB passes (account + acquiring) into one, runs verification in parallel into a single risk score, exposes ownership/network risk visually, and turns periodic re-KYC into continuous monitoring that also ingests acquiring (POS/QR) signals.

## The three things the prototype must prove to a banker

1. **Speed without losing control** — a clean merchant goes from lead to live in minutes, mostly automated, with a full audit trail.
2. **Fraud caught before approval** — a business that looks fine on paper is stopped because the ownership/network graph and screening expose a shell/mule structure.
3. **One journey, one profile** — the same verified entity flows straight into a current account and then POS/QR with no re-verification, and is then monitored continuously.

## Personas / surfaces

**Surface A — Onboarding** (used by a field agent / branch RM, or a merchant self-serving)
- Goal: capture the business once, verify it, and activate it. Minimise typing and drop-off.

**Surface B — Bank console** (the hero for the pitch; used by an ops/risk officer, with a compliance/admin view)
- Goal: see the pipeline, work exceptions on one screen, make a defensible decision with recorded reasons, and monitor the live portfolio.

A senior reviewer (maker-checker) and a compliance/admin (rules + audit) are represented but kept light.

## Scope of the prototype

In scope (must build): the full Surface A capture-to-activation flow for all four entity types; the Verify/risk-score moment; the Bank console queue, case detail, ownership graph, decisioning, monitoring, and a light admin/rules screen; the scripted demo cases; all UI states.

Explicitly out of scope (mock or omit): real API integrations, real auth/SSO, real persistence beyond the session, real V-CIP video (simulate with a realistic stepped UI), real payments. State this honestly if asked in the room — it's a prototype of the experience and decisioning, not the infrastructure.

## Entity types covered

Proprietorship, Partnership firm, LLP, Private Limited. The journey is the same seven stages for all; what changes is the documents collected, the registries checked, and the depth of the ownership graph. See `02_JOURNEY.md` for the per-type matrix.

## Regulatory backdrop the UI should reflect (kept realistic, not preachy)

- Tiered due diligence: a simplified path for small merchants (turnover ≤ ₹40 lakh — PAN + contact-point verification + one OVD) and full CDD above that. The tier is auto-classified at the start and shown as a chip.
- Current-account opening gate: a configurable exposure rule (default: no restriction under ₹10 crore aggregate banking-system exposure; at/above ₹10 crore the bank needs ≥10% share, else collection-account-only or decline). Treat numbers as config, not hardcoded.
- Beneficial-owner threshold: configurable (default >10% per current PMLA rules), with drill-down through corporate owners.
- Non-face-to-face onboarding implies enhanced due diligence and tighter limits; in-person biometric e-KYC and V-CIP are full-KYC. The UI should reflect which path a case took and the resulting limits.

## Demo success criteria

- A banker watching the three proof-points above says "this is faster and safer than what we do, and my officer would actually use this."
- Nothing in the click path breaks, stalls without feedback, or shows placeholder content.
- It reads as a system the bank could put in front of staff next quarter.
