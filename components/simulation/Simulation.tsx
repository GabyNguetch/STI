'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Thermometer, Gauge, Wind, Lightbulb, ClipboardCheck } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { services } from '@/types/simulation/constant';
import { PROFANITY_LIST } from '@/types/simulation/grosmot';
import { Patient, Service, Message, GameState } from '@/types/simulation/types';
import { exampleExams } from '@/types/simulation/constant'; // fallback data

// Services
import {
    startSimulationSession,
    sendSimulationAction,
    requestSimulationHint,
    submitSimulationDiagnosis,
    StartSessionResponse
} from '@/services/SimulationService';

// Note: RAG et IA sont désormais gérés par les actions de la session backend, 
// mais on garde les fonctions de chat au cas où le backend renvoie le résultat brut sans le texte.
import { sendMessageToRAG } from '@/services/ChatService';

import HomeView from '@/components/simulation/HomeView';
import ConsultationView from '@/components/simulation/ConsultationView';

// ==========================================
// 🛠️ MAPPING SÉCURISÉ DES DONNÉES BACKEND
// ==========================================
const mapBackendToPatient = (response: any): Patient => {
    console.group("🏥 [ADAPTER] Mapping Patient Data");
    console.log("Raw Response:", response);

    // 1. Sécuriser l'accès à l'objet 'clinical_case'
    // Il peut être à la racine ou dans response.clinical_case
    const cc = response?.clinical_case || response;
    
    if (!cc) {
        console.error("❌ ERREUR: Objet clinical_case introuvable");
        console.groupEnd();
        throw new Error("Format de données invalide");
    }

    // 2. Extraire les sous-objets avec fallback objet vide {}
    const pClinique = cc.presentation_clinique || {};
    const dPara = cc.donnees_paracliniques || {};
    const patho = cc.pathologie_principale || {};

    // 3. Traitement des antécédents (qui est 'null' dans ton JSON exemple)
    let antecedentsStr = "Non précisés";
    if (pClinique.antecedents) {
        if (typeof pClinique.antecedents === 'string') {
            antecedentsStr = pClinique.antecedents;
        } else if (typeof pClinique.antecedents === 'object') {
            // Parfois stocké dans 'details' ou un tableau
            antecedentsStr = pClinique.antecedents.details || JSON.stringify(pClinique.antecedents);
        }
    }

    // 4. Traitement des symptômes
    // Ton JSON montre 'symptomes_patient' comme un tableau d'objets avec {symptome_id, details}
    // On va essayer d'en extraire un résumé textuel
    let symptomesStr = "Non spécifiques";
    if (Array.isArray(pClinique.symptomes_patient) && pClinique.symptomes_patient.length > 0) {
        // On prend les 5 premiers détails s'ils existent
        symptomesStr = pClinique.symptomes_patient
            .slice(0, 5)
            .map((s: any) => s.details?.replace('Valeur: ', '') || "Symptôme " + s.symptome_id)
            .join(', ') + (pClinique.symptomes_patient.length > 5 ? '...' : '');
    }

    // 5. Gestion des signes vitaux
    // Dans MIMIC (ton JSON), les signes sont souvent dans 'lab_results' ou absents au départ
    // On met des valeurs par défaut pour l'UI, le chatbot affinera.
    const signes = dPara.signes_vitaux || {};

    const uiPatient: Patient = {
        nom: cc.code_fultang || `Patient-${cc.id}`,
        // Age souvent manquant dans MIMIC-III, on simule si null
        age: typeof pClinique.age === 'number' ? pClinique.age : 58, 
        sexe: pClinique.sexe || 'Masculin',
        // Motif souvent l'histoire de la maladie brute
        motif: pClinique.histoire_maladie || "Hospitalisation urgente", 
        antecedents: antecedentsStr,
        histoireMaladie: pClinique.histoire_maladie || "",
        symptomes: symptomesStr,
        
        // Champs obligatoires pour l'interface UI
        signesVitaux: JSON.stringify(signes),
        temperature: signes.temperature || "37.5°C",
        pressionArterielle: signes.ta || "130/85",
        saturationOxygene: signes.spo2 || "97%",
        
        // Labo et Examen physique
        examenClinique: dPara.examen_clinique || "À réaliser lors de l'examen physique.",
        analyseBiologique: dPara.lab_results ? `${dPara.lab_results.length} paramètres disponibles` : "En attente",
        
        // Solution
        diagnostic: patho.nom_fr || "Diagnostic Inconnu",
        traitementAttendu: "Protocole standard selon les guidelines."
    };

    console.log("Mapped Patient:", uiPatient);
    console.groupEnd();
    
    return uiPatient;
};
// Composant Skeleton personnalisé pour la Simulation
const SimulationSkeleton = () => {
  return (
    <div className="fixed inset-0 flex flex-col bg-[#052648]">
      {/* Skeleton Header */}
      <div className="flex-none h-16 bg-[#052648]/50 border-b border-blue-800/30 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse"></div>
           <div className="flex flex-col gap-1">
             <div className="h-4 w-32 bg-white/10 rounded animate-pulse"></div>
             <div className="h-3 w-20 bg-white/5 rounded animate-pulse"></div>
           </div>
        </div>
        <div className="flex gap-2">
            <div className="w-24 h-8 rounded-lg bg-white/10 animate-pulse"></div>
            <div className="w-24 h-8 rounded-lg bg-emerald-500/20 animate-pulse"></div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Skeleton Sidebar Gauche (Examens) */}
        <div className="hidden lg:flex flex-col w-20 border-r border-white/5 bg-blue-900/10 p-2 gap-3 pt-4">
             {[1,2,3,4,5,6].map(i => (
                 <div key={i} className="w-14 h-14 mx-auto rounded-xl bg-white/5 animate-pulse" style={{animationDelay: `${i*100}ms`}}></div>
             ))}
        </div>

        {/* Skeleton Zone Centrale (Chat/Diag) */}
        <div className="flex-1 p-4 flex items-center justify-center relative bg-slate-900/20">
             
             {/* Center Card */}
             <div className="bg-white/5 w-full max-w-4xl h-[600px] rounded-xl border border-white/10 relative overflow-hidden">
                {/* Simulation Chat Bubbles */}
                <div className="p-6 space-y-4">
                     <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-white/10 shrink-0"></div>
                         <div className="w-[60%] h-12 bg-white/10 rounded-2xl rounded-tl-none animate-pulse"></div>
                     </div>
                     <div className="flex gap-3 flex-row-reverse">
                         <div className="w-8 h-8 rounded-full bg-white/10 shrink-0"></div>
                         <div className="w-[50%] h-12 bg-white/20 rounded-2xl rounded-tr-none animate-pulse" style={{animationDelay: "200ms"}}></div>
                     </div>
                     <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-white/10 shrink-0"></div>
                         <div className="w-[70%] h-20 bg-white/10 rounded-2xl rounded-tl-none animate-pulse" style={{animationDelay: "400ms"}}></div>
                     </div>
                </div>

                {/* Bottom Input Area Skeleton */}
                <div className="absolute bottom-0 w-full h-20 border-t border-white/5 p-4 bg-white/5">
                    <div className="w-full h-full bg-white/10 rounded-lg animate-pulse"></div>
                </div>

                {/* Petit Loader Texte Centré */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-sm z-10">
                     <div className="w-12 h-12 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mb-4"></div>
                     <p className="text-white font-medium text-sm animate-pulse tracking-wide">Préparation de l'environnement clinique...</p>
                </div>
             </div>
        </div>

        {/* Skeleton Sidebar Droite (Tools) */}
        <div className="hidden lg:flex flex-col w-20 border-l border-white/5 bg-blue-900/10 p-2 gap-3 pt-4">
             {[1,2,3].map(i => (
                 <div key={i} className="w-14 h-14 mx-auto rounded-xl bg-white/5 animate-pulse" style={{animationDelay: `${i*150}ms`}}></div>
             ))}
        </div>
      </div>
    </div>
  );
};


// ========== COMPOSANT PRINCIPAL ==========
const SimulationContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoading: isAuthLoading } = useAuth();

    // -- ETATS DE VUE --
    const [currentView, setCurrentView] = useState<'home' | 'loading' | 'consultation'>('loading');
    const initialized = useRef(false);

    // -- ETATS SESSION --
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [caseId, setCaseId] = useState<number | null>(null);
    const [patientData, setPatientData] = useState<Patient | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    
    // -- ETATS JEU (FLOW) --
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [gameState, setGameState] = useState<GameState>('asking');
    const [questionCount, setQuestionCount] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    
    // Limites de la partie (Défini par le type de session)
    const [maxQuestions, setMaxQuestions] = useState(5); 
    const [hintsRemaining, setHintsRemaining] = useState(3);
    const [mode, setMode] = useState<'diagnostic'|'training'|'evaluation'>('diagnostic');

    // -- ETATS MODALES --
    const [modalState, setModalState] = useState({
        exam: false,
        drug: false,
        result: false
    });
    const [selectedExam, setSelectedExam] = useState<any>(null);
    const [userDiagnosis, setUserDiagnosis] = useState("");
    const [evaluationResult, setEvaluationResult] = useState<any>(null);


    // 1. PROTECTION ROUTE
    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/connexion');
        }
    }, [user, isAuthLoading, router]);

    // 2. INITIALISATION SESSION (Une seule fois au montage si query params)
    useEffect(() => {
        if (initialized.current || !user) return;
        
        const categoryParam = searchParams.get('category');
        const modeParam = searchParams.get('mode');

        if (categoryParam) {
            initialized.current = true;
            initSession(categoryParam, (modeParam as any) || 'diagnostic');
        } else {
            // Pas de paramètre ? On retourne au dashboard ou on affiche le home
            setCurrentView('home'); 
        }
    }, [searchParams, user]);

    


    // ========== API ACTIONS ==========

    const initSession = async (category: string, selectedMode: 'diagnostic'|'training'|'evaluation') => {
        if(!user) return;
        
        console.group(`🚀 [FLOW 2] Initialisation Session`);
        // Dans initSession, juste après l'appel API
        console.group('🎯 DEBUG SESSION');
        console.log('User ID:', user?.id);
        console.log('Category:', category);
        console.log('Mode:', selectedMode);
        console.groupEnd();
        console.log("Paramètres:", { userId: user.id, category, mode: selectedMode });

        try {
            setCurrentView('loading');

            // --- APPEL API BACKEND ---
            const data = await startSimulationSession(user.id, null, category, selectedMode);
            console.log("✅ [API] Session Démarrée:", data);
            
            // Configuration de l'état
            setSessionId(data.session_id);
            setCaseId(data.clinical_case.id);
            setMode(selectedMode);
            
            // Paramétrage des limites (Step 4 du prompt: max 5 questions)
            // Si l'API renvoie des limites, on les prend, sinon hardcodé
            const limit = selectedMode === 'diagnostic' ? 5 : (data.max_messages || 15);
            setMaxQuestions(limit);
            setHintsRemaining(data.hints_allowed || 0);

            // Mapping Données Patient (C'est là que ça plantait avant)
            const safePatient = mapBackendToPatient(data);
            setPatientData(safePatient);

            // Déduction du service visuel
            const srv = services.find(s => 
                s.name.toLowerCase().includes(category.toLowerCase()) || 
                category.toLowerCase().includes(s.id)
            ) || services[0];
            setSelectedService(srv);

            // Message de bienvenue
            setMessages([{
                sender: 'system',
                text: `Session ${selectedMode.toUpperCase()} initiée. Vous disposez de ${limit} interactions pour poser le diagnostic.`,
                time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})
            }]);

            setCurrentView('consultation');
            toast.success("Simulation prête", { position: 'bottom-center' });

        } catch (error: any) {
            console.error("❌ ERREUR START SESSION:", error);
            toast.error("Impossible de lancer la session: " + error.message);
            router.push('/dashboard/goals');
        }
        console.groupEnd();
    };
    const handleUserAction = async (content: string, type: 'question'|'examen_complementaire'|'parametres_vitaux'|'consulter_image') => {
        if (!sessionId || isTyping || gameState !== 'asking') return;

        if (questionCount >= maxQuestions) {
            setGameState('diagnosing');
            toast("Limite de questions atteinte ! Formulez votre diagnostic.", { icon: '🛑', duration: 4000 });
            return;
        }

        console.group("🗣️ [FLOW 3] Action User");
        console.log(`Type: ${type}, Content: ${content}`);

        // Update UI immédiat
        setMessages(prev => [...prev, {
            sender: 'doctor',
            text: content,
            time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'}),
            isAction: type !== 'question'
        }]);
        
        setIsTyping(true);
        setQuestionCount(c => type === 'question' ? c + 1 : c);

        try {
            // --- APPEL API BACKEND (Format corrigé) ---
            const actionRes = await sendSimulationAction(sessionId, {
                action_type: type,
                action_name: type === 'question' ? 'Dialogue' : content,
                content: content,
                justification: "Simulation interactive"
            });
            
            console.log("✅ [API] Action Recorded & Response:", actionRes);

            // ✅ La réponse est maintenant directement dans actionRes.content
            let aiText = actionRes.content || actionRes.result?.text;
            
            // Fallback si pas de texte
            if (!aiText) {
                if (type === 'question') {
                    aiText = "Le patient ne répond pas clairement.";
                } else {
                    aiText = "Résultat enregistré dans le dossier.";
                }
            }

            // Affichage réponse
            setMessages(prev => [...prev, {
                sender: type === 'question' ? 'patient' : 'system',
                text: aiText,
                time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'}),
                quality: actionRes.feedback ? 'good' : undefined
            }]);
            
            // CHECK FIN DU TOUR
            if (type === 'question' && (questionCount + 1) >= maxQuestions) {
                console.log("🛑 LIMITE ATTEINTE - TRIGGER DIAGNOSTIC");
                setTimeout(() => {
                    setGameState('diagnosing');
                    toast('Dernière question posée. Place au diagnostic !', { icon: '🛑' });
                }, 1500);
            }

        } catch (error: any) {
            console.error("❌ Erreur Action:", error);
            
            // Afficher un message d'erreur plus explicite
            const errorMsg = error.details?.msg || error.message || "Erreur technique communication serveur.";
            
            setMessages(prev => [...prev, { 
                sender: 'system', 
                text: `⚠️ ${errorMsg}`, 
                time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'}), 
                quality: 'bad' 
            }]);
            
            toast.error(errorMsg);
        } finally {
            setIsTyping(false);
            console.groupEnd();
        }
    };

    const handleRequestHint = async () => {
        if (!sessionId || hintsRemaining <= 0) return;
        
        try {
            await requestSimulationHint(sessionId); // Log
            setHintsRemaining(prev => prev - 1);
            setMessages(prev => [...prev, {
                sender: 'tutor',
                text: "Indice: Reconsidérez les constantes vitales ou l'historique cardiaque.", // Simplifié pour demo si backend renvoie rien
                time: new Date().toLocaleTimeString(),
                icon: Lightbulb
            }]);
        } catch(e) { console.error(e); }
    };


    // ========== 5. SOUMISSION FINALE ==========
    const handleFinalSubmit = async (medications: string, dosage: string) => {
        if (!sessionId) return;
        const loadToast = toast.loading("Le Tuteur évalue votre session...");
        setModalState(s => ({...s, drug: false}));

        const prescriptionText = `Prescription: ${medications}. Posologie: ${dosage}`;

        try {
            // Envoi Diagnostic & Traitement
            const res = await submitSimulationDiagnosis(
                sessionId, 
                userDiagnosis, 
                prescriptionText
            );
            console.log("🎓 [API] EVALUATION:", res);

            // Construction objet résultat pour modal
            // Utilise les fallbacks si l'objet evaluation est imbriqué différemment
            const scoreTotal = res.score !== undefined ? res.score : (res.evaluation?.score_total || 0);

            setEvaluationResult({
                score: scoreTotal,
                maxScore: 20,
                feedback: res.feedback_global || "Évaluation terminée.",
                nextStep: res.next_action
            });
            
            setGameState('finished');
            setModalState(s => ({...s, result: true}));
            toast.dismiss(loadToast);

        } catch(error: any) {
            toast.error("Erreur soumission: " + error.message, { id: loadToast });
        }
    };

    // ========== RENDERERS ==========

    if (currentView === 'loading' || !selectedService) {
        return (
              <div>  ..... </div>
        );
    }

    if (currentView === 'home' || !patientData) {
        // En cas d'erreur de paramètre ou flow rompu
        return (
             <div className="h-screen bg-[#052648] p-8 flex items-center justify-center">
                 <div className="bg-white p-8 rounded-2xl max-w-md text-center">
                     <ClipboardCheck size={48} className="mx-auto text-orange-500 mb-4"/>
                     <h2 className="text-xl font-bold mb-2">Configuration requise</h2>
                     <p className="text-slate-600 mb-6">Veuillez sélectionner un objectif dans le tableau de bord pour initialiser une simulation correctement.</p>
                     <button onClick={() => router.push('/dashboard')} className="px-6 py-2 bg-[#052648] text-white rounded-lg hover:bg-blue-900 transition">
                         Retour Dashboard
                     </button>
                 </div>
             </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#052648]">
             {/* COMPOSANT CENTRAL DE VUE (Gère Chat et Panels) */}
             <ConsultationView 
                 // Datas
                 patientData={patientData}
                 selectedService={selectedService}
                 
                 // Game State
                 messages={messages}
                 inputMessage={inputMessage}
                 onInputChange={setInputMessage}
                 onSendMessage={() => {
                     handleUserAction(inputMessage, 'question');
                     setInputMessage("");
                 }}
                 messageCount={questionCount}
                 MAX_QUESTIONS={maxQuestions} // <-- Limite passée à l'interface
                 isTyping={isTyping}
                 gameState={gameState}
                 remainingHints={hintsRemaining}
                 onRequestHint={handleRequestHint}

                 // Panels Right/Left
                 clinicalExams={exampleExams}
                 diagnosticTools={[
                    { name: 'Température', icon: Thermometer, key: 'temperature', patientValue: patientData.temperature },
                    { name: 'Tension', icon: Gauge, key: 'pressionArterielle', patientValue: patientData.pressionArterielle },
                    { name: 'SpO2', icon: Wind, key: 'saturationOxygene', patientValue: patientData.saturationOxygene }
                 ]}

                 // Handlers (Wrapper des fonctions d'actions)
                 onToolClick={(tool) => handleUserAction(`Vérification : ${tool.name}`, 'parametres_vitaux')}
                 
                 // Modales
                 isExamModalOpen={modalState.exam}
                 selectedExam={selectedExam}
                 onCloseExamModal={() => setModalState(s => ({...s, exam: false}))}
                 onExamClick={(exam) => { setSelectedExam(exam); setModalState(s => ({...s, exam: true})); }}
                 // On adapte pour matcher la signature string attendue par la vue enfant
                 onPrescribe={(name, reason) => {
                     handleUserAction(`Examen ${name}. Indication: ${reason}`, 'examen_complementaire');
                     setModalState(s => ({...s, exam: false}));
                 }}
                 onPrescribeExam={()=>{}} // Legacy fallback

                 // Flow Diagnosis
                 onTriggerDiagnosis={() => setGameState('diagnosing')}
                 userDiagnosis={userDiagnosis}
                 setUserDiagnosis={setUserDiagnosis}
                 onConfirmDiagnosis={() => {
                     if(userDiagnosis.trim().length < 5) return toast.error("Veuillez développer votre diagnostic");
                     setModalState(s => ({...s, drug: true}));
                     setGameState('treating');
                 }}
                 
                 isDrugModalOpen={modalState.drug}
                 onCloseDrugModal={() => setModalState(s => ({...s, drug: false}))}
                 onOpenDrugModal={() => setModalState(s => ({...s, drug: true}))}
                 onFinalPrescription={handleFinalSubmit}

                 isGameOver={gameState === 'finished'}
                 onReset={() => router.push('/dashboard')}
             />

             {/* MODAL DE RÉSULTAT */}
             {modalState.result && evaluationResult && (
                 <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur p-4 animate-in fade-in zoom-in-95">
                      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                          <div className={`h-4 w-full ${evaluationResult.score >= 10 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                          <div className="p-8 flex flex-col items-center text-center overflow-y-auto">
                               <div className="w-24 h-24 rounded-full flex items-center justify-center bg-slate-100 mb-4 text-4xl shadow-inner">
                                   {evaluationResult.score >= 10 ? '🩺' : '📚'}
                               </div>
                               <h2 className="text-3xl font-extrabold text-[#052648] mb-1">
                                   {evaluationResult.score >= 10 ? 'Bien joué !' : 'Niveau Insuffisant'}
                               </h2>
                               <div className="my-4">
                                   <span className={`text-6xl font-black ${evaluationResult.score >= 10 ? 'text-emerald-600' : 'text-red-500'}`}>
                                       {Math.round(evaluationResult.score)}
                                   </span>
                                   <span className="text-xl text-slate-400 font-bold">/20</span>
                               </div>

                               <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-5 text-left text-sm text-slate-700 leading-relaxed mb-6 shadow-sm">
                                   <strong className="text-blue-800 uppercase text-xs block mb-2">Analyse du Tuteur :</strong>
                                   {evaluationResult.feedback}
                               </div>

                               <button 
                                 onClick={() => router.push('/dashboard/goals')} 
                                 className="w-full py-4 bg-[#052648] hover:bg-blue-900 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
                                >
                                   Retour aux Objectifs
                               </button>
                          </div>
                      </div>
                 </div>
             )}
        </div>
    );
};

export default SimulationContent;