// components/simulation/ConsultationView.tsx
'use client';
import React, { useState } from 'react';
import { Hospital, Lightbulb, Stethoscope, User, X } from 'lucide-react';
import { Patient, Service, Message, DiagnosticTool, ClinicalExam } from '@/types/simulation/types';

// Importation des sous-composants
import ChatWindow from './ChatWindow';
import DiagnosticTools from './DiagnosticTools';
import PatientInfoPanel from './PatientInfoPanel';
import ClinicalExamsSidebar from './ClinicalExam';
import { Button } from '../ui/Button';
import Link from 'next/link';

/**
 * Props pour le composant ConsultationView.
 */
interface ConsultationViewProps {
  patientData: Patient;
  selectedService: Service;
  messages: Message[];
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  messageCount: number;
  diagnosticTools: DiagnosticTool[];
  onToolClick: (tool: DiagnosticTool) => void;
  clinicalExams: ClinicalExam[];
  isGameOver: boolean;
  onReset: () => void;
  currentHint?: string;
  remainingHints?: number;
  onRequestHint?: () => void;
}

/**
 * Le composant principal pour la vue de consultation.
 * Layout fixe occupant toute la hauteur avec header + 3 colonnes (examens | chat | outils)
 */
const ConsultationView: React.FC<ConsultationViewProps> = ({
  patientData,
  selectedService,
  messages,
  inputMessage,
  onInputChange,
  onSendMessage,
  messageCount,
  diagnosticTools,
  onToolClick,
  clinicalExams, 
  isGameOver,
  onReset,
  currentHint = '',
  remainingHints = 3,
  onRequestHint,
}) => {
  const [isPatientPanelVisible, setPatientPanelVisible] = useState(false);
  const [showHintBubble, setShowHintBubble] = useState(false);

  const handleHintClick = () => {
    if (remainingHints > 0 && onRequestHint) {
      onRequestHint();
      setShowHintBubble(true);
    }
  };

  const closeHintBubble = () => {
    setShowHintBubble(false);
  };
  return (
    <div className="fixed inset-0 flex flex-col bg-[#052648]">
      
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: 'url(/images/consultation.jpg)' }} />
      <div className="absolute inset-0 backdrop-blur-xs z-0" />
      
      {/* === HEADER === */}
      <div className="flex-none h-16 bg-[#052648]/80 backdrop-blur-sm border-b border-blue-700/50 shadow-lg">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#052648]/20 rounded-lg">
              <Hospital className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Salle de Consultation</h1>
              <p className="text-xs text-blue-300">{selectedService.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8 text-sm text-blue-300">
            <Stethoscope className="w-4 h-4" />
            <span>Patient: {patientData.nom}</span>
            <Button variant='default' className='flex items-center gap-2 text-sm'><Link href='/dashboard'>Mon compte</Link></Button>
          </div>
        </div>
      </div>

      {/* === CONTENU PRINCIPAL : 3 COLONNES === */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* COLONNE GAUCHE : Examens Cliniques */}
        <div className="hidden lg:flex flex-col w-64 xl:w-72 bg-blue-950/50 backdrop-blur-sm border-r border-blue-700/30">
          <div className="flex-1 overflow-hidden">
            <ClinicalExamsSidebar exams={clinicalExams} />
          </div>
        </div>

        {/* COLONNE CENTRALE : Chat */}
        <div className="flex-1 flex flex-col bg-blue-950/50 backdrop-blur-sm overflow-hidden">
          <div className="flex-1 p-4 overflow-hidden">
            <ChatWindow
              patientData={patientData}
              selectedService={selectedService}
              messages={messages}
              inputMessage={inputMessage}
              onInputChange={onInputChange}
              onSendMessage={onSendMessage}
              messageCount={messageCount}
              isGameOver={isGameOver}
              onReset={onReset}
              onShowPatientInfo={() => setPatientPanelVisible(true)}
            />
          </div>
        </div>

        {/* COLONNE DROITE : Outils Diagnostiques */}
        <div className="hidden lg:flex flex-col w-64 xl:w-72 bg-blue-950/50 backdrop-blur-sm border-l border-blue-700/30">
          <div className="flex-1 overflow-hidden">
            <DiagnosticTools tools={diagnosticTools} onToolClick={onToolClick} />
          </div>
        </div>

      </div>

      {/* VERSION MOBILE : Affichage des sidebars en modal si nécessaire */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 flex gap-2 justify-center z-20">
        <button 
          onClick={() => setPatientPanelVisible(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg text-sm font-medium transition-colors"
        >
          Voir les examens
        </button>
      </div>

      {/* === BOUTON D'AIDE (Lampe) === */}
      <div className="fixed bottom-6 right-6 z-30">
        {/* Bulle d'indice */}
        {showHintBubble && currentHint && (
          <div className="absolute bottom-20 right-0 w-80 bg-white rounded-lg shadow-2xl border-2 border-[#052648] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-[#052648] text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-300" />
                <span className="font-semibold">Indice</span>
              </div>
              <button 
                onClick={closeHintBubble}
                className="hover:bg-white/20 rounded p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700 text-sm leading-relaxed">{currentHint}</p>
            </div>
            <div className="bg-gray-50 px-4 py-2 rounded-b-lg border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Indices restants: <span className="font-semibold text-[#052648]">{remainingHints}</span>
              </p>
            </div>
          </div>
        )}

        {/* Bouton lampe */}
        <button
          onClick={handleHintClick}
          disabled={remainingHints === 0 || isGameOver}
          className={`
            relative w-16 h-16 rounded-full shadow-2xl
            flex items-center justify-center
            transition-all duration-300 transform
            ${remainingHints > 0 && !isGameOver
              ? 'bg-[#052648] hover:bg-[#083a6b] hover:scale-110 cursor-pointer' 
              : 'bg-gray-400 cursor-not-allowed opacity-50'
            }
          `}
          title={remainingHints > 0 ? `Obtenir un indice (${remainingHints} restant${remainingHints > 1 ? 's' : ''})` : 'Plus d\'indices disponibles'}
        >
          <Lightbulb 
            className={`w-8 h-8 ${remainingHints > 0 && !isGameOver ? 'text-yellow-300' : 'text-gray-300'}`}
            fill={remainingHints > 0 && !isGameOver ? 'currentColor' : 'none'}
          />
          
          {/* Badge avec nombre d'indices restants */}
          {remainingHints > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-[#052648]">
              <span className="text-xs font-bold text-[#052648]">{remainingHints}</span>
            </div>
          )}
        </button>
      </div>
      
      {/* === PANNEAU MODAL === */}
      {isPatientPanelVisible && (
        <PatientInfoPanel 
          data={patientData} 
          service={selectedService} 
          onClose={() => setPatientPanelVisible(false)}
        />
      )}
    </div>
  );
};

export default ConsultationView;