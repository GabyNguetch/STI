// app/onboarding/page.tsx
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import FunFactLoader from "@/components/common/FunFactLoader";

const OnboardingContent = dynamic(() => import('@/components/auth/Onboarding'), {
    ssr: false, // Pas de SSR car utilise beaucoup d'effets visuels et états client
    loading: () => <FunFactLoader />
});

export default function OnboardingPage() {
  return (
    <Suspense fallback={<FunFactLoader />}>
        <OnboardingContent />
    </Suspense>
  );
}