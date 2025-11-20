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
  onExamClick: (exam: ClinicalExam) => void;
}

/**
 * Affiche une barre latérale d'information sur les examens cliniques.
 * Chaque examen affiche son nom et son résultat au survol de l'icône.
 */
const ClinicalExamsSidebar: React.FC<ClinicalExamsSidebarProps> = ({ exams = [], onExamClick }) => {
  return (
    // Conteneur positionné en haut à GAUCHE.
    <div className="absolute top-16 left-2 flex flex-col gap-3">
      {exams.map((exam) => (
        // `group` est utilisé pour l'effet de survol du tooltip.
        <div key={exam.name} onClick={() => onExamClick(exam)} className="group relative">
          {/* Ce n'est plus un bouton, mais un simple conteneur pour l'icône */}
          <div
            className="w-14 h-14 flex items-center justify-center bg-white text-[#052648] rounded-xl shadow-lg transition-all duration-300"
            aria-label={`Résultat de l'examen: ${exam.name}`}
          >
            {/* L'icône est rendue dynamiquement. */}
            <exam.icon className="w-6 h-6" />
          </div>
          
        </div>
      ))}
    </div>
  );
};

export default ClinicalExamsSidebar;