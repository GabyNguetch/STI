// components/simulation/ExamPres.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, User, HeartPulse, Edit, TestTube2, AlertCircle } from 'lucide-react';
import { Patient, ClinicalExam } from '@/types/simulation/types';
import SignaturePad from '@/components/ui/Sign';
import { Button } from '@/components/ui/Button';

// Définition des props
interface ExamPresProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ClinicalExam | null; // L'examen sélectionné est passé ici
  patient: Patient;
  onPrescribe: (name: string, reason: string) => void; // Fonction du parent pour appeler le backend
}

const ExamPrescriptionModal: React.FC<ExamPresProps> = ({
  isOpen,
  onClose,
  exam,
  patient,
  onPrescribe,
}) => {
  const [reason, setReason] = useState('');

  // Réinitialiser le formulaire quand la modale s'ouvre avec un nouvel examen
  useEffect(() => {
    if (isOpen) {
        setReason('');
    }
  }, [isOpen, exam]);

  // Si pas ouvert ou pas d'examen sélectionné, on ne rend rien
  if (!isOpen || !exam) {
    return null;
  }

  const handlePrescribeClick = () => {
    if (!reason.trim()) return;
    
    // On envoie le nom de l'examen (connu via props) et la raison
    onPrescribe(exam.name, reason);
    
    // On ferme la modale (l'attente du résultat se fera via le Toast/Chat dans le parent)
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="relative bg-slate-50 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* En-tête du bulletin */}
            <header className="p-6 border-b border-slate-200 bg-white rounded-t-xl sticky top-0 z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <HeartPulse size={24} className="text-[#052648]"/>
                            <h2 className="text-xl font-bold text-[#052648]">Hôpital "The Good Doctor"</h2>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">Laboratoire Central d'Analyses Médicales</p>
                    </div>
                     <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5 text-slate-600"/>
                    </button>
                </div>
            </header>

             {/* Zone de contenu défilable */}
             <main className="p-6 overflow-y-auto space-y-6">
                
                {/* 1. Résumé Patient */}
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                    <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <User size={16}/> Identification Patient
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
                        <div>
                            <span className="text-slate-500">Nom :</span> <span className="font-semibold">{patient.nom}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">Âge :</span> <span className="font-semibold">{patient.age} ans</span>
                        </div>
                    </div>
                </div>

                {/* 2. L'examen sélectionné (Lecture seule) */}
                <div>
                    <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <TestTube2 size={16}/> Examen Demandé
                    </h3>
                    <div className="w-full p-3 bg-white border border-slate-300 rounded-md font-bold text-[#052648] shadow-sm flex items-center gap-3">
                        {/* On affiche l'icône de l'examen s'il y en a une, sinon une par défaut */}
                        {exam.icon ? <exam.icon className="w-5 h-5" /> : <TestTube2 className="w-5 h-5"/>}
                        {exam.name}
                    </div>
                </div>
                
                {/* 3. Justification (Input) */}
                <div>
                    <label htmlFor="reason" className="font-bold text-slate-700 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <Edit size={16}/> Indication Clinique (Obligatoire)
                    </label>
                    <textarea
                        id="reason"
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#052648]/20 focus:border-[#052648] outline-none transition-all text-sm resize-none shadow-inner"
                        placeholder="Justifiez votre demande (ex: Recherche d'anémie, suspicion de foyer infectieux...)"
                        autoFocus
                    />
                    <div className="mt-2 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5"/>
                        <p>Le résultat généré par l'IA dépendra de la pertinence de votre demande par rapport au cas clinique.</p>
                    </div>
                </div>

                {/* 4. Signature */}
                <div>
                     <label className="font-bold text-slate-700 mb-2 block text-sm uppercase tracking-wide">Signature Praticien</label>
                     <div className="border rounded-lg overflow-hidden border-slate-300">
                        <SignaturePad />
                     </div>
                </div>
             </main>

            {/* Footer Actions */}
            <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3 sticky bottom-0 z-10">
                <Button variant="outline" onClick={onClose} className="text-slate-600">
                    Annuler
                </Button>
                <Button 
                    onClick={handlePrescribeClick} 
                    disabled={!reason.trim()} 
                    className="bg-[#052648] hover:bg-[#0a4d8f] text-white px-6 shadow-lg shadow-blue-900/10 disabled:opacity-50 disabled:shadow-none"
                >
                    Envoyer la demande
                </Button>
            </div>
        </div>
    </div>
  );
};

export default ExamPrescriptionModal;