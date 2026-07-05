import { BusinessDocStep } from '@/components/kyb/BusinessDocStep';

export default function BoardResolutionScreen() {
  return (
    <BusinessDocStep
      step={2}
      total={3}
      title="Board Resolution"
      subtext="Directors, shareholding & account-opening authorisation, on company letterhead"
      fileName="board_resolution.pdf"
      ctaLabel="Continue"
      next="/business-doc-address"
    />
  );
}
