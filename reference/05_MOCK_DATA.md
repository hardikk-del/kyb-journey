# 05 — Mock data & fixtures

All data is typed and lives in `/src/data`. Verifications are deterministic per fixture: a given business always produces the same scripted check results, so the demo is repeatable. Use realistic Indian formats — this is what makes it credible to bankers.

## ID formats (generate values that match these exactly)

- **PAN** — 10 chars: 5 letters + 4 digits + 1 letter. The 4th letter encodes holder type: `P` individual/proprietor, `C` company, `F` firm/LLP, `H` HUF, `T` trust. e.g. proprietor `ABKPS4321F`, company `AAGCV8765K`, firm `AAEFG2109H`.
- **GSTIN** — 15 chars: 2-digit state code + 10-char PAN + 1 entity digit + `Z` + 1 checksum. e.g. `29AAGCV8765K1Z4` (29 = Karnataka).
- **CIN** — 21 chars: e.g. `U51909KA2021PTC145678` (U=unlisted, 5-digit industry, KA state, year, PTC=private, 6-digit number).
- **LLPIN** — e.g. `AAF-7421`.
- **Udyam** — e.g. `UDYAM-KA-03-0456712`.
- **DIN** — 8 digits, e.g. `09214567`.
- **IFSC** — e.g. `HDFC0001289`; display account numbers masked: `••••••4471`.
- **Money** — Indian grouping with ₹: `₹42,50,000`, `₹1,20,00,000`. State codes: Karnataka 29, Maharashtra 27, Delhi 07, Tamil Nadu 33.

## Fixture set (six businesses driving the demo)

### 1. Saanvi Textiles — Proprietorship — THE SPEED CASE (clean, auto-approve)
- Proprietor: Saanvi Reddy. PAN `ABKPS4321F`, Aadhaar-linked, in-person biometric e-KYC.
- GSTIN `29ABKPS4321F1Z8` (active, returns filed), Udyam `UDYAM-KA-03-0456712`. Declared turnover ₹38,00,000 → **Simplified DD tier**.
- Bank account penny-drop: name match pass. Premises CPV: geo-photo, address match.
- All checks pass; ownership graph trivial. **Risk: Low (score ~12)** → auto-approve → current account → QR + Soundbox deployed → activated. Median path: minutes.

### 2. Greenleaf Organics LLP — LLP — THE OFFICER-REVIEW CASE (one amber flag)
- LLPIN `AAF-7421`, firm PAN `AAEFG2109H`, GSTIN `29AAEFG2109H1Z2`.
- Designated partners: Arjun Mehta (DIN `09214567`), Kavya Nair (DIN `09887123`) — both KYC clean, BOs at 50/50.
- MCA status: active. **GST filing lapsed** (no returns last 2 quarters) → amber flag. Penny-drop pass.
- **Risk: Medium (score ~46)** → routed to officer. Officer reviews, requests the latest GST filing or accepts with a recorded reason, then approves. Demonstrates the exception lane + recorded-reason + maker-checker.

### 3. Vertex Trading Pvt Ltd — Private Limited — THE FRAUD CASE (the wow)
- CIN `U51909KA2021PTC145678`, firm PAN `AAGCV8765K`, GSTIN `29AAGCV8765K1Z4`. Documents all look in order on the surface; GSTIN shows active.
- Directors: Rakesh Kumar (DIN `08123456`, authorised signatory), Sunita Rao (DIN `08456789`).
- **The catch (surfaces only in the ownership/network graph + screening):**
  - Registered address `No. 14, 2nd Cross, Lakshmi Layout, Bengaluru 560022` is **shared with five other companies**.
  - Director Rakesh Kumar is **linked to six entities**; **four are struck-off** in MCA.
  - The nominated settlement **bank account is mule-flagged** (rapid in-out pattern) and is **shared with one of the struck-off entities**.
  - Vertex was **incorporated 4 months ago** with **no GST filings yet** despite a high declared turnover (₹2,40,00,000) → shell + turnover-mismatch signals.
- **Risk: High (score ~88), hard-stop on struck-off-entity link + mule account** → decline with reason category "ownership/network risk". The graph makes the shell cluster legible instantly.

### 4. Maa Durga Enterprises — Partnership firm — THE MORE-INFO CASE
- Firm PAN `AAEFM5566G`, partnership deed on file. Partners: Vikram Shah, Pooja Shah (60/40 profit share).
- **GSTIN `27AAEFM5566G1Z9` suspended** + **penny-drop name mismatch** ("Maa Durga Enterprise" vs "Maa Durga Enterprises") → flags.
- **Risk: Medium**, outcome **more info needed**: "GSTIN appears suspended — upload current registration; confirm the bank account name." Demonstrates the actionable return path and the name-mismatch comparison UI.

### 5. QuickCart Retail Pvt Ltd — Private Limited — THE MONITORING CASE (already live)
- Onboarded clean weeks ago; active merchant with a QR + POS MID.
- In monitoring, its **QR transaction volume spikes abnormally** (fan-in pattern) → a **mule-pattern alert** flows from acquiring into the account risk view; live risk moves Low → Medium; re-KYC suggested. Recharts trend shows the spike. Demonstrates continuous, unified monitoring.

### 6. Anand Kirana Store — Proprietorship — THE EDGE-CASE SAMPLER (optional)
- Not GST-registered (legitimately below threshold) → relies on Udyam + Shop & Establishment + utility bill. **PAN–Aadhaar link pending** flag. OTP e-KYC chosen → EDD + limited account path shown. Useful to demonstrate that small, thin-file merchants aren't unfairly punished and that the OTP path consequences are explicit.

## People pool (reuse across fixtures; keep names realistic and varied)

Saanvi Reddy, Arjun Mehta, Kavya Nair, Rakesh Kumar, Sunita Rao, Vikram Shah, Pooja Shah, Anand Kumar, plus officers: **R. Iyer** (onboarding officer / maker) and **Meghna Desai** (senior / checker).

## Screening fixtures

- Default: clear.
- Vertex / Rakesh Kumar: adverse-media hits (entity strike-offs) + the network hard-stop.
- Include one **false-positive sanctions hit** on a common name (e.g., a partner) so the officer can clear it with a recorded disambiguation — demonstrates true-vs-false-positive handling.

## Latency model

Each simulated check resolves after 800–2500ms (vary per check so the Verify screen feels alive, not synchronised). Keep it deterministic per fixture id so demos repeat identically. Provide a hidden "instant mode" toggle for rehearsal.

## Config object (editable in Admin)

```
riskWeights: { identity, business, financial, premises, ownership, screening }   // sum to 1
bands: { lowMax: 30, mediumMax: 70 }
tierTurnoverThreshold: 4000000           // ₹40 lakh
exposure: { freeBelow: 100000000, minShareAtOrAbove: 0.10 }  // ₹10cr / 10%
beneficialOwnerThreshold: 0.10           // >10%
hardStops: ['sanctions_true_match', 'struck_off_link', 'confirmed_mule']
```
Editing a weight and reopening a case must change that case's score — prove it live.
