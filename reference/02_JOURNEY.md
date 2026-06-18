# 02 — Journey & screens (phone-first onboarding + desktop console)

Secure ID's journey is seven stages: **Lead → Verify → Approve → Open account → Deploy POS/QR → Activate → Monitor.** The replica covers (a weaker version of) Lead + the capture side of Verify and stops. We keep the good capture, make it phone-first, and carry the journey all the way through.

Two surfaces:
- **Onboarding app — phone-first** (field agent / merchant). 390px, native patterns, in a device frame on desktop.
- **Bank console — desktop** (ops/risk officer). The hero.

---

## Phone surface — global shell

- A phone canvas (~390×844) inside a `PhoneFrame` on desktop.
- **Top app bar:** back chevron, screen title, a slim **progress bar** under it (stage x of n). A small "Demo data" tag.
- **Body:** one scrollable column, generous touch targets (≥44px), bottom sheets (Radix) instead of centered modals.
- **Bottom action bar:** the primary action is pinned to the bottom ("Continue", "Verify", "Open account") with a secondary/back beside it. Sticky, above the home indicator.
- A persistent **case chip** at the top showing entity + tier once known.
- Camera/upload steps use a real capture affordance (camera viewport mock, file picker), not a dashed desktop drop-zone.

## Mapping: replica phase → Secure ID stage

| Replica phase | Secure ID stage | What changes |
|---|---|---|
| Customer details | **Lead** | Entity-type drives the whole flow; tier auto-classifies; the ₹5 Cr question becomes the real exposure gate later. |
| Document collection | **Verify (capture)** | Same send-link/upload-on-behalf, but documents are entity-specific and auto-read + cross-checked. |
| Need of discipline | folded into **Approve / Open account** | Drives the configurable ₹10 Cr / 10%-share account-type decision. |
| KYC details | **Verify (identity)** | Real per-person identity checks + path (biometric / V-CIP / OTP-EDD). |
| Business details | **Verify (business)** | GST/MCA/Udyam status + filing history, not just captured text. |
| FATCA & site check | **Verify (premises + screening)** | CPV result feeds the score; FATCA retained. |
| Account setup | **Open account** | Becomes a real account number + IFSC + account type from the gate. |
| RM declaration | retained inside **Approve** | Agent attestation + maker-checker. |
| Post onboarding | **Deploy → Activate → Monitor** | The new half: POS/QR from the same profile, go-live, continuous monitoring. |

---

## Phone flow, screen by screen

### 1. Start / Lead
- Entity type (segmented): Proprietorship / Partnership / LLP / Private Limited.
- One anchor identifier (PAN / GSTIN / mobile) → lookup prefills next screen.
- Channel (agent / branch / merchant self-serve).
- **Tier chip** appears: "Simplified DD (≤ ₹40L)" or "Full CDD", one-line explanation.

### 2. Permissions (only if agent/merchant device features needed)
- Camera + location, as quick auto-advancing steps (like the replica) but with a clear purpose line and a working skip.

### 3. Business details
- Prefilled from the anchor lookup with source tags ("from GSTN" / "from MCA"). Entity-specific fields (matrix below). Confirm/edit.

### 4. People & ownership
- Add the entity-appropriate people (proprietor / partners / designated partners / directors + shareholders). Each: name, role, PAN, DIN/DPIN where relevant, ownership %, authorised-signatory toggle.
- **Beneficial owners derived** against the configurable threshold; shown as a derived list. A small ownership-graph preview.

### 5. Document collection
- Same pattern as the replica: send a secure link (SMS/WhatsApp) **or** capture on the customer's behalf. Tracker while uploading.
- Entity-specific document set; each upload is **auto-read** (simulated OCR) and **cross-checked** against captured data with a match/mismatch indicator.

### 6. Identity verification (per person)
- Aadhaar (DigiLocker/OTP), PAN validate, PAN–Aadhaar link.
- Path: **in-person biometric** / **V-CIP** (stepped: connect → liveness → capture → match) / **OTP e-KYC** (shows the EDD + limited-account consequence inline). Per-person status chips.

### 7. Bank account & financials
- Account + IFSC → **penny-drop** name match. Optional AA statement (can move the tier). Behind the scenes the **exposure check** runs for the account gate.

### 8. Premises & FATCA
- Confirm address, capture geo-tagged **shop-front + name-board photo** (like the replica), address matched vs OVD. FATCA declaration.

### 9. Verify — risk-score assembly (signature moment #1)
- On submit: the six pillars (Identity, Business, Financial, Premises, Ownership/Network, Screening) run in parallel, checks resolving one by one; the **risk gauge** settles to a band; **reason codes** appear. ~3–5s, restrained Framer Motion, reduced-motion safe.

### 10. Outcome
- **Approved (Low, tier permits)** → account opening.
- **In review (Medium)** → routed to a bank officer; clear "what happens next".
- **More info needed** → specific, actionable list; returns into the flow.
- **Declined (High / hard-stop)** → polite, reason category, appeal path.

### 11. Open account + deploy POS/QR
- Account number (masked), IFSC, **account type from the exposure gate** (full current / collection-only), CBS-flag indicator.
- **Deploy from the same verified profile** — QR / Soundbox / POS / Gateway MID, with a visible line: "No re-verification needed — using the verified Secure ID profile." MID/terminal id generated.

### 12. Activate
- Go-live, initial limits (lower on OTP-EDD paths), "now monitored". Reference number (like the replica's success screen, but it leads into a live, monitored merchant — not a dead end).

---

## Per-entity-type matrix

Common parallel checks run for all (see engine below). Differences:

**Proprietorship** — proprietor's PAN (no firm PAN), optional GSTIN/Udyam, no MCA. People: proprietor only (sole BO + signatory). Docs: PAN + one OVD + business-existence proof (GST/Udyam/Shop & Establishment/utility bill). Usually Simplified DD. Graph trivial.

**Partnership firm** — firm PAN, GSTIN, optional Udyam, registered **partnership deed**, no MCA. People: all partners + authorised signatory. BOs: partners above threshold (profit/capital share). Docs: deed, firm PAN, partners' PAN+OVD, authorisation letter, GST, address proof. Graph: firm → partners (with %).

**LLP** — **LLPIN** (MCA), firm PAN, GSTIN, **LLP agreement**, designated partners' **DIN/DPIN**. People: designated partners + partners + signatory. BOs above threshold; drill through corporate partners. Docs: incorporation cert, LLP agreement, firm PAN, designated partners' KYC+DIN, authorisation resolution. Extra checks: MCA LLP status, DIN validation. Graph: LLP → designated partners → corporate partners drilled down.

**Private Limited** — **CIN** (MCA), firm PAN, GSTIN, **MOA/AOA**, **board resolution**, directors' **DIN**. People: directors + signatory; shareholders for BO. BOs above threshold; **trace through corporate shareholders to ultimate owners** (the fraud case lives here). Docs: Certificate of Incorporation, MOA/AOA, board resolution, list of directors, shareholding pattern, firm PAN, directors' KYC+DIN. Extra checks: MCA company status (active/strike-off/liquidation/dormant), DIN validation, signatory-vs-resolution. Graph: company → shareholders (individual + corporate) → drill to ultimate BOs; shared-attribute + shell/mule detection light up.

---

## Desktop console (the hero)

**B1 Dashboard/pipeline** — stat cards (in queue, auto-approved today, in review, declined, median time-to-decision), volume-by-stage strip, SLA breaches, a "needs attention" list.

**B2 Applications queue** — DataTable: business, type, tier, submitted, risk band, recommended action, assigned officer, age. Sortable/filterable. Loading + empty states. Row → case detail.

**B3 Case detail (most important screen)** — header (entity, type, tier, **risk band**, recommended action, identity path); **risk panel** (gauge, six pillar sub-scores, reason codes, hard-stops); **checks panel** (every verification with status, extracted value, source — GSTN/MCA/UIDAI/Penny-drop/CRILC — and timestamp); **ownership & network graph** (React Flow, signature element — for the fraud case it reveals the shell cluster: one address linked to several struck-off companies + a mule-flagged account bridging them); **people & KYC** (screening: clear/PEP/adverse-media/sanctions, true-vs-false-positive handling); **documents** (extracted fields + match indicators); **decision bar** (Approve / Request info / Decline — recorded reason required; Approve runs the exposure gate; maker-checker via a role toggle); **audit timeline** (every event + actor + timestamp).

**B4 Monitoring** — active merchants with a **live risk** column; the **mule-pattern alert** case (QR volume spike → acquiring signal feeds account risk, Low→Medium); Recharts trend; re-KYC schedule.

**B5 Admin/rules (light)** — editable risk weights, band thresholds, tier (₹40L), exposure rule (₹10 Cr / 10%), BO threshold (10%), screening lists. Editing a weight and reopening a case changes its score.

---

## Verification engine (shared)

Parallel fan-out into six pillars. Each check returns `{ id, pillar, label, status, severity, weight, value, source, ts }`, `status ∈ pass | flag | fail | pending | error`.

- **Identity:** Aadhaar (DigiLocker/OTP), PAN validate, PAN–Aadhaar link, face/liveness or biometric, per person.
- **Business:** entity PAN, GSTIN status + filing history, MCA status (LLP/Pvt), Udyam, name/entity match across sources.
- **Financial:** penny-drop name match, optional AA statement, exposure (CRILC/bureau/NeSL) for the gate.
- **Premises:** CPV (geo-photo/tele/physical), address match vs OVD.
- **Ownership/network:** BO determination, ownership graph, shared-attribute detection (address/phone/email/device/account across entities), shell signals (recent incorporation, no filings), mule signals.
- **Screening:** AML/sanctions/PEP/adverse-media on the entity + every person.

**Roll-up:** pillar scores → weighted composite (0–100) → band (Low 0–30 auto-approve where tier permits; Medium 31–70 officer review; High 71–100 decline/deep review). **Hard-stops** (sanctions true match, struck-off link, confirmed mule) force High. Every contributing check emits a human-readable reason code. All weights/thresholds come from the Admin config (`05_MOCK_DATA.md`).
