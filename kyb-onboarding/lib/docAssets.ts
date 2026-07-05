// Real document images. Keys are matched loosely against the document label
// (case-insensitive `includes`, first match wins). Every identity and business
// proof type resolves to a real scan; unmatched labels fall back to the faux doc.
const BASE =
  "https://d1kwhi236ua7t6.cloudfront.net/6142cad6-1cb6-4299-bba0-8a52f16313fa/projects/d4245685-58c8-4fa3-97b0-00b0205930ba/attachments";

const PAN = `${BASE}/pan-card.png`;
const DL = `${BASE}/driving-license.jpg`;
const GST = `${BASE}/gst-bill.png`;
const BILL = `${BASE}/electricity-bill.jpg`;
const SELFIE = `${BASE}/image%20%281%29.png`;

// Externally-hosted samples for the company (ltd) journey.
const AADHAAR = "https://4.imimg.com/data4/VA/JI/MY-8550553/aadhaar-card-250x250.jpg";
const COI = "https://registrationsindia.com/media/2016/06/Certificate-of-Incorporation-sample-Image.png";
const RESOLUTION = "https://imgv2-1-f.scribdassets.com/img/document/217009483/original/3cfc21cef5/1?v=1";
const ADDRESS_PROOF = "https://static.dexform.com/media/docs/9575/proof-of-address-letter-template_1.png";
const SIGNATORY_ID = "https://imgv2-2-f.scribdassets.com/img/document/355794227/original/6adf95ff7c/1?v=1";

// Order matters — earlier keys win when a label contains several.
export const docAssets: Record<string, string> = {
  selfie: SELFIE,
  pan: PAN,
  driving: DL,
  // identity OVDs we don't have a real scan for reuse the licence as a stand-in
  passport: DL,
  voter: DL,
  // business proofs
  gst: GST,
  vat: GST,
  cst: GST,
  shop: GST,
  establish: GST,
  udyam: GST,
  msme: GST,
  trade: GST,
  utility: BILL,
  electric: BILL,
  statement: BILL,
  account: BILL,
  // Company (ltd) journey documents
  aadhaar: AADHAAR,
  aadhar: AADHAAR,
  incorporation: COI,
  coi: COI,
  resolution: RESOLUTION,
  shareholding: RESOLUTION,
  board: RESOLUTION,
  "business address": ADDRESS_PROOF,
  signatory: SIGNATORY_ID,
};

export function assetFor(label: string): string | undefined {
  const key = label.toLowerCase();
  for (const k of Object.keys(docAssets)) {
    if (key.includes(k)) return docAssets[k];
  }
  return undefined;
}
