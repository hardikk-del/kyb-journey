# CLAUDE.md — Secure ID (phone-first onboarding app + desktop bank console)

Auto-loaded by Claude Code. This is the standing contract for the build. Read every reference file in this folder before writing code:

- `00_BUILD_PROMPT.md` — kickoff prompt + phase plan (start here)
- `01_PRD.md` — what we're building and for whom
- `02_JOURNEY.md` — the phone-first journey, all entity types, mapped onto the replica
- `03_EDGE_CASES.md` — states and exceptions to implement
- `04_DESIGN_SYSTEM.md` — exact tokens, mobile patterns, the signature element
- `05_MOCK_DATA.md` — fixtures + the scripted fraud case
- `06_DEMO_SCRIPT.md` — the live click path that must never break
- `07_REPLICA_REVIEW.md` — what `index.html` does and exactly how we beat it

## Reference build

`index.html` (provided) is a working IDfy-style **capture-only** prototype ("Meridian Bank"). Treat it as a **reference for the capture flow and field-level detail only**. Read it, mine the sequence and the fields, then build something better and more complete. Do **not** copy its visual design, its left-sidebar desktop shell, its branding, its emoji, or its generic styling. Our journey goes far beyond where it stops (it ends at "submitted for processing"). See `07_REPLICA_REVIEW.md` for the gap list.

## What this is

A clickable, front-end-only prototype of **Secure ID** — assisted onboarding + KYB + current-account opening + POS/QR deployment + monitoring for Indian banks. Pitched live to senior bankers. **No backend**: typed in-memory fixtures; verifications simulated with realistic latency.

## Two surfaces, two form factors

1. **Onboarding app — PHONE-FIRST.** This is the app a field agent or merchant uses. Design at a 390px viewport with native-app patterns. On desktop, render it inside a **phone device frame** so it reads as a real mobile app during the demo.
2. **Bank console — DESKTOP.** The ops/risk officer surface (queue, case detail, ownership graph, decisioning, monitoring, admin). Officers don't work on phones. This is the pitch hero.

One responsive React codebase. Same design tokens across both.

## The two non-negotiable quality bars

1. **Looks like a live production app, not an AI/vibe-coded demo.** Bankers run KYB daily. Run the anti-generic checklist below every phase.
2. **Seamless.** Every transition, state, and number is deliberate. No dead ends, no placeholder text, no broken back button.

## Tech stack (use exactly this)

- **React 18 + TypeScript + Vite**, **React Router v6**.
- **Tailwind CSS** with a fully custom theme in `tailwind.config.ts` (see `04`). Override defaults — nothing should read as "Tailwind default."
- **Radix UI** primitives for all interactive controls (Dialog/Sheet, Select, Popover, Tabs, Tooltip, Checkbox, RadioGroup). Never hand-roll a native `<select>` or modal.
- **Framer Motion** — only for the signature moments (risk-score assembly, graph reveal) + small micro-interactions and sheet transitions. Respect `prefers-reduced-motion`.
- **@xyflow/react** (React Flow) for the ownership/network graph — the signature element (desktop console).
- **Recharts** for the small monitoring trends only.
- **Zustand** for state; data in `/src/data` (typed fixtures); `/src/services` fakes API calls with `await sleep()`.
- **lucide-react** icons, single stroke width, 16/20px, sparing. **No emoji anywhere.**
- Fonts: **Geist** (UI) + **Geist Mono** (IDs, codes, amounts). Tabular numerals on all numbers/IDs.
- A `PhoneFrame` component wraps the onboarding surface on desktop.

## Project structure

```
src/
  app/            Router + the two shells (PhoneShell, ConsoleShell), PhoneFrame
  features/
    onboarding/   Phone-first capture → verify → decision → account → deploy → activate
    console/      Desktop: pipeline, applications, case detail, monitoring, admin
    verification/ Check engine, risk scoring, ownership graph
  components/     Primitives (Button, StatusPill, Field, Sheet, DataTable, RiskGauge, IdChip, Stepper...)
  data/           Typed fixtures (entities, people, the demo cases)
  services/       Fake API layer (simulated latency, deterministic per fixture)
  lib/            format (INR, PAN/GST/CIN masks), status map, sleep, validators
  styles/         tokens.css, globals
```

## Engineering conventions

- TS strict, no `any`. Model the domain: `EntityType`, `Check`, `CheckStatus`, `RiskBand`, `Person`, `BeneficialOwner`, `Application`, `Decision`, `AuditEvent`.
- List/detail screens read from a Promise-returning service so loading/error states are real.
- Centralise formatting (`lib/format.ts`) and status→color/label (`lib/status.ts`). Never inline a hex.
- Deep-linkable routes; browser back always works; captured data survives navigation.

## Definition of done (per screen)

Happy + loading (skeletons) + empty (with a next action) + error (with a fix) + partial/in-progress. Numbers tabular; IDs in mono with correct Indian formats. Keyboard focus order correct. Nothing hardcoded that should be a fixture.

## Anti-generic checklist (run every phase)

- [ ] No emoji. No gradient logos/buttons/heroes. No glassmorphism, neon glow, or big colored shadows.
- [ ] No lorem ipsum / "John Doe" — only the realistic Indian fixtures.
- [ ] Color restrained: neutrals + one sapphire accent + risk green/amber/red used **only** for status.
- [ ] 4px spacing grid throughout. Touch targets ≥44px on the phone surface.
- [ ] IDs (PAN/GSTIN/CIN/Udyam/IFSC) and money in mono, tabular, correct Indian formats.
- [ ] Borders carry structure; shadows faint and only for sheets/popovers.
- [ ] Radius modest and consistent (6–8px). Not pill-everything, not 0.
- [ ] Onboarding is a phone app (single column, top progress, bottom-anchored primary action, bottom sheets) — **not** the replica's desktop sidebar.
- [ ] Console is a real desktop app shell (left nav, topbar, breadcrumbs) — not a centered column.
- [ ] Motion limited to the two signature moments + micro-interactions; reduced-motion respected.

## Hard rules

- Use `index.html` and any competitor material as reference only; never reproduce their UI/branding.
- Commit at the end of every phase; self-critique against the checklist before declaring a phase done.
- Ask before adding any library not listed above.
