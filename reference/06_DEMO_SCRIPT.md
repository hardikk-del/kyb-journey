# 06 — Demo script (the click path that must never break)

This is the live pitch. Build so this exact path is flawless: no dead ends, no stalls without feedback, no placeholder content. Five acts, ~8–10 minutes. Each act has a "so what" line aimed at a banker.

## Act 1 — Speed without losing control (Saanvi Textiles, proprietorship)
**Path:** Onboarding → Start → choose Proprietorship → enter PAN `ABKPS4321F` → tier chip shows "Simplified DD (≤ ₹40L)" → confirm prefilled business details → proprietor identity (in-person biometric) → light document step → penny-drop pass → premises geo-photo → Submit → **Verify screen runs** (checks resolve, gauge settles to Low ~12) → Approved → account opened (number + IFSC) → deploy **QR + Soundbox** from the same profile → Activated.
**So what:** "A clean merchant goes from walk-in to live in minutes, fully automated, with every step logged — versus 3–10 days today."

## Act 2 — One journey, one profile (continue from Act 1)
**Path:** On the deploy screen, point to the line "No re-verification needed — using the verified Secure ID profile." Show the QR/MID generated against the same entity.
**So what:** "Account opening and merchant acquiring are one journey here, not two teams doing KYB twice. That's where your cost and drop-off live."

## Act 3 — Fraud caught before approval (Vertex Trading Pvt Ltd)
**Path:** Bank console → Applications queue → open **Vertex Trading Pvt Ltd** (risk band High). In Case Detail: glance at the risk panel (score ~88, hard-stop reason codes) → open the **ownership & network graph** → the shell cluster is visible: one address node linked to Vertex + five other companies, four marked struck-off, a mule-flagged account bridging two of them, director Rakesh Kumar linked across them → screening shows adverse media → Decline with reason category "ownership/network risk" (recorded) → show the audit timeline entry.
**So what:** "On paper this passed — active GST, valid CIN, real directors. The network graph is what stops the shell and the mule before a rupee moves. This is the fraud your manual review misses."

## Act 4 — The officer's exception lane (Greenleaf Organics LLP + Maa Durga)
**Path:** Open **Greenleaf Organics LLP** (Medium). Everything on one screen: risk, the single amber reason (GST filing lapsed), checks with sources, people, graph. Officer chooses "Request info" or "Approve with reason", records the reason, senior (checker) confirms → audit updates. Then briefly open **Maa Durga Enterprises** to show the actionable "more info needed" return path and the name-mismatch comparison.
**So what:** "Only genuine exceptions reach a human — and when they do, it's one screen and a defensible, recorded decision, not four desks and a week."

## Act 5 — Continuous, unified monitoring (QuickCart Retail)
**Path:** Bank console → Monitoring → **QuickCart Retail**: live risk moved Low → Medium; the trend shows a QR transaction spike; an alert notes the mule-pattern from the acquiring side feeding the account risk view; re-KYC suggested.
**So what:** "Monitoring isn't a re-KYC reminder every two years. Acquiring behaviour feeds the account's risk in real time — the same fraud lens stays on after go-live."

## Optional closer — Configurability (Admin)
**Path:** Admin/Rules → nudge a risk weight or the exposure threshold → reopen a case → the score/decision reflects it.
**So what:** "Your risk appetite, your thresholds. Kotak's policy isn't RBL's — this is policy you configure, not code you rewrite."

## Demo hygiene (build for these)
- A "reset demo" control that returns all fixtures to their starting state.
- A hidden "instant mode" so rehearsals don't wait on simulated latency.
- Deep links to each hero screen (queue, the Vertex case, monitoring) so the presenter can jump if needed.
- Everything works on tablet width and with keyboard only.
- The "Demo data" chip is always visible so no one mistakes it for production with real customer data.
