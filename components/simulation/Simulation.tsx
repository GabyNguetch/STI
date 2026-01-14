// app/simulation/page.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Stethoscope, X, Lightbulb, Thermometer, Gauge, Wind, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { fetchClinicalCase } from '@/services/SimulationService';
import { services } from '@/types/simulation/constant';
import { Patient, Service, Message, ClinicalExam, GameResult, GameState } from '@/types/simulation/types';
import { exampleExams } from '@/types/simulation/constant';
import { PROFANITY_LIST } from '@/types/simulation/grosmot';

import HomeView from '@/components/simulation/HomeView';
import PatientInfoView from '@/components/simulation/PatientInfoView';
import ConsultationView from '@/components/simulation/ConsultationView';

// --- 1. COMPOSANT INTERNE (Logique) ---
const SimulationContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading } = useAuth();

  // --- CONFIG SCENARIO ---
  const [caseSequenceId, setCaseSequenceId] = useState(1040); // Départ demandé 1040
  const TUTOR_LIMIT = 5;  // Phase tutorée
  const MAX_QUESTIONS = 10; // Phase libre

  // --- ÉTATS GLOBAUX ---
  const [currentView, setCurrentView] = useState('home');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [patientData, setPatientData] = useState<Patient | null>(null);
  
  // États Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [questionsCount, setQuestionsCount] = useState(0); // Docteur -> Patient seulement
  
  // États Jeu
  const [gameState, setGameState] = useState<GameState>('asking');
  const [hintsUsed, setHintsUsed] = useState(0);
  const MAX_HINTS = 3;
  const [userDiagnosis, setUserDiagnosis] = useState('');
  const [finalResult, setFinalResult] = useState<GameResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Modales
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ClinicalExam | null>(null);
  const [isDrugModalOpen, setIsDrugModalOpen] = useState(false); 

  // Protection Route
  useEffect(() => {
    if (!isAuthLoading && !user && currentView !== 'home') {
      toast.error("Connexion requise.");
      router.push('/connexion');
    }
  }, [user, isAuthLoading, router, currentView]);

  // Si on reçoit un caseId via URL (dashboard), on peut l'utiliser, sinon on force la logique séquentielle
  useEffect(() => {
      const urlId = searchParams.get('caseId');
      if(urlId) setCaseSequenceId(parseInt(urlId));
  }, [searchParams]);

  // --- 1. DÉMARRAGE DU CAS ---
  const handleServiceSelect = async (service: Service) => {
    if (!user) { router.push('/connexion'); return; }

    setIsLoading(true);
    toast.loading(`Chargement Cas N°${caseSequenceId}...`, { id: 'loadCase' });
    
    try {
        setSelectedService(service);
        
        // MOCKUP FRONT (Le backend a la vérité via ID, ici on initialise juste l'UI)
        const fakePatient: Patient = {
            nom: "Patient (Chargement...)",
            age: 35,
            sexe: "Masculin",
            motif: "Consultation en cours...",
            antecedents: "", symptomes: "", signesVitaux: "", temperature: "", pressionArterielle: "",
            saturationOxygene: "", examenClinique: "", analyseBiologique: "", diagnostic: "", traitementAttendu: ""
        };

        setPatientData(fakePatient);
        
        // Reset
        setMessages([]);
        setQuestionsCount(0);
        setHintsUsed(0);
        setUserDiagnosis('');
        setGameState('asking');
        setFinalResult(null);
        setShowResultModal(false);
        
        setCurrentView('consultation');
        toast.success("Cas chargé !", { id: 'loadCase' });

        setMessages([{
            sender: 'system',
            text: "Le patient entre dans le cabinet. La consultation commence.",
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }]);

    } catch (err) {
        toast.error("Erreur chargement.", { id: 'loadCase' });
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  // --- 2. LOGIQUE MESSAGE ---
  const sendMessage = async () => {
      if (!inputMessage.trim() || gameState !== 'asking' || isTyping) return;

      if (checkProfanity(inputMessage)) {
          setMessages(prev => [...prev, { sender: 'system', text: "⚠️ Langage inapproprié.", time: new Date().toLocaleTimeString(), quality: 'bad' }]);
          setInputMessage('');
          return;
      }

      const currentQCount = questionsCount + 1;
      setQuestionsCount(currentQCount);
      setIsTyping(true);

      // --- PHASE A: TUTEUR (5 premiers messages) ---
      let tutorFeedback: any = null;
      if (currentQCount <= TUTOR_LIMIT) {
          try {
              console.group(`🧠 [FRONT] Analyse Tuteur (Question ${currentQCount}/${TUTOR_LIMIT})`);
              const analysisRes = await fetch('/api/chat', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({
                      mode: 'analyze',
                      userMessage: inputMessage,
                      messages: messages,
                      caseId: caseSequenceId
                  })
              });
              const analysisData = await analysisRes.json();
              console.log("Feedback Tuteur:", analysisData);
              console.groupEnd();
              
              if(analysisData.status) {
                  tutorFeedback = {
                      status: analysisData.status, 
                      justification: analysisData.justification
                  };
              }
          } catch (e) {
              console.error("Erreur Tuteur:", e);
          }
      }

      // --- PHASE B: Affichage Message Utilisateur ---
      const userMsg: Message = {
          sender: 'doctor',
          text: inputMessage,
          time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
          quality: tutorFeedback?.status === 'warning' ? 'bad' : 'good', 
          feedback: tutorFeedback?.justification
      };
      
      setMessages(prev => [...prev, userMsg]);
      const tempInput = inputMessage; 
      setInputMessage('');

      // --- PHASE C: Appel RAG Patient ---
      try {
          console.groupCollapsed(`🗣️ [FRONT] Envoi RAG Patient - Case ${caseSequenceId}`);
          
          const chatRes = await fetch('/api/chat', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  mode: 'chat',
                  userMessage: tempInput,
                  messages: messages, 
                  caseId: caseSequenceId,
                  learnerId: user?.id
              })
          });
          
          const chatData = await chatRes.json();
          console.log("📩 [FRONT] Réponse Brute:", chatData);
          console.groupEnd();

          // CORRECTION CRITIQUE ICI : Gestion polyvalente des clés de réponse
          // Le backend peut renvoyer 'response' ou 'content' selon l'endpoint
          const patientText = chatData.response || chatData.content || chatData.answer || "(Le patient reste silencieux...)";

          setMessages(prev => [...prev, {
              sender: 'patient',
              text: patientText,
              time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
          }]);

          // Mise à jour info patient si le backend les renvoie (optionnel mais utile pour 'role', 'nom' etc)
          if(chatData.case_title && patientData?.nom === "Patient (Chargement...)") {
             setPatientData(prev => ({ ...prev!, nom: "Patient " + caseSequenceId }));
          }

      } catch (err) {
          console.error("Erreur Chat:", err);
          toast.error("Problème de connexion avec le patient.");
          setMessages(prev => [...prev, { sender: 'system', text: "Erreur technique : Le patient ne répond pas.", time: "" }]);
      } finally {
          setIsTyping(false);
          
          // Phase Check
          if (currentQCount === TUTOR_LIMIT) {
              setTimeout(() => {
                  toast('Fin du tutorat. Mode autonomie.', { icon: '🎓' });
                  setMessages(prev => [...prev, {
                      sender: 'system',
                      text: "🎓 FIN DE LA PHASE TUTORÉE. Vous continuez en autonomie.",
                      time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
                  }]);
              }, 1200);
          }
          
          if (currentQCount >= MAX_QUESTIONS) {
              setGameState('diagnosing');
              toast("Consultation terminée. Diagnostic requis.", { icon: '🛑' });
          }
      }
  };

  // --- 3. INDICE ---
  const requestHint = async () => {
      if (hintsUsed >= MAX_HINTS) return toast.error("Plus d'indices disponibles.");
      const tid = toast.loading("Le tuteur réfléchit...");
      
      try {
          const res = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  mode: 'hint',
                  caseId: caseSequenceId,
                  learnerId: user?.id,
                  messages: messages
              })
          });
          const data = await res.json();
          
          setMessages(prev => [...prev, {
              sender: 'tutor',
              text: data.content,
              time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
              icon: Lightbulb
          }]);
          setHintsUsed(h => h + 1);
          toast.success("Indice reçu", { id: tid });
      } catch (e) {
          toast.error("Indice indisponible", { id: tid });
      }
  };

  // --- 4. EXAMENS ---
  const handlePrescribeExam = async (examName: string, reason: string) => {
      const tid = toast.loading(`Analyse ${examName}...`);
      setIsExamModalOpen(false); // On ferme avant

      try {
          const res = await fetch('/api/chat', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  mode: 'exam',
                  caseId: caseSequenceId,
                  examName: examName,
                  examReason: reason
              })
          });
          const data = await res.json();

          setMessages(prev => [...prev, {
              sender: 'system',
              text: `📄 RÉSULTAT ${data.exam_name || examName}: ${data.resultat}`,
              time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
              isAction: true
          }]);
          
          toast.success("Résultat reçu", { id: tid });
      } catch (e) {
          toast.error("Erreur Labo", { id: tid });
      }
  };

    // Wrapper simple pour la barre d'outils rapides (Thermometre, etc)
  const handleQuickTool = (tool: any) => {
      // On déclenche un examen "rapide" sans passer par la modale justification
      handlePrescribeExam(tool.name, "Prise de constante (Monitoring)");
  };

  // --- 5. SUBMISSION ---
  const handleFinalPrescription = async (medication: string, dosage: string) => {
      const loadingId = toast.loading("Correction IA...");
      setIsDrugModalOpen(false);

      try {
           const payload = {
              mode: 'grade',
              learnerId: user?.id,
              caseId: caseSequenceId,
              messages: messages, 
              userDiagnosis: userDiagnosis,
              userPrescription: `${medication} ${dosage}`
           };

           const res = await fetch('/api/chat', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(payload)
           });

           const result: GameResult = await res.json();
           const penalty = hintsUsed * 1; 
           result.score = Math.max(0, result.score - penalty);

           setFinalResult(result);
           setGameState('finished');
           setShowResultModal(true);
           toast.success(`Terminé! Note : ${result.score}/20`, { id: loadingId });

      } catch (err) {
          console.error(err);
          toast.error("Erreur notation.", { id: loadingId });
      }
  };

  // --- 6. NAVIGATION CAS SUIVANT ---
  const handleNextCase = () => {
      const nextId = caseSequenceId + 1;
      setCaseSequenceId(nextId);
      if (selectedService) {
          handleServiceSelect(selectedService); // Relance le flow complet
      }
  };

  const checkProfanity = (txt: string) => PROFANITY_LIST.some(bw => txt.toLowerCase().includes(bw));
  const tools = [
      { name: 'Température', icon: Thermometer },
      { name: 'Tension', icon: Gauge },
      { name: 'SpO2', icon: Wind }
  ];

  const handleToolClick = (tool: any) => handlePrescribeExam(tool.name, "Prise de constante standard");
  return (
    <div className="min-h-screen bg-[#052648] relative font-sans text-slate-800">
    <style jsx global>{`
        :root { --color-primary: #052648; --color-primary-dark: #031a31; }
        .bg-primary { background-color: var(--color-primary); }
        .text-primary { color: var(--color-primary); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
      `}</style>

      <main className="flex-1 h-[calc(100vh-80px)] flex items-center justify-center p-4">
        {isLoading && <div className="text-white animate-pulse">Initialisation du patient...</div>}

        {!isLoading && (
            <>
                {currentView === 'home' && (
                     <HomeView 
                        difficulty="Débutant" 
                        onDifficultyChange={() => {}} 
                        onServiceSelect={handleServiceSelect} 
                        onRandomCase={() => handleServiceSelect(services[0])} 
                     />
                )}

                {/* NOTE: PatientInfoView est sauté dans ce flux pour aller vite, mais on pourrait l'ajouter */}

                {currentView === 'consultation' && selectedService && (
                    <ConsultationView
                        patientData={patientData!} // Fake data initially
                        selectedService={selectedService}
                        messages={messages}
                        inputMessage={inputMessage}
                        onInputChange={setInputMessage}
                        onSendMessage={sendMessage}
                        messageCount={questionsCount}
                        MAX_QUESTIONS={MAX_QUESTIONS}
                        diagnosticTools={tools as any}
                        clinicalExams={exampleExams} 
                        
                        // Exams Logic
                        isExamModalOpen={isExamModalOpen}
                        selectedExam={selectedExam}
                        onExamClick={(ex) => { setSelectedExam(ex); setIsExamModalOpen(true); }}
                        onCloseExamModal={() => setIsExamModalOpen(false)}
                        onPrescribeExam={(exam) => handlePrescribeExam(exam.name, "Examen standard")}
                        
                        // Game Logic
                        isGameOver={gameState === 'finished'}
                        gameState={gameState}
                        onReset={handleNextCase} 
                        
                        // Hints
                        remainingHints={MAX_HINTS - hintsUsed}
                        onRequestHint={requestHint}
                        
                        // Diagnosis
                        userDiagnosis={userDiagnosis}
                        setUserDiagnosis={setUserDiagnosis}
                        onTriggerDiagnosis={() => setGameState('diagnosing')}
                        onConfirmDiagnosis={() => {
                            if(!userDiagnosis.trim()) return toast.error("Diagnostic requis.");
                            setGameState('treating');
                            setIsDrugModalOpen(true);
                        }}
                        
                        // Drugs
                        isDrugModalOpen={isDrugModalOpen}
                        onOpenDrugModal={() => setIsDrugModalOpen(true)}
                        onCloseDrugModal={() => setIsDrugModalOpen(false)}
                        onFinalPrescription={handleFinalPrescription}
                        isTyping={isTyping}
                        onToolClick={handleQuickTool}
                    />
                )}
            </>
        )}
      </main>
      
      {/* --- RESULT MODAL RESPONSIVE --- */}
      {showResultModal && finalResult && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
               <div className="bg-white rounded-2xl w-full max-w-lg md:max-w-2xl lg:max-w-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                   
                   <div className={`h-2 w-full flex-shrink-0 ${finalResult.score >= 10 ? 'bg-green-500' : 'bg-red-500'}`} />
                   
                   <div className="p-6 md:p-8 overflow-y-auto">
                       <div className="text-center mb-8">
                           <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 mb-4 ${
                               finalResult.score >= 10 ? 'border-green-100 bg-green-50 text-green-600' : 'border-red-100 bg-red-50 text-red-600'
                           }`}>
                               <span className="text-4xl font-bold">{finalResult.score}</span>
                               <span className="text-xs text-gray-500 mt-1 ml-1">/20</span>
                           </div>
                           <h2 className="text-2xl font-bold text-gray-800">
                               {finalResult.score >= 10 ? "Stage Validé !" : "Stage Non Validé"}
                           </h2>
                       </div>

                       <div className="grid md:grid-cols-2 gap-6 text-left">
                           <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                               <p className="text-xs text-slate-500 uppercase font-bold mb-2">Analyse du Professeur</p>
                               <p className="text-sm text-slate-700 leading-relaxed italic">"{finalResult.feedback}"</p>
                           </div>
                           
                           {finalResult.missedSteps && finalResult.missedSteps.length > 0 && (
                               <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                   <p className="text-xs text-amber-700 uppercase font-bold mb-2">Points manqués</p>
                                   <ul className="text-sm text-amber-800 space-y-1 list-disc pl-4">
                                       {finalResult.missedSteps.map((step, i) => <li key={i}>{step}</li>)}
                                   </ul>
                               </div>
                           )}
                       </div>
                   </div>

                   <div className="p-6 border-t bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                       <button onClick={() => {setShowResultModal(false); setCurrentView('home');}} className="text-slate-500 hover:text-primary font-medium text-sm">
                           Retour au menu
                       </button>
                       <button onClick={handleNextCase} 
                           className="w-full sm:w-auto px-8 py-3 bg-[#052648] text-white font-bold rounded-xl hover:bg-[#0a4d8f] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                           <RefreshCcw size={18} />
                           Cas Suivant (N°{caseSequenceId + 1})
                       </button>
                   </div>
               </div>
           </div>
      )}
    </div>
  );
};

export default SimulationContent;