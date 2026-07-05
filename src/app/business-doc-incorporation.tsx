import { BusinessDocStep } from '@/components/kyb/BusinessDocStep';

export default function IncorporationCertificateScreen() {
  return (
    <BusinessDocStep
      step={1}
      total={3}
      title="Certificate of Incorporation"
      subtext="Issued by the Registrar of Companies"
      fileName="incorporation_certificate.pdf"
      ctaLabel="Continue"
      next="/business-doc-resolution"
    />
  );
}
