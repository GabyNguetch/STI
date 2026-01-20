// app/simulation/SimulationContent.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Thermometer, Gauge, Wind, ClipboardCheck } from 'lucide-react';

// Composants & Contextes
import FunFactLoader from '@/components/common/FunFactLoader';
import ConsultationView from '@/components/simulation/ConsultationView';
import { useAuth } from '@/contexts/AuthContext';

// Types & Constantes
import { services, exampleExams } from '@/types/simulation/constant';
import { Patient, Service, Message, GameState, ClinicalExam } from '@/types/simulation/types';

// Services
import { 
    startSimulationSession, 
    sendSimulationAction, 
    requestSimulationHint, 
    submitSimulationDiagnosis,
    getSessionMessages,
    StartSessionResponse,
    SubmitResponse,
    ActionRequest,
    TutorFeedback
} from '@/services/SimulationService';

// ==========================================
// 🛠️ ADAPTATEUR : Backend JSON -> Frontend UI
// ==========================================
const mapBackendToPatient = (response: any): Patient => {
    const start = performance.now();
    console.groupCollapsed("🏥 [ADAPTER] Mapping Patient Data");
    
    const cc = response?.clinical_case || response;
    
    if (!cc) {
        console.error("❌ Critical: 'clinical_case' missing in response");
        console.groupEnd();
        throw new Error("Données cliniques invalides ou incomplètes");
    }

    const pClinique = cc.presentation_clinique || {};
    const dPara = cc.donnees_paracliniques || {};
    const patho = cc.pathologie_principale || {};

    const formatAntecedents = (val: any) => {
        if (typeof val === 'string') return val;
        if (typeof val === 'object' && val?.details) return val.details;
        return "Non significatifs";
    };

    let symptomesStr = "Motif d'admission général";
    if (Array.isArray(pClinique.symptomes_patient) && pClinique.symptomes_patient.length > 0) {
        symptomesStr = pClinique.symptomes_patient
            .slice(0, 4)
            .map((s: any) => s.details ? s.details.replace(/^Valeur:\s*/, '') : s.nom_symptome)
            .join(', ') + (pClinique.symptomes_patient.length > 4 ? '...' : '');
    }

    const signes = dPara.signes_vitaux || {};

    const uiPatient: Patient = {
        nom: cc.code_fultang || `Patient-${cc.id}`,
        age: typeof pClinique.age === 'number' ? pClinique.age : 45,
        sexe: pClinique.sexe || 'Masculin',
        motif: pClinique.histoire_maladie ? pClinique.histoire_maladie.substring(0, 50) + "..." : "Consultation urgence",
        histoireMaladie: pClinique.histoire_maladie || "Aucune histoire disponible.",
        antecedents: formatAntecedents(pClinique.antecedents),
        symptomes: symptomesStr,
        
        signesVitaux: typeof signes === 'string' ? signes : JSON.stringify(signes),
        temperature: signes.temperature || "37.0°C",
        pressionArterielle: signes.ta || "120/80",
        saturationOxygene: signes.spo2 || "98%",
        
        examenClinique: dPara.examen_clinique || "Examen physique à réaliser.",
        analyseBiologique: "Résultats en attente de prescription.",
        
        diagnostic: patho.nom_fr || "Diagnostic Inconnu",
        traitementAttendu: "Protocole standard."
    };

    console.log(`✅ Mapping terminé en ${(performance.now() - start).toFixed(2)}ms`, uiPatient);
    console.groupEnd();
    return uiPatient;
};

// ==========================================
// 🧩 COMPOSANT PRINCIPAL
// ==========================================
export default function SimulationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoading: isAuthLoading } = useAuth();

    const initRef = useRef(false);
    const [currentView, setCurrentView] = useState<'home' | 'loading' | 'consultation'>('loading');
    const [sessionId, setSessionId] = useState<string | null>(null);
    
    const [patientData, setPatientData] = useState<Patient | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    
    const [gameState, setGameState] = useState<GameState>('asking');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [sessionMode, setSessionMode] = useState<'diagnostic'|'training'|'evaluation'>('diagnostic');

    const [interactionsCount, setInteractionsCount] = useState(0); 
    const [maxInteractions, setMaxInteractions] = useState(5); 
    const [hintsRemaining, setHintsRemaining] = useState(99); 

    const [modalState, setModalState] = useState({
        exam: false,
        drug: false,
        result: false
    });
    const [selectedExam, setSelectedExam] = useState<any>(null);
    
    const [userDiagnosis, setUserDiagnosis] = useState("");
    const [evaluationResult, setEvaluationResult] = useState<any>(null);

    // ==========================================
    // 🔄 CYCLES DE VIE & INIT
    // ==========================================

    useEffect(() => {
        if (!isAuthLoading && !user) router.push('/connexion');
    }, [user, isAuthLoading, router]);

    useEffect(() => {
        if (initRef.current || !user || !searchParams.get('category')) return;
        
        initRef.current = true;
        const cat = searchParams.get('category') || 'Médecine Générale';
        const mod = (searchParams.get('mode') as any) || 'diagnostic';
        
        launchSession(cat, mod);
    }, [user, searchParams]);

    const launchSession = async (category: string, mode: 'diagnostic'|'training'|'evaluation') => {
        if(!user) return;
        
        const startT = performance.now();
        console.groupCollapsed(`🎮 [INIT] Démarrage Session: ${category} (${mode})`);

        try {
            setCurrentView('loading');

            const data: StartSessionResponse = await startSimulationSession(user.id, null, category, mode);
            
            setSessionId(data.session_id);
            setSessionMode(mode);
            
            if (mode === 'diagnostic') {
                setMaxInteractions(5);
                setHintsRemaining(999);
            } else {
                setMaxInteractions(10);
                setHintsRemaining(5);
            }

            const safePatient = mapBackendToPatient(data);
            setPatientData(safePatient);
            
            const matchedService = services.find(s => 
                s.name.toLowerCase().includes(category.toLowerCase())
            ) || services[0];
            setSelectedService(matchedService);

            setMessages([{
                sender: 'system',
                text: `Début de la simulation (${mode}). ${mode === 'diagnostic' ? '5 questions' : '10 questions'}. Les examens ne comptent pas.`,
                time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})
            }]);

            setCurrentView('consultation');
            toast.success(`Dossier patient ouvert`, { icon: '📂' });

        } catch (error: any) {
            console.error("Critical Init Error:", error);
            toast.error("Impossible de charger le patient. Retour au dashboard.");
            setTimeout(() => router.push('/dashboard'), 2000);
        } finally {
            console.log(`⏱️ Init done in ${(performance.now() - startT).toFixed(2)}ms`);
            console.groupEnd();
        }
    };

    // ==========================================
    // 💬 LOGIQUE CONVERSATION & ACTIONS
    // ==========================================

    const handleSendMessage = async () => {
        if (!sessionId || !inputMessage.trim() || isThinking) return;
        
        if (interactionsCount >= maxInteractions) {
            toast("Phase d'anamnèse terminée. Passez au diagnostic.", { icon: '🛑' });
            return;
        }

        const currentMsg = inputMessage;
        setInputMessage("");
        setIsThinking(true);
        setInteractionsCount(prev => prev + 1);

        // Message du docteur
        setMessages(prev => [...prev, {
            sender: 'doctor',
            text: currentMsg,
            time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})
        }]);

        try {
            console.time("ChatTurn");
            
            const action: ActionRequest = {
                action_type: 'question',
                action_name: 'Dialogue',
                content: currentMsg
            };

            // Envoi de l'action
            await sendSimulationAction(sessionId, action);

            // CORRECTION: Récupération des 3 derniers messages pour être sûr
            const recentMessages = await getSessionMessages(sessionId, 3);
            
            console.log("📨 Messages récupérés:", recentMessages);

            // Chercher le dernier message du patient (peut être 'Patient' ou 'patient')
            const patientMsg = recentMessages
                .reverse() // Inverser pour avoir le plus récent en premier
                .find((m: any) => 
                    m.sender?.toLowerCase() === 'patient'
                );

            console.timeEnd("ChatTurn");

            if (patientMsg) {
                const responseText = patientMsg.content || "...";
                const feedbackData = patientMsg.message_metadata?.tutor_feedback;

                console.log("🤖 Réponse patient:", responseText);
                console.log("🎓 Feedback tuteur brut:", feedbackData);

                // CORRECTION: Créer le message avec le feedback au bon format
                const newPatientMessage: Message = {
                    sender: 'patient',
                    text: responseText,
                    time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'}),
                    feedback: feedbackData // Garder l'objet directement, pas en JSON string
                };

                console.log("💾 Message patient formaté:", newPatientMessage);

                setMessages(prev => [...prev, newPatientMessage]);
            } else {
                console.warn("⚠️ Aucun message patient trouvé dans la réponse");
            }

            if (interactionsCount + 1 >= maxInteractions) {
                setTimeout(() => {
                    toast('Dernière interaction effectuée !', { icon: '⚠️' });
                    setGameState('diagnosing');
                }, 1500);
            }

        } catch (error) {
            console.error('❌ Chat error:', error);
            toast.error("Le patient ne répond pas...");
            setMessages(prev => [...prev, {
                sender: 'system', 
                text: "Erreur de connexion neuronale.", 
                time: "System"
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    // Fonction helper pour formater les résultats d'examens
    const formatExamResult = (result: any): string => {
        if (!result) return "Résultat non disponible";
        
        // Si c'est déjà une string, on la retourne
        if (typeof result.rapport_complet === 'string') {
            return result.rapport_complet;
        }
        
        // Si c'est un objet (comme pour les paramètres vitaux)
        if (typeof result.rapport_complet === 'object') {
            const params = result.rapport_complet;
            let formatted = "**Constantes mesurées:**\n";
            
            // Formatage des paramètres vitaux
            if (params.TA) formatted += `\n• Tension Artérielle: ${params.TA}`;
            if (params.FC) formatted += `\n• Fréquence Cardiaque: ${params.FC}`;
            if (params.FR) formatted += `\n• Fréquence Respiratoire: ${params.FR}`;
            if (params.SpO2) formatted += `\n• Saturation O₂: ${params.SpO2}`;
            if (params.Temp) formatted += `\n• Température: ${params.Temp}`;
            
            // Ajout de la conclusion si disponible
            if (result.conclusion) {
                formatted += `\n\n**Interprétation:** ${result.conclusion}`;
            }
            
            return formatted;
        }
        
        // Si c'est un examen biologique avec valeurs_cles
        if (result.valeurs_cles && typeof result.valeurs_cles === 'object') {
            let formatted = "**Résultats biologiques:**\n";
            
            Object.entries(result.valeurs_cles).forEach(([key, value]) => {
                formatted += `\n• ${key}: ${value}`;
            });
            
            if (result.conclusion) {
                formatted += `\n\n**Conclusion:** ${result.conclusion}`;
            }
            
            return formatted;
        }
        
        // Fallback: essayer de retourner la conclusion
        return result.conclusion || result.text || "Résultat disponible dans le dossier.";
    };

    const handleMedicalAction = async (
        actionType: 'examen_complementaire' | 'parametres_vitaux' | 'biologie', 
        name: string, 
        justification?: string
    ) => {
        if (!sessionId) return;
        setIsThinking(true);

        setMessages(prev => [...prev, {
            sender: 'system',
            text: `Action: ${name} en cours...`,
            time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'}),
            isAction: true
        }]);

        try {
            console.log(`💉 [ACTION] ${name} (${actionType})`);
            
            const action: ActionRequest = {
                action_type: actionType,
                action_name: name,
                justification: justification,
                content: name
            };

            const response = await sendSimulationAction(sessionId, action);

            // Formatage intelligent du résultat
            const formattedResult = formatExamResult(response.result);
            
            setMessages(prev => [...prev, {
                sender: 'system',
                text: `📋 **${name}**\n\n${formattedResult}`,
                time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'}),
                isAction: true,
                quality: 'good'
            }]);

            setModalState(s => ({...s, exam: false}));

        } catch (e) {
            console.error('Action error:', e);
            toast.error("Impossible de réaliser l'examen");
        } finally {
            setIsThinking(false);
        }
    };

    const handleRequestHint = async () => {
        if (hintsRemaining <= 0) return toast.error("Vous n'avez plus d'indices disponibles.");
        if (!sessionId) return;

        const loadToast = toast.loading("Le tuteur réfléchit...");
        try {
            const hintRes = await requestSimulationHint(sessionId);
            
            setHintsRemaining(prev => prev - 1);
            setMessages(prev => [...prev, {
                sender: 'tutor',
                text: hintRes.content || hintRes.hint_text,
                time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})
            }]);
            
            toast.dismiss(loadToast);
            toast.success(`Indice reçu (${hintsRemaining - 1} restants)`);
        } catch(e) {
            console.error('Hint error:', e);
            toast.error("Erreur récupération indice", { id: loadToast });
        }
    };

    // ==========================================
    // 🎓 EVALUATION & FIN
    // ==========================================

    const handleDiagnosisSubmit = async (medications: string, dosage: string) => {
        if (!sessionId) return;
        const loadToast = toast.loading("Analyse de votre démarche par le collège d'experts...");
        
        try {
            setModalState(prev => ({ ...prev, drug: false }));

            const result: SubmitResponse = await submitSimulationDiagnosis(
                sessionId, 
                userDiagnosis, 
                `Rx: ${medications}. Posologie: ${dosage}`
            );

            console.log("🏆 Score Final:", result.score);

            setEvaluationResult({
                score: result.score,
                maxScore: 20, 
                feedback: result.feedback_global,
                nextAction: result.next_action
            });

            setGameState('finished');
            setModalState(prev => ({ ...prev, result: true }));
            toast.dismiss(loadToast);
            toast.success(`Évaluation terminée: ${result.score}/20`);

        } catch (e) {
            console.error('Submit error:', e);
            toast.error("Erreur lors de l'évaluation.", { id: loadToast });
        }
    };

    const handleExitOrNext = (action: 'exit' | 'next') => {
        if (action === 'exit') {
            router.push('/dashboard/goals');
        } else {
            window.location.reload(); 
        }
    };

    // ==========================================
    // 🖼️ RENDU
    // ==========================================

    if (currentView === 'loading' || !selectedService || !patientData) {
        return <FunFactLoader />;
    }

    return (
        <div className="min-h-screen bg-[#052648]">
            <ConsultationView 
                patientData={patientData}
                selectedService={selectedService}
                
                messages={messages}
                inputMessage={inputMessage}
                onInputChange={setInputMessage}
                isTyping={isThinking}
                
                gameState={gameState} 
                messageCount={interactionsCount}
                MAX_QUESTIONS={maxInteractions}
                
                onSendMessage={handleSendMessage} 
                
                onPrescribe={(name: string, reason: string) => 
                    handleMedicalAction('examen_complementaire', name, reason)
                }

                onExamClick={(ex: ClinicalExam) => { 
                    setSelectedExam(ex); 
                    setModalState(s => ({...s, exam: true})); 
                }}

                onToolClick={(tool) => handleMedicalAction('parametres_vitaux', `Mesure de ${tool.name}`)}
                
                remainingHints={hintsRemaining}
                onRequestHint={handleRequestHint}

                diagnosticTools={[
                    { name: 'Température', icon: Thermometer, key: 'temperature', patientValue: patientData.temperature },
                    { name: 'Tension', icon: Gauge, key: 'pressionArterielle', patientValue: patientData.pressionArterielle },
                    { name: 'SpO2', icon: Wind, key: 'saturationOxygene', patientValue: patientData.saturationOxygene }
                ]}
                clinicalExams={exampleExams}

                isExamModalOpen={modalState.exam}
                selectedExam={selectedExam}
                onCloseExamModal={() => setModalState(s => ({...s, exam: false}))}
                onPrescribeExam={(exam) => handleMedicalAction('examen_complementaire', exam.name)}

                onTriggerDiagnosis={() => setGameState('diagnosing')}
                userDiagnosis={userDiagnosis}
                setUserDiagnosis={setUserDiagnosis}
                onConfirmDiagnosis={() => {
                    if (userDiagnosis.length < 5) return toast.error("Le diagnostic est trop court.");
                    setModalState(s => ({...s, drug: true}));
                }}

                isDrugModalOpen={modalState.drug}
                onCloseDrugModal={() => setModalState(s => ({...s, drug: false}))}
                onOpenDrugModal={() => setModalState(s => ({...s, drug: true}))}
                onFinalPrescription={handleDiagnosisSubmit}

                isGameOver={gameState === 'finished'}
                onReset={() => router.push('/dashboard')}
            />

            {/* --- MODAL RÉSULTATS --- */}
            {modalState.result && evaluationResult && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur p-4 animate-in fade-in zoom-in-95">
                    <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className={`h-4 w-full ${evaluationResult.score >= 10 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        
                        <div className="p-8 flex flex-col items-center text-center overflow-y-auto">
                            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-slate-50 mb-4 text-4xl shadow-inner border border-slate-100 relative">
                                {evaluationResult.score >= 10 ? '🎉' : '📚'}
                                <div className="absolute -bottom-2 px-3 py-1 bg-slate-800 text-white text-[10px] font-bold rounded-full uppercase">Note</div>
                            </div>
                            
                            <h2 className="text-2xl font-extrabold text-[#052648] mb-1">
                                {evaluationResult.score >= 10 ? 'Session Validée' : 'Niveau Insuffisant'}
                            </h2>
                            <div className="mb-6">
                                <span className={`text-5xl font-black ${evaluationResult.score >= 10 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {Math.round(evaluationResult.score)}
                                </span>
                                <span className="text-lg text-slate-400 font-bold">/20</span>
                            </div>

                            <div className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl p-5 text-left mb-8 shadow-sm">
                                <strong className="text-blue-800 uppercase text-xs tracking-wider flex items-center gap-2 mb-2">
                                    <ClipboardCheck size={14}/> Rapport du Tuteur
                                </strong>
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {evaluationResult.feedback}
                                </p>
                            </div>

                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={() => handleExitOrNext('exit')}
                                    className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Quitter
                                </button>
                                <button 
                                    onClick={() => handleExitOrNext('next')}
                                    className="flex-1 py-3 px-4 bg-[#052648] text-white font-bold rounded-xl hover:bg-blue-900 shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02]"
                                >
                                    {evaluationResult.nextAction === 'retry_level' ? 'Réessayer' : 'Cas Suivant'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}