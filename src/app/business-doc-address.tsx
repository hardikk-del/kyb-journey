import { BusinessDocStep } from '@/components/kyb/BusinessDocStep';

const ADDRESS_PROOFS = [
  'Trade Licence / Registration Certificate',
  'Utility bill (electricity / water / gas)',
  'Latest property tax receipt',
  'Registered rent / lease agreement',
  'GST registration certificate',
  'Bank statement / passbook',
];

export default function BusinessAddressProofScreen() {
  return (
    <BusinessDocStep
      step={3}
      total={3}
      title="Business Address Proof"      
      subtext="Ensure the uploaded document has registered business address mentioned"

      fileName="address_proof.pdf"
      ctaLabel="Verify & continue"
      next="/self-declaration"
      proofOptions={ADDRESS_PROOFS}
    />
  );
}
