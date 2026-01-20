// /src/components/common/FunFactLoader.tsx
import React, { useEffect, useState } from 'react';
import { funFacts } from '@/lib/constants'; // Importer vos fun facts

export default function FunFactLoader() {
  const [currentFact, setCurrentFact] = useState<{ image: string; text: string } | null>(null);

  useEffect(() => {
    // Choisir un fait au hasard
    const randomIndex = Math.floor(Math.random() * funFacts.length);
    setCurrentFact(funFacts[randomIndex]);
    
    // Possibilité de changer de fait après quelques secondes (facultatif)
    // const interval = setInterval(() => ... ); 
    // return () => clearInterval(interval);

  }, []); // Pas de dépendance pour qu'il s'exécute uniquement au montage

  if (!currentFact) return null; // Ne rien afficher tant qu'un fait n'est pas sélectionné (très rapide)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      {/* --- Décorations en arrière-plan (cercles flous animés) --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-blue-100 rounded-full opacity-60 animate-bounce-slow filter blur-3xl"></div>
        <div className="absolute bottom-[-20px] right-[-30px] w-52 h-52 bg-green-50 rounded-full opacity-70 animate-bounce-slow-alt filter blur-3xl"></div>
      </div>

      {/* --- Contenu du chargement --- */}
      <div className="z-10 flex flex-col items-center justify-center space-y-6 max-w-md p-6 text-center">
        
        {/* Loader Icon / Image thématique */}
        <div className="relative">
          <img 
            src={currentFact.image || '/assets/icons/loading-placeholder.svg'} // Fallback icon
            alt="Medical Icon" 
            className="w-32 h-32 mx-auto animate-pulse" 
          />
        </div>

        {/* Le fait amusant */}
        <div className="space-y-2">
            <h3 className="text-xl font-bold text-indigo-700 font-mono tracking-wide animate-fade-in-up">LE SAVIEZ-VOUS ?</h3>
            <p className="text-gray-700 text-lg leading-relaxed font-sans opacity-0 animate-fade-in delay-200">
               {currentFact.text}
            </p>
        </div>
      </div>

      {/* Spinner technique discret (Optionnel pour indiquer clairement que ça travaille) */}
      <div className="absolute bottom-8 text-gray-400 flex flex-col items-center">
           <div className="loader border-t-blue-500 rounded-full w-8 h-8 border-4 border-slate-200 animate-spin mb-2"></div>
           <p className="text-sm font-light">Préparation de votre parcours...</p>
      </div>

    </div>
  );
}