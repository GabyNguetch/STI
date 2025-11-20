// components/simulation/Drug.tsx
'use client';

import React, { useState } from 'react';
import { X, User, HeartPulse, Edit, Syringe, FilePlus, MessageSquareQuote } from 'lucide-react';
import { Patient } from '@/types/simulation/types';
import { Button } from '@/components/ui/Button';

interface DrugPrescriptionProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  diagnosis: string;
  onPrescribe: () => void; // Simple callback pour confirmer la prescription
}

const DrugPrescriptionModal: React.FC<DrugPrescriptionProps> = ({
  isOpen,
  onClose,
  patient,
  diagnosis,
  onPrescribe,
}) => {
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [recommendations, setRecommendations] = useState('');

  const handlePrescribeClick = () => {
    // Dans une vraie application, vous enverriez ces données
    console.log({ medication, dosage, recommendations });
    onPrescribe(); // Informe le parent que la prescription est terminée
  };
  
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all animate-fade-in-up">
            {/* En-tête de l'ordonnance */}
            <header className="p-6 border-b-2 border-dashed">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <HeartPulse size={24} className="text-primary"/>
                            <h2 className="text-xl font-bold text-primary">Hôpital "The Good Doctor"</h2>
                        </div>
                        <p className="text-sm text-slate-500 ml-8">Ordonnance Médicale</p>
                    </div>
                     <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 transition-colors">
                        <X className="w-5 h-5 text-slate-600"/>
                    </button>
                </div>
            </header>

             <main className="p-6 space-y-6">
                {/* Infos Patient & Diagnostic */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                         <div className="flex items-center gap-2">
                             <User size={16} className="text-slate-500" />
                             <p><strong>Patient:</strong> {patient.nom}, {patient.age} ans</p>
                         </div>
                         <div className="flex items-center gap-2">
                            <FilePlus size={16} className="text-slate-500" />
                            <p><strong>Diagnostic:</strong> {diagnosis}</p>
                         </div>
                    </div>
                </div>

                {/* Formulaire de prescription */}
                <div className="space-y-4">
                     <div>
                        <label htmlFor="medication" className="font-bold text-slate-700 mb-1 flex items-center gap-2">
                            <Syringe size={16}/> Médicament
                        </label>
                        <input
                            id="medication"
                            type="text"
                            value={medication}
                            onChange={(e) => setMedication(e.target.value)}
                            className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                            placeholder="ex: Amoxicilline 500mg"
                        />
                    </div>
                     <div>
                        <label htmlFor="dosage" className="font-bold text-slate-700 mb-1 flex items-center gap-2">
                            <Edit size={16}/> Posologie
                        </label>
                        <textarea
                            id="dosage"
                            rows={3}
                            value={dosage}
                            onChange={(e) => setDosage(e.target.value)}
                            className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                            placeholder="ex: 1 comprimé 3 fois par jour pendant 7 jours"
                        />
                    </div>
                     <div>
                        <label htmlFor="recommendations" className="font-bold text-slate-700 mb-1 flex items-center gap-2">
                            <MessageSquareQuote size={16}/> Recommandations supplémentaires
                        </label>
                        <textarea
                            id="recommendations"
                            rows={2}
                            value={recommendations}
                            onChange={(e) => setRecommendations(e.target.value)}
                            className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                            placeholder="ex: À prendre au milieu des repas, bien s'hydrater..."
                        />
                    </div>
                </div>
             </main>
             
             {/* Footer avec bouton */}
            <div className="flex justify-end gap-3 p-6 border-t bg-slate-50 rounded-b-xl">
              <Button variant="outline" onClick={onClose}>Annuler</Button>
              <Button onClick={handlePrescribeClick} disabled={!medication.trim() || !dosage.trim()}>
                Prescrire
              </Button>
            </div>
        </div>
    </div>
  );
};

export default DrugPrescriptionModal;