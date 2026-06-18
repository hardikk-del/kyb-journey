# BUILD INSTRUCTIONS — Secure ID (phone-first, end-to-end)

This is the authoritative build brief. It **supersedes `00_BUILD_PROMPT.md`** and, for the onboarding surface's form factor, **overrides any desktop-leaning wording** in `02_JOURNEY.md` and `04_DESIGN_SYSTEM.md`.

## What to hand Claude Code
Put these in the repo and reference them:
- `index.html` — the **Meridian/IDfy-style replica**. Reference ONLY (see below).
- `CLAUDE.md`, `01_PRD.md`, `02_JOURNEY.md`, `03_EDGE_CASES.md`, `04_DESIGN_SYSTEM.md`, `05_MOCK_DATA.md`, `06_DEMO_SCRIPT.md`.
- This file.

## How to treat `index.html` (reference, not template)
It is a 9-phase / 37-screen desktop assisted current-account flow ("Meridian Bank"). Use it to understand the **capture sequence and the field-level detail** Indian banks expect (entity type, exposure question, document collection via link, PAN/bureau, KYC via DigiLocker/face/signature/selfie, GST + business address + proof, FATCA + site/nameplate check, product + bank statement, RM declaration, preview + submit).

Do **NOT**: copy its desktop+sidebar layout, its "Meridian/TrustLayer" branding, its blue palette, Inter font, emoji, gradient logo, or its 37-step linear structure. Those are exactly what we're improving on. Build Secure ID's own identity from `04_DESIGN_SYSTEM.md`.

## Our journey must beat the replica on these axes
1. **Fewer steps.** Auto-prefill from one anchor identifier (PAN/GSTIN) and show only entity-relevant steps. Progressive disclosure, not 37 linear screens.
2. **Phone-first.** Native mobile patterns, not a desktop form with a sidebar.
3. **Parallel verification → one risk score** with reason codes (signature moment), instead of sequential checks with no verdict.
4. **Ownership/network graph + shell/mule detection** — a fraud lens the replica entirely lacks.
5. **Unified through to activation** — continue past account opening into POS/QR deployment from the same verified profile (no second KYB), then continuous monitoring that ingests acquiring signals.
6. **Automated gating** — exposure gate (configurable ₹10cr / 10% share) and tier auto-classification (≤₹40L simplified DD), replacing the manual "₹5 Cr?" dropdown.
7. **Bespoke, production-grade visuals** — sapphire/ink + Geist, restrained, real UI states; none of the replica's generic tells.
8. **Two surfaces** — phone onboarding (agent/merchant) + desktop officer console (the pitch hero). The replica has only the assisted capture flow.

## Form factor (authoritative)
- **Onboarding/capture surface = phone-first.** Build a **React web app** (not React Native) designed at **390px**, with native-app patterns: single column; large touch targets (≥44px); primary action **bottom-anchored**; **bottom sheets/drawers** instead of centered modals; a slim **top step-progress** bar (not a sidebar); native-feeling camera/upload affordances for documents, selfie/face, signature, and the premises photo. When viewed on desktop, render this surface **inside a phone device frame** so it demos as "the app the field agent or merchant uses."
- **Bank console = desktop**, exactly as in `02`/`04` (left-nav console, data tables, the ownership graph). It's the hero.
- One responsive codebase, one deploy. (If a real installable field app is needed later, that's a separate React Native/Expo track — out of scope for the pitch.)
- Tablet width and keyboard navigation still work; respect `prefers-reduced-motion`.

## Tech stack
As in `CLAUDE.md` (React 18 + TS + Vite, Tailwind with the custom token theme, React Router, Zustand, Radix, Framer Motion, @xyflow/react for the graph, Recharts, lucide, Geist + Geist Mono). Add a lightweight `PhoneFrame` component for the onboarding surface on desktop. No backend — typed fixtures from `05` with simulated latency.

## Phase plan
End each phase with a self-critique against the `CLAUDE.md` anti-generic checklist, a commit, and a short status summary. Don't build everything at once.

- **Phase 0 — Reference analysis (no app code).** Read `index.html` and all reference files. Produce `REFERENCE_FROM_REPLICA.md`: the replica's step/field inventory, then a mapping onto our seven-stage journey across the four entity types, marking what we cut, merge, automate, or add (the eight improvements above). Stop for review.
- **Phase 1 — Foundation & identity.** Scaffold the stack; implement the `04` token system (override Tailwind defaults); build `lib` formatters (INR + PAN/GSTIN/CIN/Udyam/IFSC), `lib/status.ts`, the `PhoneFrame`, the desktop app shell, and core primitives on a `/kitchen-sink` route. Gate: shell + primitives look production-grade before feature work.
- **Phase 2 — Data & verification engine.** Types + fixtures from `05`; the `services` layer (simulated latency) and the risk engine (pillars → weighted score → band + reason codes, hard-stops, config-driven).
- **Phase 3 — Phone-first onboarding (capture).** The capture flow from `02` Surface A, phone-first, with entity-type branching (Proprietorship / Partnership / LLP / Pvt Ltd), smart prefill, and the implemented edge cases/states from `03`. Resume-from-draft + more-info return path.
- **Phase 4 — Verify moment + outcome.** The parallel-check + risk-score assembly (signature moment #1) and the four outcomes.
- **Phase 5 — Account + POS/QR + activation.** Account opened → deploy QR/Soundbox/POS/Gateway MID from the same profile (show "no second KYB") → activation with initial limits.
- **Phase 6 — Desktop bank console (hero).** Dashboard/pipeline, applications queue, and Case Detail with the risk panel, checks, the **ownership/network graph** (signature #2), people/KYC, documents, decision bar (recorded reason + maker-checker), audit timeline. Wire the exposure gate.
- **Phase 7 — Monitoring + admin.** Portfolio monitoring with the mule-pattern alert (acquiring → account risk), re-KYC schedule; light Admin/Rules config that visibly changes a case's score.
- **Phase 8 — Polish & QA.** Walk `06_DEMO_SCRIPT.md` end to end; every screen has all five states; full anti-generic sweep; reduced-motion; keyboard; tablet width; consistent formatting of all IDs/amounts.

---

## Kickoff prompt (paste as the first message, with `index.html` and the reference files in the repo)

> You are building Secure ID — a phone-first, end-to-end clickable prototype of an assisted onboarding + KYB + current-account-opening + POS/QR deployment platform for Indian banks, demoed live to senior bankers. It is a React web app with no backend; all data is the typed fixtures in `05_MOCK_DATA.md` with simulated verification latency.
>
> Read `BUILD_INSTRUCTIONS.md`, `CLAUDE.md`, and reference files `01`–`06` fully before doing anything. `index.html` in this repo is a desktop "Meridian/IDfy-style" replica — treat it as REFERENCE ONLY for the capture sequence and field-level detail. Do not copy its layout, branding, palette, font, emoji, or its 37-step structure; we are explicitly improving on all of that. Build Secure ID's own identity from `04_DESIGN_SYSTEM.md`.
>
> Form factor is authoritative: the onboarding/capture surface is PHONE-FIRST (390px, native mobile patterns, bottom-anchored actions, bottom sheets, top step-progress, real camera/upload affordances) and renders inside a phone device frame on desktop. The bank console is DESKTOP and is the pitch hero. One responsive codebase.
>
> Our journey must beat the replica on the eight axes listed in `BUILD_INSTRUCTIONS.md` (fewer/auto-prefilled steps, parallel verification into one risk score, ownership/network fraud graph, unified flow through to POS/QR and monitoring, automated exposure + tier gating, bespoke production-grade visuals, and the phone + desktop split).
>
> Do not build app code yet. Start with Phase 0: read `index.html`, produce `REFERENCE_FROM_REPLICA.md` (its step/field inventory and a mapping onto our seven-stage journey across the four entity types, marking what we cut, merge, automate, or add), then summarise and stop for my review. After I approve, proceed through the phase plan, committing and self-critiquing at each phase.

## Guardrails to repeat if it drifts
- "Onboarding is a phone app in a device frame — no desktop sidebar there."
- "That's the replica's generic look — re-derive from `04` (sapphire/ink, Geist, restrained, no emoji, no gradient logo)."
- "Cut/auto-fill this step — we are not rebuilding 37 linear screens."
- "Show me the loading, empty, and error states too."
- "Use the fixtures; no placeholder names or lorem ipsum."
