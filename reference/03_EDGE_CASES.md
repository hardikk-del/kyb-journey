# 03 — Edge cases & required states

Every screen must implement five states: **happy, loading (skeleton), empty (with a next action), error (with a fix), and partial/in-progress.** Beyond those, handle the domain edge cases below. Each verification check is a small state machine: `pending → (pass | flag | fail | error)`. Edge cases are not extras — they are most of what makes this look real, and several are the demo's best moments.

## Identity & KYC

- **PAN–Aadhaar not linked** → flag; UI prompts to link; account can proceed only as limited until resolved.
- **Name mismatch** between PAN, Aadhaar, GST, and bank account → flag with a side-by-side comparison; officer can accept with a recorded reason (common: minor spelling/initials).
- **V-CIP failures:** face-match below threshold, poor liveness, customer drops mid-call, document not legible → each a distinct state with retry; never a blank screen.
- **OTP e-KYC path chosen** → auto-classify the customer higher-risk, show the **EDD required + limited account** consequence inline, and require a face-to-face/V-CIP step to lift limits.
- **OVD expired** (e.g., passport) → fail with "document expired" and the specific document.
- **Minor / disqualified director or partner** → hard flag.
- **Foreign / NRI director or partner** → additional document requirement; no auto-approve.

## Business legitimacy

- **GSTIN cancelled / suspended / inactive** → flag or fail depending on severity; "more info needed" path offers alternatives.
- **Not GST-registered** (legitimately below threshold) → not a failure; rely on Udyam / Shop & Establishment / utility proof. Don't punish small merchants.
- **Multiple GSTINs on one PAN** → show all; let the user pick the one being onboarded; note multi-state operations.
- **GST filing lapsed** (registered but no recent returns) → amber flag, contributes to score, not an auto-decline.
- **MCA status not active** (strike-off / under liquidation / dormant) → hard-stop for LLP/Pvt Ltd.
- **DIN invalid / disqualified** → flag the specific director.
- **Name/entity mismatch across sources** ("X.Y. Traders Pvt Ltd" vs "X Y Traders Private Limited") → resolved by entity-matching; show the normalised match and confidence, not a raw failure.

## Financial

- **Penny-drop fails** (account closed/frozen/invalid) → fail with retry + alternate account option.
- **Penny-drop name mismatch** → flag with comparison; officer adjudication.
- **Exposure ≥ ₹10cr and bank lacks ≥10% share** → cannot open a full current account; offer **collection-account-only** or decline, per the configurable gate. Show the reasoning.
- **Borrower has CC/OD elsewhere** → route per the gate; surface the existing-facility note.
- **AA consent declined** → proceed without statement data; tier stays on declared turnover.

## Premises (CPV)

- **Address mismatch** between OVD and business premises → flag.
- **CPV fails** (premises not found, or a different business at the address) → flag/fail; schedule physical visit.
- **Geo-photo location far from declared address** → flag.

## Ownership & network (the fraud surface)

- **Beneficial owner is another company** (layered ownership) → graph must **drill through** corporate owners to ultimate individuals; an undrillable/circular chain is itself a flag.
- **Shared attributes across many entities** — same registered address, phone, email, device, or bank account linked to multiple businesses → shell-cluster flag, visualised in the graph.
- **Recently incorporated + no filings + thin footprint** → shell signal.
- **Director/partner linked to struck-off or blacklisted entities** → hard flag (this is the scripted fraud case).
- **Mule-account signals** (rapid in-out, fan-in/fan-out, mismatch with declared business) → hard flag; in monitoring, an acquiring-side spike triggers the same.
- **Circular / nominee ownership** (proxy operators) → flag when an individual fronts entities they don't economically own.

## Screening

- **Sanctions true match** → hard-stop, High, decline. **False positive** (common name) → officer can clear with a recorded reason and the disambiguating detail.
- **PEP match** → not a decline by itself; requires EDD + senior sign-off.
- **Adverse media hit** → severity-graded; show the snippet source and let the officer weigh it.

## Current-account gate & decisioning

- **Borderline score** (just over a band threshold) → routes to officer rather than auto-deciding; show why it's borderline.
- **Officer override / deviation** → always requires a reason category + free text; recorded in the audit trail; maker-checker confirmation for approvals above a config threshold.
- **Decline with recorded reason** → mandatory reason (regulatory expectation); never allow a silent decline.

## Application lifecycle

- **Duplicate application / already onboarded** → detect on anchor identifier; offer to open the existing profile instead of creating a new one.
- **Incomplete submission / customer abandons** → save draft; resume later from the same step; show drafts in a list.
- **Turnover lands near the ₹40L tier line** → recompute tier and tell the user the path changed (e.g., "now requires full CDD").
- **A verification source times out / errors** → show a degraded state ("GSTN didn't respond — retry / proceed and verify later"), never a hard crash; the check sits in `error`, not `fail`.
- **Partial verification** (some checks pass, some pending) → score shows as provisional with a "still verifying" note; no premature decision.

## System / UX

- **Slow network simulation** → skeletons, not spinners on blank screens; optimistic UI only where safe.
- **Back/forward navigation** mid-flow → never loses captured data.
- **Reduced motion** → the signature animations degrade to instant state changes.
- **Tablet width** → the console and flow remain usable (bankers may demo on an iPad).
