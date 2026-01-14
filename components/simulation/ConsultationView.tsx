'use client';
import React, { useState } from 'react';
import { ClipboardCheck, ArrowRight, BrainCircuit, Lightbulb, Clock } from 'lucide-react';
import { Patient, Service, Message, DiagnosticTool, ClinicalExam, GameState } from '@/types/simulation/types';

import ChatWindow from './ChatWindow';
import DiagnosticTools from './DiagnosticTools';
import ClinicalExamsSidebar from './ClinicalExam';
import ExamPrescriptionModal from './ExamPres';
import DrugPrescriptionModal from './Drug';

interface ConsultationViewProps {
  patientData: Patient;
  selectedService: Service;
  messages: Message[];
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  messageCount: number;
  MAX_QUESTIONS?: number; // Prop optionnelle pour la limite (défaut 10)
  diagnosticTools: DiagnosticTool[];
  onToolClick: (tool: DiagnosticTool) => void;
  clinicalExams: ClinicalExam[];
  isGameOver: boolean;
  onReset: () => void;
  isExamModalOpen: boolean;
  selectedExam: ClinicalExam | null;
  onExamClick: (exam: ClinicalExam) => void;
  onCloseExamModal: () => void;
  onPrescribeExam: (exam: ClinicalExam) => void;
  
  // Nouveautés pour le Tuteur
  currentHint?: string;
  remainingHints: number;
  onRequestHint: () => void;
  gameState: GameState;
  
  // Prescription / Diagnostic
  isDrugModalOpen: boolean;
  onOpenDrugModal: () => void;
  onCloseDrugModal: () => void;
  onFinalPrescription: (meds: string, dosage: string) => void;
  isTyping?: boolean;
  
  // Phase Diagnostic
  userDiagnosis: string;
  setUserDiagnosis: (s: string) => void;
  onTriggerDiagnosis: () => void;
  onConfirmDiagnosis: () => void;
}

const ConsultationView: React.FC<ConsultationViewProps> = (props) => {
  // Destructuring pour accès facile aux variables courantes
  const { 
    patientData, selectedService, messages, messageCount, 
    MAX_QUESTIONS = 10, gameState, diagnosticTools, clinicalExams, 
    remainingHints, onRequestHint, onTriggerDiagnosis 
  } = props;
  
  // -- Calculs pour l'affichage conditionnel --
  const showChat = gameState === 'asking' || gameState === 'finished';
  const showDiagnosisInput = gameState === 'diagnosing';

  return (
    <div className="fixed inset-0 flex flex-col bg-[#052648]">
       {/* Arrière-plan thématique subtil */}
       <div className="absolute inset-0 bg-cover bg-center z-0 opacity-10" style={{ backgroundImage: `url(${selectedService.bgImage})` }} />
       <div className="absolute inset-0 backdrop-blur-xs z-0" />
      
      {/* ================= HEADER ================= */}
      <div className="flex-none h-16 bg-[#052648]/95 backdrop-blur-md border-b border-blue-500/20 shadow-lg relative z-20 px-6 flex items-center justify-between text-white">
            {/* Gauche: Info Patient */}
            <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                    <selectedService.icon size={18}/>
                 </div>
                 <div>
                    <h1 className="font-bold leading-none text-base">{patientData.nom}</h1>
                    <span className="text-xs text-blue-300 opacity-80">{selectedService.name} | {patientData.age} ans</span>
                 </div>
            </div>
            
            {/* CENTRE: BARRE DE PROGRESSION (Visible seulement en phase de questionnement) */}
            {gameState === 'asking' && (
                <div className="flex flex-col items-center gap-1">
                    <div className="text-[10px] font-mono text-blue-200 uppercase tracking-widest flex items-center gap-1">
                        <Clock size={10}/> Phase Formative
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full border border-white/5">
                        <div className="flex gap-1">
                            {[...Array(MAX_QUESTIONS)].map((_, i) => (
                                <div key={i} className={`w-3 h-1.5 rounded-full transition-all duration-500 ${
                                    i < messageCount 
                                    ? 'bg-gradient-to-r from-blue-400 to-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]' 
                                    : 'bg-white/10'
                                }`} />
                            ))}
                        </div>
                        <span className="text-xs font-bold font-mono ml-2 text-white">{messageCount}/{MAX_QUESTIONS}</span>
                    </div>
                </div>
            )}
            
            {/* Droite: Actions */}
            <div className="flex gap-2">
               {/* BOUTON INDICE (TUTEUR) */}
               <button 
                  onClick={onRequestHint} 
                  disabled={remainingHints <= 0 || gameState !== 'asking'}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                  title="Demander un indice au tuteur"
                >
                   <Lightbulb size={16}/> {remainingHints} Indice{remainingHints > 1 ? 's' : ''}
               </button>

                {/* BOUTON DIAGNOSTIC MANUEL (Activé si > 2 messages) */}
               {gameState === 'asking' && (
                  <button 
                    onClick={onTriggerDiagnosis}
                    disabled={messageCount < 2}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale"
                  >
                     <BrainCircuit size={16}/> DIAGNOSTIC
                  </button>
               )}
            </div>
       </div>

      {/* ================= CONTENU PRINCIPAL ================= */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
          {/* COLONNE GAUCHE: EXAMENS (Masquée si mode diagnostic) */}
          {gameState === 'asking' && (
            <div className="hidden lg:flex flex-col w-20 hover:w-64 transition-all duration-300 bg-blue-950/60 backdrop-blur-sm border-r border-white/5 z-20 group">
                <div className="p-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-200 text-xs font-bold border-b border-white/5 whitespace-nowrap overflow-hidden">
                    EXAMENS COMPLÉMENTAIRES
                </div>
                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-blue-500/20 scrollbar-track-transparent">
                    <ClinicalExamsSidebar exams={clinicalExams} onExamClick={props.onExamClick} />
                </div>
            </div>
          )}

        {/* ZONE CENTRALE (CHANGEMENT DE VUE) */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/50 backdrop-blur-sm">
           
           {/* === VUE 1 : CONVERSATION (CHAT & TUTEUR) === */}
           {showChat && (
               <div className="h-full w-full max-w-5xl mx-auto p-2 md:p-4 flex flex-col relative">
                  <ChatWindow
                    // Passage de toutes les props nécessaires
                    patientData={patientData} selectedService={selectedService}
                    messages={messages} inputMessage={props.inputMessage} 
                    onInputChange={props.onInputChange} onSendMessage={props.onSendMessage}
                    messageCount={messageCount} isGameOver={props.isGameOver} onReset={props.onReset}
                    onShowPatientInfo={() => {}} // Optionnel : ouvrirait panel infos
                    isTyping={props.isTyping}
                    MAX_QUESTIONS={MAX_QUESTIONS}
                  />
                  {/* Note: Le bouton Indice flottant peut être ajouté ici si l'on ne veut pas celui du Header, 
                      mais pour une UX "Sérieuse/Pro", le Header est souvent préférable. */}
               </div>
           )}

           {/* === VUE 2 : FORMULAIRE DE DIAGNOSTIC === */}
           {showDiagnosisInput && (
               <div className="h-full w-full flex items-center justify-center p-4 animate-in zoom-in-95 fade-in duration-300">
                   <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xl w-full text-center relative border border-slate-200">
                        {/* Décoration */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-[#052648] rounded-t-2xl"></div>
                        
                        <div className="w-16 h-16 bg-[#052648] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-blue-50">
                            <ClipboardCheck size={32} />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-[#052648] mb-2">Moment de vérité</h2>
                        <p className="text-slate-500 mb-6 text-sm">
                            Après <span className="font-bold text-[#052648]">{messageCount}</span> questions posées, quelle est votre hypothèse principale ?
                        </p>
                        
                        <div className="text-left mb-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                                VOTRE DIAGNOSTIC (Obligatoire)
                            </label>
                        </div>
                        
                        <textarea 
                            value={props.userDiagnosis}
                            onChange={(e) => props.setUserDiagnosis(e.target.value)}
                            placeholder="Ex: Syndrome coronarien aigu ST+ en territoire inférieur probable..."
                            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#052648]/20 focus:border-[#052648] outline-none resize-none mb-6 text-base text-slate-800 transition-all shadow-inner"
                            autoFocus
                        />
                        
                        <div className="flex gap-3">
                             {/* Bouton pour éventuellement retourner au chat si on n'a pas atteint la limite */}
                             {messageCount < MAX_QUESTIONS && (
                                <button onClick={() => {/* logique retour setGameState('asking') à gérer côté parent */}} 
                                className="px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 font-semibold transition-colors">
                                    Réviser
                                </button>
                             )}
                             
                            <button 
                                onClick={props.onConfirmDiagnosis} 
                                disabled={!props.userDiagnosis.trim()}
                                className="flex-1 py-3 px-6 rounded-xl bg-[#052648] text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                Valider & Prescrire <ArrowRight size={18}/>
                            </button>
                        </div>
                   </div>
               </div>
           )}
        </div>

        {/* COLONNE DROITE: OUTILS MONITORING (Masquée si mode diagnostic) */}
        {gameState === 'asking' && (
             <div className="hidden lg:flex flex-col w-20 hover:w-64 transition-all duration-300 bg-blue-950/60 backdrop-blur-sm border-l border-white/5 z-20 group">
                <div className="p-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-200 text-xs font-bold border-b border-white/5 whitespace-nowrap overflow-hidden">
                    MONITORING & CONSTANTES
                </div>
                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-blue-500/20 scrollbar-track-transparent">
                    <DiagnosticTools tools={diagnosticTools} onToolClick={props.onToolClick} />
                </div>
            </div>
        )}
      </div>

      {/* --- MODALES GÉRÉES PAR LE PARENT --- */}
      
      {/* 1. Modal Examen (Simulé ou Résultat immédiat) */}
      <ExamPrescriptionModal 
          isOpen={props.isExamModalOpen} 
          onClose={props.onCloseExamModal} 
          exam={props.selectedExam} 
          patient={patientData} 
          onPrescribe={props.onPrescribeExam} 
      />
      
      {/* 2. Modal Prescription (Lance le Grading) */}
      <DrugPrescriptionModal 
         isOpen={props.isDrugModalOpen} 
         onClose={props.onCloseDrugModal} 
         patient={patientData} 
         diagnosis={props.userDiagnosis} 
         onPrescribe={(m, d) => props.onFinalPrescription(m, d)} 
      />

    </div>
  );
};

export default ConsultationView;