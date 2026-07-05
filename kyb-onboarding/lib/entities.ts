// Per-entity mock identity + copy, centralised so screens don't scatter
// `isLlp ? … : …` ternaries. Only the corporate entities that flow through the
// MCA-fetch path are modelled here; prop/partner/huf keep their inline copy.

export type EntityId = "prop" | "partner" | "llp" | "huf" | "ltd";

/** One MCA-fetched member's extracted KYC details. */
export interface MemberInfo {
  name: string;
  address: string;
  dob: string;
  aadhaar: string;
  pan: string;
}

export interface EntityMeta {
  /** Registered legal name shown across the journey. */
  legalName: string;
  /** Constitution label for the AOF / previews. */
  constitution: string;
  /** Plural noun for the fetched member list. */
  memberNoun: string;
  /** Singular noun for one member. */
  memberNounSingular: string;
  /** MCA-fetched members (Designated Partners / Directors). */
  members: string[];
  /** Business PAN. */
  pan: string;
  /** Corporate Identification Number (companies + LLPs). */
  cin?: string;
  /** Date of incorporation (as printed on the CoI). */
  dateOfIncorporation?: string;
  /** Registered office address. */
  registeredOffice?: string;
  /** Registrar of Companies jurisdiction. */
  roc?: string;
  /** MCA company status. */
  status?: string;
  /** Per-member extracted KYC details (address etc.), aligned with `members`. */
  membersInfo?: MemberInfo[];
}

// Two designated partners for the LLP, three directors for the company — the
// first entry is the default authorised signatory in both cases.
export const ENTITY_META: Partial<Record<EntityId, EntityMeta>> = {
  llp: {
    legalName: "Finramp Technologies LLP",
    constitution: "Limited Liability Partnership",
    memberNoun: "Designated Partners",
    memberNounSingular: "Designated Partner",
    members: ["Ravi Kumar", "Rahul Mishra"],
    pan: "EWCLJWELKM",
  },
  ltd: {
    legalName: "Finramp Technologies Pvt Ltd",
    constitution: "Private Limited Company",
    memberNoun: "Directors",
    memberNounSingular: "Director",
    members: ["Ravi Kumar", "Rahul Mishra", "Anjali Sharma"],
    pan: "AAGCF5123R",
    cin: "U62013KA2023PTC181035",
    dateOfIncorporation: "14 Mar 2016",
    registeredOffice: "Unit 4, Lotus Industrial Estate, Andheri East, Mumbai 400059",
    roc: "RoC-Bangalore",
    status: "Active",
    membersInfo: [
      { name: "Ravi Kumar", address: "12 Gandhipuram, Coimbatore, TN 641001", dob: "14 Mar 1988", aadhaar: "xxxx xxxx 1234", pan: "ABCPK1234A" },
      { name: "Rahul Mishra", address: "48 Indiranagar, Bengaluru, KA 560001", dob: "22 Jul 1991", aadhaar: "xxxx xxxx 5678", pan: "XYZPM5678B" },
      { name: "Anjali Sharma", address: "9 Koregaon Park, Pune, MH 411001", dob: "09 Nov 1985", aadhaar: "xxxx xxxx 9012", pan: "LMNPS9012C" },
    ],
  },
};

/** Per-member extracted details for an entity, with a safe fallback. */
export function membersInfoFor(entity?: string): MemberInfo[] {
  const meta = ENTITY_META[entity as EntityId];
  if (meta?.membersInfo) return meta.membersInfo;
  return membersFor(entity).map((name) => ({ name, address: "", dob: "", aadhaar: "", pan: "" }));
}

/** True for the MCA-fetched corporate entities (LLP + company). */
export const isCorporateEntity = (entity?: string): boolean =>
  entity === "llp" || entity === "ltd";

/** Members for an entity, with a safe fallback for older nav state. */
export function membersFor(entity?: string): string[] {
  return ENTITY_META[entity as EntityId]?.members ?? ["Ravi Kumar", "Rahul Mishra"];
}
