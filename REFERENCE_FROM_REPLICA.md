# REFERENCE_FROM_REPLICA — what `index.html` does, and how Secure ID beats it

Phase 0 deliverable. This is an analysis of the Meridian Bank replica (`index.html`) — a front-end-only, **desktop, sidebar-driven, 37-screen linear** assisted current-account flow. We mine it for the **capture sequence and field-level detail** Indian banks expect, then map every step onto Secure ID's **seven-stage, phone-first** journey, marking what we **cut, merge, automate, or add** — and tying each move to the eight improvement axes in `BUILD_INSTRUCTIONS.md`.

Reference only. We copy none of its layout, branding (Meridian / TrustLayer), blue palette, Inter font, emoji, gradient logo, or its 9-phase/37-screen structure.

---

## A. Replica structure at a glance

**9 phases (sidebar):** Customer Details → Document Collection → Need of Discipline → KYC Details → Business Details → FATCA & Site Check → Account Setup → RM Declaration → Post Onboarding.

**37 screens, linear, desktop two-column (260px stepper sidebar + main card).** Single hardcoded entity (`Sole Proprietorship`, "Ramesh Raj" / PAN `CHTPR0429G`). No entity branching, no verdict, no risk score, no ownership view, no decisioning, no monitoring. It ends at "Application submitted for processing" — a dead end.

---

## B. Full screen + field inventory (the part worth mining)

| # | Screen key | Phase | What it captures / does | Fields & detail to carry forward |
|---|---|---|---|---|
| 1 | `overview` | Customer | Journey overview, 9-step list, "Start journey" | — |
| 2 | `custForm` | Customer | Customer profile + **entity type** + **₹5 Cr exposure question** | Full name, phone, email, **entity type** (Sole Prop / Partnership / Pvt Ltd / LLP / Public Ltd / HUF / Trust), "credit exposure > ₹5 Cr?" (yes/no radio) |
| 3 | `camPerm` | Customer | Camera permission (auto-advance 2.2s) | Purpose line: capture docs & selfies |
| 4 | `locPerm` | Customer | Location permission (auto-advance) | Purpose line: geo-tag site verification |
| 5 | `sendLink` | Docs | Send secure upload link **or** upload on behalf | Doc checklist (PAN, ID proof, Business proof I/II, Bureau consent); channel (SMS/WhatsApp); customer mobile |
| 6 | `sending` | Docs | "Sending link…" spinner (1.6s) | channel + phone echoed |
| 7 | `linkSent` | Docs | "Link sent" success (auto-advance) | — |
| 8 | `uploading` | Docs | Tracker: "2 captured", waiting | upload count, "link sent 5 mins ago" |
| 9 | `waiting` | Docs | Tracker: "3 captured", pulsing | upload count |
| 10 | `docPan` | Docs | Received PAN, OCR preview | PAN, name, DOB; **Original / Not Tampered / Quality OK** badges; "request retake" |
| 11 | `docList` | Docs | Document status list + fill gaps | 5 docs w/ statuses; Business Proof II type picker (Shop Est / Udyam / Trade License / Utility Bill) |
| 12 | `docBureau` | Docs | GST uploaded + **bureau check consent** | GST cert preview; bureau-check consent checkbox |
| 13 | `discipline` | Discipline | **"Need of discipline"** — exposure < ₹5 Cr attestation | "Eligible · Exposure < ₹5 Cr" pill; confirm checkbox |
| 15 | `kycPan` | KYC | PAN verification | PAN, name, DOB; "add manually" |
| 16 | `kycDigi` | KYC | Identity via **DigiLocker** / Offline Aadhaar XML | method choice; fetched name/DOB/address |
| 17 | `kycFace` | KYC | **Aadhaar Face Auth** (liveness + match) | Aadhaar number (masked), name, DOB; "Verified" badge |
| 18 | `kycAddr` | KYC | Address verification | current address (from Aadhaar); "present address?" radio; address-proof type; upload |
| 19 | `kycSign` | KYC | **Signature capture** (canvas) | wet-signature pad; KYC progress 4/5 |
| 20 | `selfie` | KYC | **Customer selfie capture** | camera viewport mock + shutter |
| 21 | `bizGst` | Business | **GST verification** | doc type (GST/Udyam/Shop Est); GSTIN; legal name, trade name, address; "Initiate verification" |
| 22 | `bizAddr` | Business | Business address verification | principal place of business (from GST); "operates here?" radio; address proof type; **premises owned/rented** |
| 23 | `bizProof` | Business | Business proof docs (I GST + II Shop Est) | two doc previews, retake |
| 24 | `bizMore` | Business | Additional business details | industry, nature of business, nature of activity, **annual turnover**, **date of incorporation**, import/export |
| 25 | `fatca` | FATCA | **FATCA declaration** | foreign tax resident? (radio); **BO ≥ 25% stake?** (radio); FATCA annexure upload |
| 26 | `sitePhoto` | FATCA | **Geo-tagged premises photos** | location type (residence/office/warehouse/factory); inventory photo; main-entrance photo |
| 27 | `siteNamep` | FATCA | **Nameplate / signboard** photo + final checks | nameplate photo; address-verif + business-existence checkboxes |
| 28 | `siteResult` | FATCA | **Site verification result** | "within 500 m of GST address"; "business existence verified"; "location matches?" radio |
| 29 | `product` | Account | **Product selection** | 3 products (Digital First / Growth / Smart E-Commerce) w/ MAB + features + "best fit" |
| 30 | `bankStmt` | Account | Bank-statement-for-funding modal | 1-month statement upload (funding eligibility) |
| 31 | `bankDetails` | Account | Confirm product + **settlement bank details** | upload cheque / capture / add manually |
| 32 | `rmBasic` | RM | RM & branch details | RM name, employee ID, channel, date of sourcing, branch code, region |
| 33 | `rmSelfie` | RM | RM selfie + **sign-off** | "personally met customer" attestation; RM selfie; e-sign (OTP) / wet signature |
| 34 | `postOnb` | Post | Post-onboarding quick steps | WhatsApp-updates consent; review prompt |
| 35 | `previewA` | Post | **Application preview A** (customer & KYC, business & FATCA) | editable summary rows |
| 36 | `previewB` | Post | Preview B + **customer approval** | product summary; "get customer approval" → simulate |
| 37 | `submitted` | Post | **Submitted** (reference number) | reference no.; **dead end** |

(Screen 14 is skipped in the replica's own array — it jumps `discipline`→`kycPan`.)

**The genuinely useful capture detail to keep:** entity-type-first capture; send-link-or-upload-on-behalf; OCR preview with tamper/quality badges; DigiLocker + Aadhaar-face KYC paths; signature + selfie capture; GST legal-vs-trade-name + principal place of business; turnover + incorporation date; FATCA + BO-stake question; geo-tagged premises photo + nameplate + "within 500 m" address match; product pick; settlement account; RM attestation; preview-before-submit.

**What the replica fundamentally lacks (our whole reason to exist):** any verification *verdict*, a risk score, ownership/beneficial-owner derivation, a network/fraud graph, screening (sanctions/PEP/adverse-media), an officer/decisioning surface, account opening as a real outcome, POS/QR deployment, and any post-go-live monitoring. It also treats every entity as a sole proprietorship.

---

## C. Mapping onto Secure ID's seven stages

Secure ID journey: **Lead → Verify → Approve → Open account → Deploy POS/QR → Activate → Monitor.** Replica covers a weak Lead + the capture half of Verify, then stops.

| Replica phase / screens | Secure ID stage | Treatment |
|---|---|---|
| Customer details (2) | **Lead** | **MERGE + AUTOMATE** — entity type drives the whole flow; one anchor ID (PAN/GSTIN/mobile) lookup prefills business details; tier auto-classifies (chip). |
| Camera/location perms (3,4) | **Lead → Verify** | **MERGE + CUT** — fold into one quick permissions step with a working skip; phone-native, not two full screens. |
| Document collection (5–12) | **Verify (capture)** | **KEEP pattern, AUTOMATE substance** — same send-link/upload-on-behalf + tracker, but document set is **entity-specific** and each upload is auto-OCR'd **and cross-checked** against captured data (match/mismatch). |
| Need of discipline (13) | folded into **Approve / Open account** | **AUTOMATE** — the manual "< ₹5 Cr" attestation becomes the real, **configurable exposure gate** (₹10 Cr / 10% share) that runs behind the scenes and drives account type. |
| KYC details (15–20) | **Verify (identity)** | **KEEP + EXTEND** — per-person identity checks (Aadhaar via DigiLocker/OTP, PAN validate, PAN–Aadhaar link, face/liveness or biometric), with the **path** (in-person biometric / V-CIP / OTP-EDD) and its limited-account consequence shown inline. |
| Business details (21–24) | **Verify (business)** | **AUTOMATE** — GSTIN/MCA/Udyam **status + filing history** + name/entity match across sources, not captured text. |
| FATCA & site check (25–28) | **Verify (premises + screening)** | **KEEP + ADD** — keep FATCA + geo-photo/nameplate CPV (feeds the score); **add** AML/sanctions/PEP/adverse-media screening on entity + every person. |
| Account setup (29–31) | **Open account** | **EXTEND** — becomes a real account number + IFSC + **account type from the exposure gate** (full current vs collection-only). Product pick retained. |
| RM declaration (32,33) | retained inside **Approve** | **KEEP, lighten** — agent attestation + **maker-checker** (role toggle) on the console side. |
| Preview/submit (34–37) | **Verify → Outcome → Open → Deploy → Activate → Monitor** | **REPLACE the dead end** — submit triggers the **parallel-check risk-score assembly** (signature moment #1), a real **outcome** (Approved / In review / More info / Declined), then **Open account → Deploy QR/Soundbox/POS/Gateway MID from the same verified profile (no second KYB) → Activate with limits → continuous Monitoring.** |

---

## D. Per-entity-type treatment (the replica has none)

The replica hardcodes Sole Proprietorship. We branch the capture set, registries checked, people/BO depth, and graph richness by entity type.

| | Proprietorship | Partnership firm | LLP | Private Limited |
|---|---|---|---|---|
| **Anchor IDs** | Proprietor PAN; optional GSTIN/Udyam | Firm PAN, GSTIN, optional Udyam | **LLPIN** (MCA), firm PAN, GSTIN | **CIN** (MCA), firm PAN, GSTIN |
| **Constitutive doc** | OVD + business-existence proof (GST/Udyam/Shop Est/utility) | Registered **partnership deed** + authorisation letter | **LLP agreement** + incorporation cert + authorisation resolution | **MOA/AOA** + **board resolution** + Certificate of Incorporation |
| **People** | Proprietor only (sole BO + signatory) | All partners + authorised signatory | Designated partners (+ DIN/DPIN) + partners + signatory | Directors (+ DIN) + signatory; shareholders for BO |
| **BO derivation** | Trivial (proprietor) | Partners above threshold (profit/capital share) | Above threshold; **drill through corporate partners** | Above threshold; **trace through corporate shareholders to ultimate owners** ← fraud case lives here |
| **Extra registry checks** | — | — | MCA LLP status, DIN validation | MCA company status (active/strike-off/liquidation/dormant), DIN validation, signatory-vs-resolution |
| **Typical tier** | Usually Simplified DD (≤ ₹40L) | Full CDD | Full CDD | Full CDD |
| **Graph** | Trivial | firm → partners (with %) | LLP → designated partners → corporate partners drilled | company → shareholders (indiv + corp) → ultimate BOs; shell/mule + shared-attribute detection lights up |

---

## E. The eight improvement axes — where each one shows up

1. **Fewer steps.** 37 linear screens → progressive, entity-relevant disclosure; auto-prefill from one anchor ID; perms collapsed; preview shortened. (Targets B, C above.)
2. **Phone-first.** Replica is a desktop sidebar form. Secure ID capture is 390px native: top step-progress, one scroll column, bottom-anchored action, bottom sheets, real camera/upload affordances, in a `PhoneFrame` on desktop.
3. **Parallel verification → one risk score.** Replica has badges but no verdict. We fan six pillars (Identity, Business, Financial, Premises, Ownership/Network, Screening) into a weighted 0–100 score + band + reason codes + hard-stops (signature moment #1).
4. **Ownership/network graph + shell/mule detection.** Entirely absent in replica. Added as the desktop signature element (React Flow): the Vertex shell cluster — shared address, struck-off links, mule-flagged shared account.
5. **Unified through to activation.** Replica dead-ends at "submitted". We carry through Open account → **Deploy POS/QR from the same verified profile (no re-KYB)** → Activate → Monitor.
6. **Automated gating.** The manual "₹5 Cr?" dropdown → automated **exposure gate** (configurable ₹10 Cr / 10% share) + **tier auto-classification** (≤ ₹40L simplified DD).
7. **Bespoke, production-grade visuals.** Replica's gradient logo / emoji / default-blue / Inter / rounded-everything → sapphire/ink + Geist, restrained, real five-state UI, evidentiary tone.
8. **Two surfaces.** Replica has only assisted capture. We add the **desktop officer console** (pipeline, queue, case detail w/ risk panel + graph + decisioning + audit, monitoring, admin) as the pitch hero.

---

## F. Cut / merge / automate / add — summary ledger

- **CUT:** the 260px desktop stepper sidebar; the two full-screen permission screens (→ one skippable step); the "Need of discipline" attestation screen (→ automated gate); the linear 37-screen spine; the dead-end submitted screen.
- **MERGE:** customer details + anchor lookup into one Lead step; camera+location perms; the multi-screen document tracker into one live tracker; preview A/B into one short review.
- **AUTOMATE:** anchor-ID prefill (GSTN/MCA source tags); tier classification; OCR + cross-check on every doc; GST/MCA/Udyam status & filing-history checks; exposure gate; BO derivation; the whole risk score.
- **ADD (net new vs replica):** entity-type branching (4 types); per-person identity paths w/ EDD consequences; six-pillar parallel verification + risk gauge + reason codes + hard-stops; screening (sanctions/PEP/adverse-media w/ true-vs-false-positive handling); ownership/network fraud graph; real outcomes (4); real account opening; POS/QR deployment from one profile; activation w/ limits; continuous monitoring w/ the mule-pattern alert; the desktop officer console + maker-checker + audit timeline; light admin/rules that visibly re-scores a case; the five required UI states everywhere; reset-demo + instant-mode.

---

## G. Open questions / assumptions for the build (none blocking Phase 0)

- Replica screen 14 is intentionally absent in its own `SCREENS` array — no content lost; we don't replicate the numbering.
- `idfy-screens/` and `files.zip` are present in the working tree but empty/unreferenced by the brief; treated as out of scope unless you say otherwise.
- All fixtures, formats, and the scripted fraud case come from `05_MOCK_DATA.md`; we will not invent placeholder names.
