// components/simulation/ConsultationView.tsx
'use client';
import React , { useState } from 'react';
import { Stethoscope } from 'lucide-react';
import { Patient, Service, Message, DiagnosticTool } from './types';

// Importation des sous-composants que nous venons de créer
import ChatWindow from './ChatWindow';
import DiagnosticTools from './DiagnosticTools';
import PatientInfoPanel from './PatientInfoPanel';

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
  isGameOver: boolean;
  onReset: () => void;
}

/**
 * Le composant principal pour la vue de consultation.
 * Il assemble le ChatWindow, le panneau visuel et les DiagnosticTools.
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
  isGameOver,
  onReset,
}) => {
  // Gère la visibilité du panneau d'information du patient.
  const [isPatientPanelVisible, setPatientPanelVisible] = useState(false);

  return (
    <>
      {/* Fond d'écran spécifique à la vue consultation */}
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: 'url(/images/consultation.jpg)' }} />
      <div className="absolute inset-0 bg-primary/70 backdrop-blur-md z-0" />
      
      {/* Conteneur principal de la vue, positionné au-dessus du fond */}
      <div className="z-10 w-full h-full flex flex-col md:flex-row gap-6 p-4 md:p-8">
        
        {/* === SECTION GAUCHE : CHAT === */}
        <div className="w-full md:w-2/3 h-full">
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
            onShowPatientInfo={() => setPatientPanelVisible(true)} // Gère l'ouverture du panel
          />
        </div>

        {/* === SECTION DROITE : VISUEL + OUTILS === */}
        {/* Ce panneau est caché sur les petits écrans pour donner de la place au chat */}
        <div className="hidden md:flex md:w-1/3 flex-col relative text-white">
          <div className="text-center my-auto space-y-6 p-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-blue-700 rounded-full flex items-center justify-center shadow-xl">
              <Stethoscope className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h3 className="text-3xl font-bold">Salle de consultation</h3>
            <p className="text-white/80">
              Échangez avec le patient pour établir votre diagnostic.
            </p>
            <div className="mt-4 p-6 bg-white/10 backdrop-blur-sm rounded-xl">
              <p className="text-sm text-white/70 mb-2">Diagnostic attendu:</p>
              <p className="font-semibold text-xl blur-sm hover:blur-none transition-all duration-300 cursor-help">
                {patientData.diagnostic}
              </p>
              <p className="text-xs text-white/60 mt-2">(Survolez pour révéler)</p>
            </div>
          </div>

          {/* On utilise ici le composant dédié aux outils de diagnostic */}
          <DiagnosticTools tools={diagnosticTools} onToolClick={onToolClick} />
        </div>
      </div>
      
      {/* === PANNEAU MODAL (au-dessus de tout) === */}
      {/* Conditionnellement rendu lorsque l'état isPatientPanelVisible est vrai */}
      {isPatientPanelVisible && (
        <PatientInfoPanel 
          data={patientData} 
          service={selectedService} 
          onClose={() => setPatientPanelVisible(false)} // Gère la fermeture
        />
      )}
    </>
  );
};

export default ConsultationView;