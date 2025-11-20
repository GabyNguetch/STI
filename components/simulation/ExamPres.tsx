// components/simulation/ExamPres.tsx
'use client';

import React, { useState } from 'react';
import { X, FileText, User, HeartPulse, Edit, Loader2, Trophy } from 'lucide-react';
import { Patient, ClinicalExam } from '@/types/simulation/types';
import SignaturePad from '@/components/ui/Sign';
import { Button } from '@/components/ui/Button';

// Définition des props
interface ExamPresProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ClinicalExam | null;
  patient: Patient;
  onPrescribe: (exam: ClinicalExam) => void;
}

const ExamPrescriptionModal: React.FC<ExamPresProps> = ({
  isOpen,
  onClose,
  exam,
  patient,
  onPrescribe,
}) => {
  const [reason, setReason] = useState('');
  const [isPrescribing, setIsPrescribing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Gère la réinitialisation de l'état à la fermeture
  const handleClose = () => {
    setReason('');
    setIsPrescribing(false);
    setShowResult(false);
    onClose();
  };
  
  const handlePrescribeClick = () => {
    if (!exam) return;
    setIsPrescribing(true);

    // Simulation d'un chargement de 10 secondes
    setTimeout(() => {
        setIsPrescribing(false);
        setShowResult(true);
    }, 10000);
  };
  
  // Appelle la fonction parente et ferme le modal
  const handleResultConfirmation = () => {
    if (exam) {
        onPrescribe(exam);
    }
    handleClose();
  }

  if (!isOpen || !exam) {
    return null;
  }
  
  // --- Sous-composants pour chaque état du modal ---

  const renderFormContent = () => (
      <>
        {/* Résumé des informations du patient */}
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><User size={16}/> Patient</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
                <p><strong>Nom:</strong> {patient.nom}</p>
                <p><strong>Âge:</strong> {patient.age} ans</p>
                <p className="col-span-2"><strong>Motif:</strong> {patient.motif}</p>
            </div>
        </div>
        
        {/* Détails de la prescription */}
        <div className="space-y-4">
            <div>
                <label htmlFor="reason" className="font-bold text-slate-700 mb-1 flex items-center gap-2">
                    <Edit size={16}/> Raison de l'examen
                </label>
                <textarea
                    id="reason"
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="Justifiez la nécessité de cet examen..."
                />
            </div>
            <div>
                 <label className="font-bold text-slate-700 mb-1 block">Signature Numérique</label>
                 <SignaturePad />
            </div>
        </div>

        {/* Actions du Modal */}
        <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>Annuler</Button>
          <Button onClick={handlePrescribeClick} disabled={!reason.trim()}>Prescrire</Button>
        </div>
      </>
  );

  const renderLoadingContent = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 h-80 animate-fade-in">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <h3 className="text-lg font-semibold text-primary">Analyse en cours...</h3>
      <p className="text-sm text-slate-500">Le bulletin d'examen est envoyé au laboratoire. Veuillez patienter.</p>
    </div>
  );

  const renderResultContent = () => (
    <div className="p-4 animate-fade-in">
        <h3 className="font-bold text-xl text-primary text-center mb-4 flex items-center justify-center gap-2">
          <Trophy size={22} className="text-amber-500" />
          Résultat de l'Examen
        </h3>
        <div className="bg-slate-100 p-6 rounded-lg text-center border-2 border-primary/20">
            <p className="text-base font-semibold text-slate-700 mb-2">{exam.name}</p>
            <p className="text-3xl font-bold text-primary">{exam.resultat}</p>
        </div>
        <div className="mt-6 flex justify-center">
           <Button onClick={handleResultConfirmation}>Ajouter au dossier et continuer</Button>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center overflow-y justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="relative bg-slate-50 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all animate-fade-in-up">
            {/* En-tête du bulletin */}
            <header className="p-6 border-b-2 border-dashed">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <HeartPulse size={24} className="text-primary"/>
                            <h2 className="text-xl font-bold text-primary">Hôpital "The Good Doctor"</h2>
                        </div>
                        <p className="text-sm text-slate-500 ml-8">Bulletin d'examen médical</p>
                    </div>
                     <button onClick={handleClose} disabled={isPrescribing} className="p-1 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50">
                        <X className="w-5 h-5 text-slate-600"/>
                    </button>
                </div>
            </header>

             {/* Zone de contenu dynamique */}
             <main className="p-6">
                {!isPrescribing && !showResult && (
                  <div className="flex items-center gap-3 mb-6">
                       <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                           <FileText size={24} />
                       </div>
                       <h2 id="modal-title" className="text-xl font-bold text-primary">
                           Demande d'examen : {exam.name}
                       </h2>
                  </div>
                )}
                
                 {isPrescribing 
                    ? renderLoadingContent()
                    : showResult
                    ? renderResultContent()
                    : renderFormContent()
                }
             </main>
        </div>
    </div>
  );
};

export default ExamPrescriptionModal;