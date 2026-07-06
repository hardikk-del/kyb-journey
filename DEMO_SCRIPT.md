# Secure ID by Cashfree Payments — Current Account Opening
## Bank Demo Script · Private Limited Company Journey

> **Format:** Spoken narration in normal text. Stage directions and taps are in _italics_.
> **"Behind the scenes"** callouts explain what the platform does server-side — say these to make the point that this isn't just a pretty form, it's a verification engine.
>
> **The demo entity:** _Shri Shakti Properties and BMS_ — a Private Limited company running a cement manufacturing & wholesale business out of Mundra, Kutch, Gujarat. Three directors (Ravi Kumar, Rahul Mishra, Anjali Sharma); two are authorised signatories. CIN `U23941GJ2016PTC181035`, Business PAN `AAGCF5123R`.
>
> The whole flow runs on a bank representative's (RM's) phone or tablet — one guided flow, start to finish.

---

### 0 · Opening

> Hi everyone. At Secure ID by Cashfree Payments, we've built a digital-first, end-to-end current account opening solution for banks. It lets bank representatives onboard any type of business entity in a single guided flow — while making sure every required detail and document is captured, verified, and stored securely. Let me show you how it works for a Private Limited company.

_On the Start screen, select the entity type **Pvt or Public Ltd**, and enter the customer's name, mobile and email. Tap **Continue**._

> The RM starts by picking the entity type and capturing the customer's basic contact details. The journey then adapts itself to that entity — a proprietorship, an LLP, and a company each have very different KYC obligations, and the flow reshapes accordingly. Because we've chosen a Private Limited company, the platform now knows it needs beneficial ownership, a board resolution, director KYC, and a few things a proprietorship would never require.

---

### 1 · The Checklist — setting expectations up front

_The Checklist screen appears (STEP 1 OF 11)._

> The first thing the RM and the customer see is a complete checklist of everything this specific company needs to open the account — the business PAN, ownership and holding structure, KYC of every authorised signatory, business details, the incorporation certificate, the board resolution, address proof, site verification, and finally the signature.
>
> This matters because the single biggest reason account opening drags on for weeks is back-and-forth: the customer submits something, the bank comes back asking for one more document, and the cycle repeats. Here, everyone knows the full list on day one. Nothing is a surprise later.

> **Behind the scenes:** this checklist isn't hard-coded — it's generated from the entity type against the bank's own KYC policy and RBI's CDD requirements. Change the constitution and the checklist changes with it.

_Tap **Continue**._

---

### 2 · Business PAN — the first verification, and the MCA fetch

_The Business details screen appears (STEP 2 OF 11), asking for the Business PAN and the State/UT._

> Now the real work begins. The RM enters the company's PAN and selects the State where the account will be opened. Watch what happens when we verify.

_Enter PAN `AAGCF5123R`, select a State, tap **Verify PAN**. A "Fetching details from MCA…" spinner shows, then the verified card appears._

> **Behind the scenes:** the moment we hit verify, the platform does three things. It validates the PAN against the income-tax NSDL database. It pulls the company's official record straight from the **MCA — the Ministry of Corporate Affairs registry**. And it derives the GSTIN for the selected State. In a couple of seconds we get back the verified legal name — _Shri Shakti Properties and BMS_ — its CIN, and its GST number, all fetched from source rather than typed by hand.

> This is the theme you'll see through the whole journey: **we don't ask the customer to type what we can fetch and verify ourselves.** Typed data is where errors and fraud creep in. Fetched-and-verified data is what a bank can actually rely on.

_Tap **Next**._

---

### 3 · Entity & ownership — beneficial ownership and PEP screening

_The Entity & ownership screen appears (STEP 3 OF 11)._

> Because this is a company, RBI requires us to establish beneficial ownership — who actually controls this business. At the top, the entity details we just fetched from MCA are shown back for confirmation: legal name, registered address, date of incorporation.
>
> Below that, every director MCA gave us is already listed as a card — with their name, DIN, date of birth and address pre-populated. The RM simply enters each person's shareholding percentage.

_Enter shareholding for the directors. As a value crosses 10%, point to the "Beneficial owner" badge that appears._

> Notice what the system does automatically. The moment anyone crosses the 10% threshold, it flags them as a **Beneficial Owner** — that's the regulatory definition of a UBO. The platform also caps the total at 100%, so the shareholding split can never be internally inconsistent. And if there's a shareholder who isn't a director, the RM can add them here.

_Point to the three declaration checkboxes at the bottom._

> Finally, three declarations the RM confirms: that the MCA details are correct, that the shareholding is complete and every 10%-plus holder is disclosed, and — importantly — a **PEP declaration**, confirming no owner is a Politically Exposed Person. That's a hard regulatory requirement, captured explicitly rather than buried in fine print.

_Tap **Continue to signatory KYC**._

---

### 4 · Signatory KYC — DigiLocker, live selfie, or a secure link

_The Signatory KYC screen appears (STEP 4 OF 11) with a card per authorised signatory._

> Now we do full KYC on each authorised signatory. And here the RM has a genuinely powerful choice — for every person, they can either capture KYC on the spot, or send that person a secure link to do it themselves.

_Expand a signatory card. Show the "On this device" tab with its three steps._

> If the signatory is sitting right here, the RM does it on the device in three steps. **One — PAN:** captured and verified. **Two — Aadhaar via DigiLocker:** we redirect to DigiLocker, the person consents, and their Aadhaar demographic record comes back verified from the government source — no photocopies, no OCR guesswork.

_Point to the DigiLocker details block that appears._

> **Three — a live selfie** with liveness detection, which we then face-match against the PAN and Aadhaar photos. You'll see a face-match confidence score — here, 97%. That closes the loop: the person in front of us is provably the person on the documents.

_Now switch a different signatory's card to the "Send link" tab and enter a mobile number, tap **Send secure link**._

> But what if a co-director is in another city? The RM sends them a secure link over WhatsApp and SMS. That director completes their own PAN, Aadhaar and selfie on their own phone, whenever they're free — and the documents flow right back into this same screen for the RM to review and approve. The onboarding doesn't stall waiting for anyone to be in the same room.

> **Behind the scenes:** every one of these — PAN, DigiLocker Aadhaar, liveness, face-match — is an independent verified check with its own audit trail. The RM isn't eyeballing a photocopy and hoping; the system is asserting each fact.

_Once all signatories show "Verified", tap **Continue to business details**._

---

### 5 · Business details — understanding the business (and its risk)

_The Business details screen appears (STEP 5 OF 11)._

> Next we capture what the business actually does — its annual turnover band, what it sells and to whom, its sales channel, the nature of business, and the source of funds.
>
> This isn't box-ticking. This is the information the bank needs for **risk categorisation and ongoing transaction monitoring**. A business's declared turnover and nature of activity is exactly what later gets compared against how the account actually behaves. Capturing it cleanly and structurally up front is what makes AML monitoring meaningful down the line.

_Fill the fields and tap **Continue to documents**._

---

### 6 · Business proof, Document 1 of 3 — Certificate of Incorporation, read by AI

_The Certificate of Incorporation screen appears (STEP 6 OF 11 · Document 1 of 3)._

> Now the business proof — three documents, and this is where I want you to really watch the platform work.
>
> The RM uploads the Certificate of Incorporation.

_Tap the dropzone to upload. The "Reading the certificate with AI…" tile shows, then the extracted-fields review streams in._

> **Behind the scenes:** we don't just store the file. Our AI **reads** the certificate — it extracts the entity name, the CIN, and the registered address off the document itself. Then it does the thing that actually protects the bank: it **cross-checks every extracted value against the MCA record we fetched earlier.** Name matches. CIN matches. Registered address matches. And it assesses the document for signs of tampering.
>
> So instead of an RM manually comparing a PDF to a registry printout, the platform gives a verdict — _genuine certificate, no tampering, all fields reconcile with MCA_ — with the evidence shown right there.

_Once the review completes, tap **Continue**._

---

### 7 · Business proof, Document 2 of 3 — the Board Resolution, generated for you

_The Board resolution screen appears (STEP 6 OF 11 · Document 2 of 3)._

> This is one of my favourite parts. The board resolution is usually the single most painful document in company account opening — it has to be on letterhead, in the bank's prescribed format, naming exactly who can open the account, who can operate it, in what mode, with what limits. Customers get it wrong constantly, and every mistake means another rejection and another week lost.
>
> We don't ask the customer to draft it. We **generate** it.

_Walk through the sections: who can open, who can operate + mode of operation + per-signatory limits, digital banking rights, credit facilities, and the resolution meta (meeting date, certified by, location)._

> The RM just answers structured questions — and notice, the people here aren't typed in, they're the same directors we already verified, carried forward. Who can open the account. Who can operate it, and whether that's singly, jointly or severally. Internet banking and debit card rights. Whether they want credit facilities. And the meeting details.

_Tap **Generate board resolution**. The "Assembling document…" state runs, then the filled PDF preview appears._

> **Behind the scenes:** the platform takes those structured answers and injects them into the bank's own prescribed board-resolution template — here modelled on the ICICI CA-5 format — and produces a ready, correctly-formatted PDF. A document that used to cause weeks of back-and-forth is now generated correctly, first time, in seconds. The RM can preview it, download it, or edit the answers and regenerate.

_Tap **Continue**._

---

### 8 · Business proof, Document 3 of 3 — Address proof, reconciled again

_The Business Address Proof screen appears (STEP 6 OF 11 · Document 3 of 3)._

> The last business document is address proof. The RM picks the type — a trade licence, utility bill, GST certificate — and uploads it.

_Select a proof type, upload the document. The AI review streams in._

> **Behind the scenes:** same AI treatment. It identifies the document — here a Factory Licence issued by the Government of Gujarat — reads who it was granted to, checks it for tampering, and reconciles the premises address on it against the registered address from MCA. Another independent, verified match, on the record.

_Once the review completes, tap **Verify & continue**._

---

### 9 · Self-declaration — FATCA / CRS, credit exposure, entity classification

_The Self-declaration screen appears (STEP 7 OF 11)._

> Before we verify the premises, we capture the regulatory self-declarations. First, **FATCA and CRS** — the tax-residency declaration. In the common case the entity is an India-only tax resident, and it's a single tap. But if it isn't, the form expands intelligently to collect US residency, TINs, entity categories, and multiple foreign residencies — exactly what's reportable, and nothing that isn't.
>
> Then **credit exposure** across the banking system — under ₹5 crore, ₹5 crore or more, or exempt — with the RBI-mandated undertaking shown inline. And the **FI / NFE classification** — is this a financial institution or, as here, a non-financial entity, and if so active or passive.
>
> At the bottom, the customer authorises verification with the tax authorities, and gives **consent for a credit bureau pull** — which lets the bank assess exposure and recommend the right products.

_Tap **Run verification**._

---

### 10 · Site verification & MCC — proving the business is real, on the ground

_The Site verification screen appears (STEP 8 OF 11)._

> This is the step that separates a real onboarding from a paper one. The RM is standing at the customer's premises, and the platform confirms the business physically exists where it claims to.
>
> A couple of quick questions — is the registered address the same as the operating address, is the place rented or owned — and then geotagged site photos: the nameboard, the entrance, the inventory, and optionally the owner at the site.

_Capture the photos — point to the geotag and timestamp burned onto each image._

> Every photo is **camera-only and auto-geotagged** — the RM can't upload an old image from the gallery. Each one carries its GPS coordinates and timestamp.

_Tap **Initiate verification**. The "Verifying location & classifying…" state runs, then the final review appears._

> **Behind the scenes:** now the platform does the final reconciliation — and this is the whole journey coming together. It takes the registered address from MCA, the address read off the documents, and the live GPS from the site photos, and confirms all three match — here, the photos were captured 180 metres from the registered address, well within tolerance. **Location verified.**
>
> And on top of that, the AI recommends the **Merchant Category Code** — the MCC — for this business. Based on everything it's seen, it's pre-filled `5039 · Construction Materials` as the best fit for a cement business. The RM can accept it or search and change it. Getting the MCC right at onboarding is what drives correct pricing and risk treatment for the life of the account.

_Point to the AI summary reconciling name, address and activity across MCA, the COI, the factory licence, business details, and the site photos._

> Notice the summary at the top: name, address and activity all reconcile across the documents, the MCA registry, and the physical site photos. One coherent, verified picture of the business.

_Tap **Confirm & continue**._

---

### 11 · Account setup — recommending the right product

_The Account setup screen appears (STEP 9 OF 11)._

> With a verified, risk-classified business, the platform now surfaces the current accounts this company is eligible for — and recommends the best-value one for a high-volume digital business like this. The RM and customer pick a plan together, seeing the minimum balance and benefits clearly.

_Select a plan and tap **Continue**._

---

### 12 · Signature & nominee — RM attestation and the authorised signatory's signature

_The Signature & nominee screen appears (STEP 10 OF 11)._

> Almost there. First, an **RM attestation** — the representative on record confirms they personally conducted this onboarding and saw the originals. That's the human accountability the regulator wants, captured explicitly.
>
> Then the signature of the authorised signatory — captured or uploaded — which will be applied to the account opening form. And optionally, nominee details.

_Capture the signature and tap **Continue**._

---

### 13 · Account Opening Form & Aadhaar e-Sign — closing the loop digitally

_The Account opening form screen appears (STEP 11 OF 11)._

> The final step. The platform has assembled the complete Account Opening Form from everything we captured — the RM can preview it in full, and you'll see it's populated end to end: entity details, all three directors, the authorised signatory, the chosen product, the MCC, the signature. Nothing re-keyed.

_Tap **Preview** to show the fully-populated AOF, then close it._

> And it's signed with **Aadhaar e-Sign**. An OTP goes to the authorised signatory's Aadhaar-registered mobile.

_Tap **Send OTP to e-sign**, enter the OTP, tap **Verify & submit AOF**._

> **Behind the scenes:** this is a legally valid, Aadhaar-based digital signature — no wet ink, no courier, no scanning. The form is signed, sealed, and submitted in one tap.

---

### 14 · Submitted — done

_The confirmation screen appears._

> And that's it. The complete current account application for _Shri Shakti Properties and BMS_ — a Private Limited company — is submitted. Fully verified, fully documented, digitally signed.

---

### Closing

> Let me leave you with what just happened. We onboarded a Private Limited company — arguably the most document-heavy entity a bank deals with — in one continuous flow on a single device. Along the way:
>
> - Every identity was **verified at source** — PAN, MCA, DigiLocker Aadhaar, liveness and face-match — not typed and hoped.
> - Every business document was **read and cross-checked by AI** against the MCA record, with tampering checks and a clear verdict.
> - The **board resolution was generated**, in the bank's format, instead of being chased for weeks.
> - Beneficial ownership, PEP, FATCA/CRS, credit exposure and MCC were all captured **structurally and compliantly.**
> - The business was **physically verified** on the ground with geotagged photos reconciled against the registry.
> - And it was **signed and submitted digitally** with Aadhaar e-Sign.
>
> What used to take weeks of back-and-forth, physical paperwork, and manual verification becomes a single guided session — with a complete, auditable trail behind every decision. That's Secure ID by Cashfree Payments. I'd love to walk through any entity type or any step in more detail.

---

## Appendix · Screen-to-route map (for the presenter driving the app)

| # | Screen (title) | Route | Header step |
|---|----------------|-------|-------------|
| 0 | New current account (entity + contact) | `/` (index) | — |
| 1 | Checklist | `/checklist` | STEP 1 OF 11 |
| 2 | Business details — Business PAN + MCA fetch | `/entity-details` | STEP 2 OF 11 |
| 3 | Entity & ownership (UBO + PEP) | `/ownership` | STEP 3 OF 11 |
| 4 | Signatory KYC (DigiLocker / selfie / link) | `/director-kyc` | STEP 4 OF 11 |
| 5 | Business details (turnover, nature, funds) | `/business-details` | STEP 5 OF 11 |
| 6 | Business proof · Certificate of Incorporation | `/business-doc-incorporation` | STEP 6 OF 11 |
| 7 | Business proof · Board resolution (generated) | `/business-doc-resolution` | STEP 6 OF 11 |
| 8 | Business proof · Address proof | `/business-doc-address` | STEP 6 OF 11 |
| 9 | Self-declaration (FATCA/CRS, exposure, FI/NFE) | `/self-declaration` | STEP 7 OF 11 |
| 10 | Site verification & MCC | `/site-verification` | STEP 8 OF 11 |
| 11 | Account setup (product selection) | `/account-setup` | STEP 9 OF 11 |
| 12 | Signature & nominee | `/signature-nominee` | STEP 10 OF 11 |
| 13 | Account opening form & Aadhaar e-Sign | `/aof-esign` | STEP 11 OF 11 |
| 14 | Application submitted | `/submitted` | — |
</content>
</invoke>
