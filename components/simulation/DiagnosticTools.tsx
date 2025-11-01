// components/simulation/DiagnosticTools.tsx
'use client';
import React from 'react';
import { DiagnosticTool } from '@/types/simulation/types';

/**
 * Props pour le composant DiagnosticTools.
 */
interface DiagnosticToolsProps {
  /** La liste des outils de diagnostic à afficher. */
  tools: DiagnosticTool[];
  /** La fonction à appeler lorsqu'un bouton d'outil est cliqué. */
  onToolClick: (tool: DiagnosticTool) => void;
}

/**
 * Affiche la barre latérale des outils de diagnostic.
 * Chaque outil est un bouton cliquable qui déclenche une action dans le composant parent.
 */
const DiagnosticTools: React.FC<DiagnosticToolsProps> = ({ tools, onToolClick }) => {
  return (
    // Ce conteneur positionne la barre d'outils en haut à droite de son parent relatif.
    <div className="absolute top-16 right-2 flex flex-col gap-3">
      {tools.map((tool) => (
        // `group` est utilisé pour l'effet de survol du tooltip.
        <div key={tool.name} className="group relative">
          <button
            onClick={() => onToolClick(tool)}
            className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-primary to-blue-700 hover:from-blue-700 hover:to-primary text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
            aria-label={`Utiliser l'outil ${tool.name}`}
          >
            {/* L'icône est rendue dynamiquement à partir des props. */}
            <tool.icon className="w-6 h-6" />
          </button>
          
          {/* Tooltip qui apparaît au survol (hover). */}
          <div className="absolute top-1/2 -translate-y-1/2 right-full mr-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
            {tool.name}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiagnosticTools;