// app/simulation/page.tsx
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Stethoscope, X, Lightbulb, Thermometer, Gauge, Wind, TestTube } from 'lucide-react';
import Link from 'next/link';

// Importations des nouvelles structures
import HomeView from '@/components/simulation/HomeView';
import PatientInfoView from '@/components/simulation/PatientInfoView';
import ConsultationView from '@/components/simulation/ConsultationView';
import { services, patientsData } from '@/types/simulation/constant';
import { Patient, Service, Message, Icon } from '@/types/simulation/types';
import { exampleExams } from '@/types/simulation/constant';

const MedicalSimulationPage = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [difficulty, setDifficulty] = useState('Profane');
  const [messageCount, setMessageCount] = useState(0);

  const isGameOver = messageCount >= 5;

  const diagnosticTools = useMemo(() => {
    if (!patientData) return [];
    return [
      { name: 'Température', icon: Thermometer, key: 'temperature' as keyof Patient, patientValue: patientData.temperature },
      { name: 'Pression Art.', icon: Gauge, key: 'pressionArterielle' as keyof Patient, patientValue: patientData.pressionArterielle },
      { name: 'Saturation O2', icon: Wind, key: 'saturationOxygene' as keyof Patient, patientValue: patientData.saturationOxygene },
      { name: 'Examen Clinique', icon: Stethoscope, key: 'examenClinique' as keyof Patient, patientValue: patientData.examenClinique },
      { name: 'Biologie', icon: TestTube, key: 'analyseBiologique' as keyof Patient, patientValue: patientData.analyseBiologique },
    ];
  }, [patientData]);

  // --- LOGIQUE (Handlers) ---

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setPatientData(patientsData[service.id] || Object.values(patientsData)[0]);
    setCurrentView('patientInfo');
  };

  const handleRandomCase = () => {
    const randomService = services[Math.floor(Math.random() * services.length)];
    handleServiceSelect(randomService);
  };
  
  const addSystemMessage = (text: string, icon: Icon = Lightbulb) => {
    const systemMessage: Message = {
      sender: 'system', text, icon,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleToolClick = (tool: { name: string, patientValue: string | number | undefined, icon: Icon }) => {
    if (tool.patientValue) {
      addSystemMessage(`${tool.name} : ${tool.patientValue}`, tool.icon);
    } else {
      addSystemMessage(`Donnée non disponible pour : ${tool.name}`, Lightbulb);
    }
  };

  const startConsultation = () => {
    if (!patientData) return;
    setCurrentView('consultation');
    setMessages([
      { sender: 'patient', text: `Bonjour docteur. ${patientData.motif}.`, 
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
    ]);
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || isGameOver) return;
    const newMessage = {
      sender: 'doctor' as const, text: inputMessage,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    setMessageCount(prev => prev + 1);
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    
    setTimeout(() => {
      const responses = ["Oui docteur, exactement.", "Ça a commencé il y a quelques jours...", "Non, je n'ai pas d'autres symptômes.", "La douleur est vraiment intense."];
      const patientResponse = { sender: 'patient' as const, text: responses[Math.floor(Math.random() * responses.length)], time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, patientResponse]);
    }, 1500);
  };

  const resetSimulation = () => {
    setCurrentView('home');
    setSelectedService(null);
    setPatientData(null);
    setMessages([]);
    setInputMessage('');
    setMessageCount(0);
  };
  
  // --- RENDU ---
  
  const renderView = () => {
    switch (currentView) {
      case 'patientInfo':
        if (patientData && selectedService) {
          return <PatientInfoView patientData={patientData} selectedService={selectedService} onStartConsultation={startConsultation} />;
        }
        return null; // ou un fallback
      case 'consultation':
        if (patientData && selectedService) {
            return (
              <ConsultationView
                patientData={patientData}
                selectedService={selectedService}
                messages={messages}
                inputMessage={inputMessage}
                onInputChange={setInputMessage}
                onSendMessage={sendMessage}
                messageCount={messageCount}
                diagnosticTools={diagnosticTools}
                onToolClick={handleToolClick}
                clinicalExams={exampleExams} 
                isGameOver={isGameOver}
                onReset={resetSimulation}
              />
            );
        }
        return null; // ou un fallback
      case 'home':
      default:
        return (
            <HomeView 
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
                onServiceSelect={handleServiceSelect}
                onRandomCase={handleRandomCase}
            />
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-primary relative overflow-hidden font-sans">
       {/* --- Début de l'intégration de la configuration Tailwind en CSS --- */}
      <style jsx global>{`
        /* 1. Définition des couleurs primaires comme variables CSS */
        :root {
          --color-primary: #052648;
          --color-primary-dark: #031a31;
        }

        /* 2. Classes utilitaires qui utilisent ces couleurs */
        .bg-primary {
          background-color: var(--color-primary);
        }
        .text-primary {
          color: var(--color-primary);
        }
        .border-primary {
          border-color: var(--color-primary);
        }
        .bg-primary-dark {
          background-color: var(--color-primary-dark);
        }
        .text-primary-dark {
          color: var(--color-primary-dark);
        }
        .border-primary-dark {
          border-color: var(--color-primary-dark);
        }

        /* 3. Définition des animations (Keyframes) */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 4. Classes pour appliquer les animations */
        /* Disponibles globalement pour ce composant et ses enfants */
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
       {/* --- Fin de l'intégration --- */}
      {(currentView === 'home' || currentView === 'patientInfo') && (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/hopital.jpg)' }}>
            <div className="absolute inset-0 bg-black/50"></div>
        </div>
      )}
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="p-4 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary border-2 border-white/50 flex items-center justify-center shadow-lg">
              <Link href='/'><Stethoscope className="w-6 h-6 text-white" /></Link>
            </div>
            <div>
              <h1 className="text-2xl font-bold">FullTang</h1>
              <p className="text-white/70 text-xs">Simulation Médicale</p>
            </div>
          </div>
          {currentView !== 'home' && (
            <button onClick={resetSimulation} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default MedicalSimulationPage;