// app/simulation/SimulationContent.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Thermometer, Gauge, Wind, ClipboardCheck } from 'lucide-react';

import FunFactLoader from '@/components/common/FunFactLoader';
import ConsultationView from '@/components/simulation/ConsultationView';
import { useAuth } from '@/contexts/AuthContext';

import { services, exampleExams } from '@/types/simulation/constant';
import { Patient, Service, Message, GameState, ClinicalExam } from '@/types/simulation/types';

import { 
    startSimulationSession, 
    sendSimulationAction, 
    requestSimulationHint, 
    submitSimulationDiagnosis,
    getSessionMessages,
    sendChatMessage,
    StartSessionResponse,
    SubmitResponse,
    ActionRequest,
    SimulationMessage
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

            console.log('📤 [API REQUEST] POST /api/v1/simulation/sessions/start');
            console.log('📦 Payload:', JSON.stringify({ learner_id: user.id, category, force_mode: mode }, null, 2));

            const data: StartSessionResponse = await startSimulationSession(user.id, null, category, mode);
            
            console.log('✅ [API RESPONSE] Session créée');
            console.log('📥 Response:', JSON.stringify(data, null, 2));
            
            setSessionId(data.session_id);
            setSessionMode(mode);
            
            // Configuration selon le mode
            if (mode === 'diagnostic') {
                setMaxInteractions(5);
                setHintsRemaining(999); // Infini
            } else {
                setMaxInteractions(10);
                setHintsRemaining(5); // Limité
            }

            const safePatient = mapBackendToPatient(data);
            setPatientData(safePatient);
            
            const matchedService = services.find(s => 
                s.name.toLowerCase().includes(category.toLowerCase())
            ) || services[0];
            setSelectedService(matchedService);

            setMessages([{
                sender: 'system',
                text: `🎯 Session ${mode === 'diagnostic' ? 'Évaluation Diagnostique' : mode === 'training' ? 'Entraînement' : 'Évaluation'} démarrée.\n📊 ${mode === 'diagnostic' ? '5' : '10'} questions autorisées.\n💡 ${mode === 'diagnostic' ? 'Indices illimités' : '5 indices disponibles'}.`,
                time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})
            }]);

            setCurrentView('consultation');
            toast.success(`Dossier patient ouvert - Mode ${mode}`, { icon: '📂' });

        } catch (error: any) {
            console.error("❌ Critical Init Error:", error);
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

        // Message du docteur (UI immédiat)
        setMessages(prev => [...prev, {
            sender: 'doctor',
            text: currentMsg,
            time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})
        }]);

        // Incrémenter le compteur
        const newCount = interactionsCount + 1;
        setInteractionsCount(newCount);

        try {
            console.group(`💬 [CHAT ${newCount}/${maxInteractions}] Message Apprenant`);
            console.log(`📤 Question: "${currentMsg}"`);
            console.log(`🔗 Session: ${sessionId}`);
            console.log(`⏰ ${new Date().toISOString()}`);
            
            const chatStart = performance.now();
            
            // ENVOI DU MESSAGE VIA L'ENDPOINT CHAT
            console.log(`🚀 [API REQUEST] POST /api/v1/chat/sessions/${sessionId}/messages`);
            const payload = {
                sender: "learner",
                content: currentMsg,
                message_metadata: {}
            };
            console.log('📦 Payload:', JSON.stringify(payload, null, 2));

            await sendChatMessage(sessionId, payload);

            console.log(`✅ Message envoyé (${(performance.now() - chatStart).toFixed(2)}ms)`);

            // RÉCUPÉRATION DES 3 DERNIERS MESSAGES POUR AVOIR LA RÉPONSE
            console.log(`📥 [API REQUEST] GET /api/v1/chat/sessions/${sessionId}/messages?limit=3`);
            
            const fetchStart = performance.now();
            const recentMessages = await getSessionMessages(sessionId, 3);
            
            console.log(`✅ Messages récupérés (${(performance.now() - fetchStart).toFixed(2)}ms)`);
            console.log(`📨 Nombre: ${recentMessages.length}`);
            console.log(`📄 [API RESPONSE] Messages:`, JSON.stringify(recentMessages, null, 2));

            // CHERCHER LE DERNIER MESSAGE DU PATIENT
            const patientMsg = recentMessages
                .reverse()
                .find((m: SimulationMessage) => 
                    m.sender?.toLowerCase() === 'patient'
                );

            if (patientMsg) {
                const responseText = patientMsg.content || "...";
                const feedbackData = patientMsg.message_metadata?.tutor_feedback;

                console.log(`🤖 Message Patient trouvé:`);
                console.log(`   📝 Contenu: "${responseText}"`);
                console.log(`   🎓 Tutor Feedback:`, JSON.stringify(feedbackData, null, 2));

                const newPatientMessage: Message = {
                    sender: 'patient',
                    text: responseText,
                    time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'}),
                    feedback: feedbackData // Objet direct
                };

                setMessages(prev => [...prev, newPatientMessage]);

                console.log(`✅ Message ajouté à l'interface`);
            } else {
                console.warn(`⚠️ Aucun message patient trouvé`);
                console.log(`Senders reçus:`, recentMessages.map((m: any) => m.sender));
                
                setMessages(prev => [...prev, {
                    sender: 'system',
                    text: "⚠️ Le patient semble absent. Vérifiez la connexion.",
                    time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})
                }]);
            }

            const totalTime = (performance.now() - chatStart).toFixed(2);
            console.log(`⏱️ Tour complet: ${totalTime}ms`);
            console.groupEnd();

            // Vérifier si limite atteinte
            if (newCount >= maxInteractions) {
                setTimeout(() => {
                    console.log(`🏁 Limite atteinte (${newCount}/${maxInteractions})`);
                    toast('Dernière question effectuée ! Formulez votre diagnostic.', { icon: '⚠️' });
                    setGameState('diagnosing');
                }, 1500);
            }

        } catch (error) {
            console.error('❌ ERREUR CHAT:', error);
            console.log(`Session: ${sessionId}, Message: ${currentMsg}`);
            console.groupEnd();
            
            toast.error("Erreur de communication avec le patient.");
            setMessages(prev => [...prev, {
                sender: 'system', 
                text: "❌ Erreur de communication.", 
                time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    // Formater les résultats d'examens
    const formatExamResult = (result: any): string => {
        if (!result) return "Résultat non disponible";
        
        if (typeof result.rapport_complet === 'string') {
            return result.rapport_complet;
        }
        
        if (typeof result.rapport_complet === 'object') {
            const params = result.rapport_complet;
            let formatted = "**Constantes mesurées:**\n";
            
            if (params.TA) formatted += `\n• Tension Artérielle: ${params.TA}`;
            if (params.FC) formatted += `\n• Fréquence Cardiaque: ${params.FC}`;
            if (params.FR) formatted += `\n• Fréquence Respiratoire: ${params.FR}`;
            if (params.SpO2) formatted += `\n• Saturation O₂: ${params.SpO2}`;
            if (params.Temp) formatted += `\n• Température: ${params.Temp}`;
            
            if (result.conclusion) {
                formatted += `\n\n**Interprétation:** ${result.conclusion}`;
            }
            
            return formatted;
        }
        
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
        
        return result.conclusion || result.text || "Résultat disponible dans le dossier.";
    };

    const handleMedicalAction = async (
        actionType: 'examen_complementaire' | 'parametres_vitaux' | 'biologie', 
        name: string, 
        justification?: string
    ) => {
        if (!sessionId) return;
        setIsThinking(true);

        console.group(`💉 [ACTION MÉDICALE] ${actionType.toUpperCase()}`);
        console.log(`📋 Examen: ${name}`);
        console.log(`📝 Justification: ${justification || 'N/A'}`);
        console.log(`🔗 Session: ${sessionId}`);

        setMessages(prev => [...prev, {
            sender: 'system',
            text: `⏳ ${name} en cours...`,
            time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'}),
            isAction: true
        }]);

        try {
            const action: ActionRequest = {
                action_type: actionType,
                action_name: name,
                justification: justification,
                content: name
            };

            console.log(`🚀 [API REQUEST] POST /api/v1/simulation/sessions/${sessionId}/actions`);
            console.log(`📦 Payload:`, JSON.stringify(action, null, 2));

            const actionStart = performance.now();
            const response = await sendSimulationAction(sessionId, action);

            console.log(`✅ [API RESPONSE] (${(performance.now() - actionStart).toFixed(2)}ms)`);
            console.log(`📥 Résultat:`, JSON.stringify(response, null, 2));

            const formattedResult = formatExamResult(response.result);
            
            setMessages(prev => [...prev, {
                sender: 'system',
                text: `📋 **${name}**\n\n${formattedResult}`,
                time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'}),
                isAction: true,
                quality: 'good'
            }]);

            console.log(`✅ Résultat affiché`);
            console.groupEnd();

            setModalState(s => ({...s, exam: false}));

        } catch (e) {
            console.error('❌ Erreur action:', e);
            console.groupEnd();
            toast.error("Impossible de réaliser l'examen");
        } finally {
            setIsThinking(false);
        }
    };

    const handleRequestHint = async () => {
        if (hintsRemaining <= 0) return toast.error("Plus d'indices disponibles.");
        if (!sessionId) return;

        console.group(`💡 [INDICE] Demande`);
        console.log(`🔗 Session: ${sessionId}`);
        console.log(`📊 Indices restants: ${hintsRemaining}`);

        const loadToast = toast.loading("Le tuteur réfléchit...");
        
        try {
            console.log(`🚀 [API REQUEST] POST /api/v1/simulation/sessions/${sessionId}/request-hint`);
            
            const hintStart = performance.now();
            const hintRes = await requestSimulationHint(sessionId);
            
            console.log(`✅ [API RESPONSE] (${(performance.now() - hintStart).toFixed(2)}ms)`);
            console.log(`📥 Indice:`, JSON.stringify(hintRes, null, 2));
            
            setHintsRemaining(prev => prev - 1);
            setMessages(prev => [...prev, {
                sender: 'tutor',
                text: hintRes.content || hintRes.hint_text,
                time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})
            }]);
            
            console.log(`📊 Nouveaux indices restants: ${hintsRemaining - 1}`);
            console.groupEnd();
            
            toast.dismiss(loadToast);
            toast.success(`Indice reçu (${hintsRemaining - 1} restants)`);
        } catch(e) {
            console.error('❌ Erreur indice:', e);
            console.groupEnd();
            toast.error("Erreur récupération indice", { id: loadToast });
        }
    };

    // ==========================================
    // 🎓 EVALUATION & FIN
    // ==========================================

    const handleDiagnosisSubmit = async (medications: string, dosage: string) => {
        if (!sessionId) return;
        
        console.group(`🎓 [DIAGNOSTIC FINAL]`);
        console.log(`🔗 Session: ${sessionId}`);
        console.log(`📋 Diagnostic: ${userDiagnosis}`);
        console.log(`💊 Traitement: ${medications}`);
        console.log(`📏 Posologie: ${dosage}`);
        
        const loadToast = toast.loading("Évaluation en cours...");
        
        try {
            setModalState(prev => ({ ...prev, drug: false }));

            console.log(`🚀 [API REQUEST] POST /api/v1/simulation/sessions/${sessionId}/submit`);
            
            const submitPayload = {
                diagnosed_pathology_id: 0,
                details_text: userDiagnosis,
                prescribed_medication_ids: [],
                comment: `Rx: ${medications}. Posologie: ${dosage}`
            };
            
            console.log(`📦 Payload:`, JSON.stringify(submitPayload, null, 2));
            
            const submitStart = performance.now();
            const result: SubmitResponse = await submitSimulationDiagnosis(
                sessionId, 
                userDiagnosis, 
                `Rx: ${medications}. Posologie: ${dosage}`
            );

            console.log(`✅ [API RESPONSE] (${(performance.now() - submitStart).toFixed(2)}ms)`);
            console.log(`📊 Score: ${result.score}/20`);
            console.log(`📥 Évaluation:`, JSON.stringify(result, null, 2));

            setEvaluationResult({
                score: result.score,
                maxScore: 20, 
                feedback: result.feedback_global,
                nextAction: result.next_action
            });

            setGameState('finished');
            setModalState(prev => ({ ...prev, result: true }));
            
            console.groupEnd();
            
            toast.dismiss(loadToast);
            toast.success(`Évaluation: ${result.score}/20`);

        } catch (e) {
            console.error('❌ Erreur soumission:', e);
            console.groupEnd();
            toast.error("Erreur lors de l'évaluation.", { id: loadToast });
        }
    };

    const handleExitOrNext = (action: 'exit' | 'next') => {
        console.log(`🚪 Action: ${action}`);
        
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

            {/* MODAL RÉSULTATS */}
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
                                    Retour Objectifs
                                </button>
                                <button 
                                    onClick={() => handleExitOrNext('next')}
                                    className="flex-1 py-3 px-4 bg-[#052648] text-white font-bold rounded-xl hover:bg-blue-900 shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02]"
                                >
                                    Cas Suivant
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}