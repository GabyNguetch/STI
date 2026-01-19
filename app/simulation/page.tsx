// app/simulation/page.tsx
import SimulationContent from "@/components/simulation/Simulation";
import { Suspense } from "react";
import React from 'react';

// Composant Skeleton personnalisé pour la Simulation
const SimulationSkeleton = () => {
  return (
    <div className="fixed inset-0 flex flex-col bg-[#052648]">
      {/* Skeleton Header */}
      <div className="flex-none h-16 bg-[#052648]/50 border-b border-blue-800/30 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse"></div>
           <div className="flex flex-col gap-1">
             <div className="h-4 w-32 bg-white/10 rounded animate-pulse"></div>
             <div className="h-3 w-20 bg-white/5 rounded animate-pulse"></div>
           </div>
        </div>
        <div className="flex gap-2">
            <div className="w-24 h-8 rounded-lg bg-white/10 animate-pulse"></div>
            <div className="w-24 h-8 rounded-lg bg-emerald-500/20 animate-pulse"></div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Skeleton Sidebar Gauche (Examens) */}
        <div className="hidden lg:flex flex-col w-20 border-r border-white/5 bg-blue-900/10 p-2 gap-3 pt-4">
             {[1,2,3,4,5,6].map(i => (
                 <div key={i} className="w-14 h-14 mx-auto rounded-xl bg-white/5 animate-pulse" style={{animationDelay: `${i*100}ms`}}></div>
             ))}
        </div>

        {/* Skeleton Zone Centrale (Chat/Diag) */}
        <div className="flex-1 p-4 flex items-center justify-center relative bg-slate-900/20">
             
             {/* Center Card */}
             <div className="bg-white/5 w-full max-w-4xl h-[600px] rounded-xl border border-white/10 relative overflow-hidden">
                {/* Simulation Chat Bubbles */}
                <div className="p-6 space-y-4">
                     <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-white/10 shrink-0"></div>
                         <div className="w-[60%] h-12 bg-white/10 rounded-2xl rounded-tl-none animate-pulse"></div>
                     </div>
                     <div className="flex gap-3 flex-row-reverse">
                         <div className="w-8 h-8 rounded-full bg-white/10 shrink-0"></div>
                         <div className="w-[50%] h-12 bg-white/20 rounded-2xl rounded-tr-none animate-pulse" style={{animationDelay: "200ms"}}></div>
                     </div>
                     <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-white/10 shrink-0"></div>
                         <div className="w-[70%] h-20 bg-white/10 rounded-2xl rounded-tl-none animate-pulse" style={{animationDelay: "400ms"}}></div>
                     </div>
                </div>

                {/* Bottom Input Area Skeleton */}
                <div className="absolute bottom-0 w-full h-20 border-t border-white/5 p-4 bg-white/5">
                    <div className="w-full h-full bg-white/10 rounded-lg animate-pulse"></div>
                </div>

                {/* Petit Loader Texte Centré */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-sm z-10">
                     <div className="w-12 h-12 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mb-4"></div>
                     <p className="text-white font-medium text-sm animate-pulse tracking-wide">Préparation de l'environnement clinique...</p>
                </div>
             </div>
        </div>

        {/* Skeleton Sidebar Droite (Tools) */}
        <div className="hidden lg:flex flex-col w-20 border-l border-white/5 bg-blue-900/10 p-2 gap-3 pt-4">
             {[1,2,3].map(i => (
                 <div key={i} className="w-14 h-14 mx-auto rounded-xl bg-white/5 animate-pulse" style={{animationDelay: `${i*150}ms`}}></div>
             ))}
        </div>
      </div>
    </div>
  );
};

// C'est ce composant qui est utilisé par le Routeur.
const MedicalSimulationPage = () => {
  return (
    <div className="min-h-screen bg-[#052648] relative font-sans text-slate-800">
      <Suspense fallback={<SimulationSkeleton />}>
        <SimulationContent />
      </Suspense>
    </div>
  );
};

export default MedicalSimulationPage;