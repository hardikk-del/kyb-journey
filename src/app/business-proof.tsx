import { router } from 'expo-router';

import { SelfieCapture } from '@/components/kyb/SelfieCapture';
import { go } from '@/lib/nav';

export default function SelfieCaptureScreen() {
  return (
    <SelfieCapture
      subjectName="Ravi Kumar"
      onUse={() => go('/business-docs')}
      onClose={() => (router.canGoBack() ? router.back() : go('/identity'))}
    />
  );
}
