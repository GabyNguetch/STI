// components/simulation/PatientInfoPanel.tsx
'use client';
import React from 'react';
import { X } from 'lucide-react';
import { Patient, Service } from '@/types/simulation/types';

/**
 * Props pour le composant PatientInfoPanel.
 */
interface PatientInfoPanelProps {
  /** Les données complètes du patient. */
  data: Patient;
  /** Le service associé au cas clinique. */
  service: Service;
  /** Fonction appelée pour fermer le panneau. */
  onClose: () => void;
}

/**
 * Un panneau modal (popup) qui affiche un résumé du cas du patient.
 * Ce composant est réutilisable et est apparu dans votre code original
 * à la fois pour la vue d'information initiale et comme rappel dans le chat.
 */
const PatientInfoPanel: React.FC<PatientInfoPanelProps> = ({ data, service, onClose }) => {
  return (
    // Conteneur en plein écran avec fond flouté pour l'effet modal
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full relative">
        
        {/* Bouton de fermeture */}
        {onClose && (
           <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-primary transition-colors" aria-label="Fermer le panneau d'information">
            <X className="w-6 h-6" />
           </button>
        )}

        {/* En-tête du panneau */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shadow-lg flex-shrink-0">
            {/* Icône du service concerné */}
            <service.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">{service.name}</h2>
            <p className="text-slate-500 text-sm">Rappel du cas clinique</p>
          </div>
        </div>

        {/* Corps avec les détails du patient */}
        <div className="space-y-3 text-sm">
          <p><strong className="text-primary font-semibold">Patient:</strong> {data.nom}, {data.age} ans</p>
          <p><strong className="text-primary font-semibold">Motif de consultation:</strong> {data.motif}</p>
          <p><strong className="text-primary font-semibold">Antécédents:</strong> {data.antecedents}</p>
          <p><strong className="text-primary font-semibold">Symptômes rapportés:</strong> {data.symptomes}</p>
          <p><strong className="text-primary font-semibold">Signes Vitaux Initiaux:</strong> {data.signesVitaux}</p>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoPanel;