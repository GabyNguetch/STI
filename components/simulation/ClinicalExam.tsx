// components/simulation/ClinicalExamsSidebar.tsx
'use client';
import React from 'react';
// Assurez-vous d'importer le nouveau type
import { ClinicalExam } from '@/types/simulation/types';

/**
 * Props pour le composant ClinicalExamsSidebar.
 */
interface ClinicalExamsSidebarProps {
  /** La liste des examens cliniques et leurs résultats. */
  exams: ClinicalExam[];
}

/**
 * Affiche une barre latérale d'information sur les examens cliniques.
 * Chaque examen affiche son nom et son résultat au survol de l'icône.
 */
const ClinicalExamsSidebar: React.FC<ClinicalExamsSidebarProps> = ({ exams = [] }) => {
  return (
    // Conteneur positionné en haut à GAUCHE.
    <div className="absolute top-16 left-2 flex flex-col gap-3">
      {exams.map((exam) => (
        // `group` est utilisé pour l'effet de survol du tooltip.
        <div key={exam.name} className="group relative">
          {/* Ce n'est plus un bouton, mais un simple conteneur pour l'icône */}
          <div
            className="w-14 h-14 flex items-center justify-center bg-white text-[#052648] rounded-xl shadow-lg transition-all duration-300"
            aria-label={`Résultat de l'examen: ${exam.name}`}
          >
            {/* L'icône est rendue dynamiquement. */}
            <exam.icon className="w-6 h-6" />
          </div>
          
          {/* Tooltip qui apparaît au survol (hover). 
              ATTENTION : Il doit maintenant apparaître à droite de l'icône. */}
          <div className="absolute top-1/2 -translate-y-1/2 left-full ml-3 px-3 py-2 bg-gray-200 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
            {/* On affiche maintenant le nom ET le résultat. */}
            <p className="font-bold text-[#052648]">{exam.name}</p>
            <p className="text-gray-800">{exam.resultat}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClinicalExamsSidebar;