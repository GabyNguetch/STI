
// --- 2. PAGE EXPORTÉE (Wrapper avec Suspense) ---

import SimulationContent from "@/components/simulation/Simulation";
import { Suspense } from "react";

// C'est ce composant qui est utilisé par le Routeur.
const MedicalSimulationPage = () => {
  return (
    <div className="min-h-screen bg-[#052648] relative font-sans text-slate-800">
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center text-white bg-[#052648]">
          <div className="animate-pulse flex flex-col items-center">
             <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
             Chargement de la simulation...
          </div>
        </div>
      }>
        <SimulationContent />
      </Suspense>
    </div>
  );
};

export default MedicalSimulationPage;