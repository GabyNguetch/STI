// app/simulation/page.tsx
'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import FunFactLoader from "@/components/common/FunFactLoader";

// Import dynamique du coeur de la simulation pour ne pas bloquer le thread principal
const SimulationContent = dynamic(
  () => import("@/components/simulation/Simulation"), 
  {
    loading: () => <FunFactLoader />, // Affiche le fait amusant pendant le chargement des chunks JS
    ssr: false // La simulation dépend entièrement du client (localStorage, état temps réel)
  }
);

export default function MedicalSimulationPage() {
  return (
    <div className="min-h-screen bg-[#052648] relative font-sans text-slate-800">
      <Suspense fallback={<FunFactLoader />}>
        <SimulationContent />
      </Suspense>
    </div>
  );
}