// app/connexion/page.tsx
'use client';
import { Suspense } from "react";
import FunFactLoader from "@/components/common/FunFactLoader";
import dynamic from 'next/dynamic';

const AuthForm = dynamic(() => import('@/components/auth/Authentification'), {
    loading: () => <FunFactLoader />,
    ssr: false
});

export default function ConnexionPage() {
  return (
    <Suspense fallback={<FunFactLoader />}>
       <AuthForm mode="login" />
    </Suspense>
  );
}