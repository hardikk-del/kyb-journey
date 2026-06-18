# 04 — Design system (phone-first app + desktop console)

The onboarding app must feel like a real, crafted native mobile app; the console like a serious desktop operations tool. The aesthetic is **restrained, precise, evidentiary** — the opposite of a templated demo. Spend boldness in exactly one place: the **ownership/network graph**. Everything else stays quiet. The replica's look (gradient logo, emoji, rounded-everything, default blue, Inter) is the anti-pattern; do not echo it.

## Identity in one line

Secure ID = "verification infrastructure you can trust." Sober, deep ink-navy with a single sapphire accent; risk shown through tightly-scoped green/amber/red; numbers and IDs rendered with the care of a financial terminal.

## Color tokens (exact; put in `tailwind.config.ts` + `tokens.css`)

Neutrals (cool, custom — not Tailwind slate):
- `--paper` #F6F7F9 · `--surface` #FFFFFF · `--surface-sunken` #EFF1F4
- `--line` #E3E7EC · `--line-strong` #C9D0D9
- `--ink` #0D1B2A (primary text — deep navy, never pure black) · `--ink-2` #45566A · `--ink-3` #76859A

Brand (sapphire — the only accent; primary actions, active nav, selected, focus):
- `--brand-700` #1B3A8F · `--brand-600` #2347A8 · `--brand-500` #325AC4 · `--brand-50` #EDF1FB

Risk semantics (status only — never decoration):
- Low/pass `--ok` #1A7A4C on `--ok-bg` #E7F4EC
- Medium/review `--warn` #8A5D00 on `--warn-bg` #FBF1DD
- High/decline/fail `--risk` #A4322B on `--risk-bg` #FAEAE8
- Pending/info `--brand-600` on `--brand-50`

Only these colors appear. No gradients. Non-status surfaces are neutral.

## Typography

- UI/headings **Geist**; IDs/codes/amounts **Geist Mono**, `font-variant-numeric: tabular-nums`.
- Phone scale: screen title 20/28/600; section 16/24/600; body 15/22/400; label 13/18/500; caption 12/16/400; mono 14/20/450.
- Console scale (denser): page title 24/32/600; H1 18/26/600; H2 15/22/600; body 14/21/400; table label 12/16/500 uppercase +0.2px; mono 13/20.
- Sentence case (except small uppercase labels). Numbers/money/IDs always Geist Mono.

## Spacing, radius, elevation

- 4px grid: 4/8/12/16/24/32/48 only.
- Phone: touch targets ≥44px; inputs 48px; bottom action bar 64px; screen padding 16–20px.
- Console: controls 38px; table rows 44px; section padding 20–24px.
- Radius: 8px controls/inputs/cards/sheets on phone; 6–8px on console; 10px modals. Consistent; not pills (except status dots), not 0.
- Elevation: borders do the work. Faint shadows only for sheets/popovers (`0 6px 24px -8px rgba(13,27,42,.18)`) and modals. Cards use a `--line` border, no shadow.
- Focus: 2px `--brand-500` ring, 2px offset, always visible on keyboard nav.

## Phone surface — patterns (the part the replica got wrong)

- A real phone canvas, **not** a desktop sidebar. On desktop, wrap it in `PhoneFrame` (a clean device bezel, ~390×844, subtle drop shadow on `--paper`).
- **Top app bar** (52px): back chevron, centered title, "Demo data" tag; a 3px progress bar beneath.
- **One scrollable column.** No multi-column forms. Group fields in `SectionCard`s.
- **Bottom action bar** (sticky): primary button full-width-ish, pinned; secondary/back to its left. The primary names the action and matches the resulting toast.
- **Bottom sheets** (Radix Dialog styled as a sheet) for pickers, confirmations, and the funding/offer modal — slide up, not centered.
- **Capture**: camera steps show a viewport mock with a capture button; uploads show file rows with thumbnails + extracted fields + a match indicator.
- **Per-person / per-document** items are tappable rows with status chips, expanding to a sheet for detail.
- Inputs: large, 16px text (avoid iOS zoom), inline validation, helper/error text.

## Console surface — app shell

- Left sidebar (240px): Secure ID wordmark (typographic, **no gradient tile**); surface switcher; nav groups (Pipeline, Applications, Monitoring, Admin) with lucide icons; active item = `--brand-50` bg + `--brand-600` text + 2px left accent.
- Topbar (56px): breadcrumbs, "Demo data" chip, officer/role switcher (maker-checker), search.
- Content: disciplined max-width, never a single centered column for data.

## Core components (build on a hidden `/kitchen-sink` first)

Button (primary/secondary/ghost/destructive, loading/disabled states), StatusPill (dot+label from `lib/status.ts`), Field (Radix controls), Sheet, DataTable (sticky uppercase header, 44px rows, hairline borders, right-aligned mono numbers, sortable, loading/empty states), StatCard (no gradient, no big icon), SectionCard, Stepper/ProgressBar (entity-aware), RiskGauge (0–100 arc/segments in band color), IdChip (PAN/GSTIN/CIN/Udyam/IFSC in mono on `--surface-sunken`, copyable), PhoneFrame, EmptyState (one line + one action; no illustration, no emoji), Skeleton, Toast, Tooltip, Tabs, DropdownMenu.

## Motion (Framer Motion, minimal)

- **Signature #1 — risk-score assembly:** checks resolve sequentially (~120ms stagger) from pending to status; gauge animates to the band over ~600ms; reason codes fade in. ≤5s, skippable.
- **Signature #2 — ownership graph reveal:** nodes fade/scale from the focal entity outward; risky edges draw last and pulse once. No looping.
- Elsewhere: 120–160ms hover/press; sheet slide-up; panel fades ≤200ms; toast slide. `prefers-reduced-motion` → instant.

## Signature element — ownership & network graph (console)

React Flow. Node types: `entity` (focal, sapphire), `person`, `connected-entity`, `attribute` (shared address/phone/email/account). Edges labelled (`owns X%`, `director of`, `partner in`, `shares address`, `same bank account`, `signatory`). Clean = neutral ink + `--line`; flagged = `--risk`. Click a node → side panel mini-profile (status, IDs, why flagged). For the fraud fixture the layout makes the shell cluster legible instantly. Keep the rest of the case screen calm so the graph carries the weight.

## Copy & voice (design material)

Plain, active, sentence case. Buttons name the action ("Open account", not "Submit"); the toast matches ("Account opened"). End-user vocabulary ("ownership", "premises check", "screening"). Errors state what happened and the fix, no apology. Empty states invite the next action. Real Indian content only — no lorem ipsum, no "Acme", no "John Doe", and no emoji.

## AI-default looks to avoid (calibration)

Not: (1) cream + serif + terracotta; (2) near-black + acid accent; (3) broadsheet hairlines + zero radius. And not the broader vibe-code tells the replica shows: gradient logos/buttons, emoji, rounded-everything with heavy shadows, default indigo/blue, glassmorphism, neon glow, centered marketing layouts, off-grid spacing. Our direction is cool light neutrals, one sapphire accent, modest radius, native-app density on phone and console density on desktop.

## Self-critique each phase

"If I built this screen for any fintech, would I land here by default? Where is the choice specific to Secure ID's evidentiary identity?" Revise defaults; then run the `CLAUDE.md` anti-generic checklist; for the phone surface, verify touch targets, bottom-anchored actions, and that it does not look like a shrunk desktop page.
