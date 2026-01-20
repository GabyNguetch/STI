// app/inscription/page.tsx
'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import FunFactLoader from "@/components/common/FunFactLoader";

const AuthForm = dynamic(() => import('@/components/auth/Authentification'), { loading: () => <FunFactLoader />, ssr: false });
const Onboarding = dynamic(() => import('@/components/auth/Onboarding'), { loading: () => <FunFactLoader />, ssr: false });

function InscriptionContent() {
    const [registrationStarted, setRegistrationStarted] = useState(false);

    if (registrationStarted) {
        return <Onboarding />;
    }
  
    return <AuthForm mode="register" onSuccess={() => setRegistrationStarted(true)} />;
}

export default function InscriptionPage() {
    return (
        <Suspense fallback={<FunFactLoader />}>
            <InscriptionContent />
        </Suspense>
    );
}