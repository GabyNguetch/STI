// app/profile/page.tsx
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import FunFactLoader from "@/components/common/FunFactLoader";

const Profile = dynamic(() => import('@/components/user/Profile'), {
    ssr: false,
    loading: () => <div className="min-h-screen bg-white flex items-center justify-center text-slate-400">Chargement de votre profil...</div>
});

export default function ProfilePage() {
  return (
    <Suspense fallback={<FunFactLoader />}>
        <Profile />
    </Suspense>
  );
}