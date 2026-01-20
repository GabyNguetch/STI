// app/cas/page.tsx
'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import FunFactLoader from "@/components/common/FunFactLoader";

// Dynamic import car la liste peut être grande
const Library = dynamic(() => import('@/components/dashboard/Library'), {
  loading: () => <FunFactLoader />
});

export default function CasLibraryPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="py-12 px-4 md:py-20">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<FunFactLoader />}>
             <Library />
          </Suspense>
        </div>
      </main>
    </div>
  );
}