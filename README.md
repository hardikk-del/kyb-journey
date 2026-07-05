# Secure ID — KYB onboarding (React Native prototype)

A phone-first **Know-Your-Business onboarding** prototype for banks: capture a
business once, verify it into a single risk score, and carry it toward
activation. Frontend-only — all data is mocked in-memory; no backend, no real
integrations. Built to be demoed on an iOS simulator in front of a banker.

See [`reference/`](reference/) for the full product spec (PRD, journey, design
system, mock data, demo script).

## Stack

| Concern | Choice |
|---|---|
| Framework | Expo SDK 56 · React Native 0.85 · React 19 · TypeScript |
| Navigation | Expo Router (file-based, `src/app/`) |
| Styling | NativeWind v4 (Tailwind) — tokens in `tailwind.config.js` |
| State | Zustand (`src/features/onboarding/store.ts`) |
| Bottom sheets | `@gorhom/bottom-sheet` |
| Animation/gestures | Reanimated 4 · Gesture Handler |
| Icons | `lucide-react-native` |
| Data | Mock fixtures + a pure risk engine (`src/data`, `src/features/verification`) |

## Run on the iOS simulator

Prerequisites: macOS, Xcode with an iOS simulator runtime installed, Node ≥ 20.

```bash
npm install
npx expo run:ios        # builds the native app and boots the simulator
```

For fast JS-only iteration after the first native build, you can also run the
Metro dev server and press `i`:

```bash
npx expo start          # then press i to open iOS
```

### Open in Xcode

```bash
npx expo prebuild --platform ios   # generates the native ios/ project
open ios/*.xcworkspace
```

Then pick a simulator and hit Run.

## Project layout

```
src/
  app/                 # Expo Router screens (index = Start/Lead, business, …)
  components/ui/        # design-system primitives (Button, Field, AppBar, …)
  data/                 # types, config, fixtures, people (the domain model)
  features/
    onboarding/         # capture draft model + zustand store
    verification/       # risk engine + account/exposure gate (pure logic)
  lib/                  # formatters, validators, status tokens, helpers
  services/             # mock async API (latency-simulated)
```

## Status

Stack migrated from web (Vite/React) to React Native. The domain layer (risk
engine, gate, fixtures, validators, Indian-format helpers) is ported and
typechecks clean. The **Start/Lead** screen and **Business details** screen are
live, proving design system, navigation, anchor lookup, and registry prefill.
Remaining capture/verify/review steps plug into the same draft + risk engine.
