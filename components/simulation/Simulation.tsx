'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Thermometer, Gauge, Wind, Lightbulb } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { services } from '@/types/simulation/constant';
import { PROFANITY_LIST } from '@/types/simulation/grosmot';
import { Patient, Service, Message, GameState } from '@/types/simulation/types';
import { exampleExams } from '@/types/simulation/constant';

import {
    startSimulationSession,
    sendSimulationAction,
    requestSimulationHint,
    submitSimulationDiagnosis
} from '@/services/SimulationService';
import { getClinicalCaseById } from '@/services/expertService';
import {
    sendMessageToRAG,
    analyzeQuestionQuality,
    requestHintFromTutor,
    requestExamResult,
    evaluateDiagnosis
} from '@/services/ChatService';

import HomeView from '@/components/simulation/HomeView';
import ConsultationView from '@/components/simulation/ConsultationView';

// ========== UTILITAIRE DE MAPPING ==========
const mapPatientToUI = (data: any): Patient => {
    const pClinique = data.presentation_clinique || {};
    const dPara = data.donnees_paracliniques || {};

    let signes = 'Non spécifiés';
    if (dPara.signes_vitaux) {
        if (typeof dPara.signes_vitaux === 'object') {
            signes = Object.entries(dPara.signes_vitaux)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ');
        } else {
            signes = String(dPara.signes_vitaux);
        }
    }

    return {
        nom: data.code_fultang || `Patient #${data.id}`,
        age: Math.floor(Math.random() * (60 - 20) + 20),
        sexe: 'Masculin',
        motif: pClinique.histoire_maladie?.substring(0, 80) + '...' || 'Motif inconnu',
        antecedents:
            (typeof pClinique.antecedents === 'string'
                ? pClinique.antecedents
                : pClinique.antecedents?.details) || 'Non précisés',
        symptomes: 'À découvrir',
        histoireMaladie: pClinique.histoire_maladie || '',
        signesVitaux: signes,
        temperature: '37°C',
        pressionArterielle: '120/80',
        saturationOxygene: '98%',
        examenClinique: dPara.examen_clinique || '',
        analyseBiologique: JSON.stringify(dPara.labo || ''),
        diagnostic: data.pathologie_principale?.nom_fr || 'Inconnu',
        traitementAttendu: 'Selon recommandations en vigueur'
    };
};

// ========== COMPOSANT PRINCIPAL ==========
const SimulationContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoading: isAuthLoading } = useAuth();

    // Navigation
    const [currentView, setCurrentView] = useState<'home' | 'loading' | 'consultation'>('home');
    const hasInitialized = useRef(false);

    // Session
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [caseId, setCaseId] = useState<number | null>(null);
    const [sessionType, setSessionType] = useState<'diagnostic' | 'training' | 'evaluation'>(
        'training'
    );
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [patientData, setPatientData] = useState<Patient | null>(null);

    // Game State
    const [gameState, setGameState] = useState<GameState>('asking');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [questionsCount, setQuestionsCount] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [isTyping, setIsTyping] = useState(false);

    // Modales
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState<any>(null);
    const [isDrugModalOpen, setIsDrugModalOpen] = useState(false);
    const [userDiagnosis, setUserDiagnosis] = useState('');
    const [finalResult, setFinalResult] = useState<any>(null);
    const [showResultModal, setShowResultModal] = useState(false);

    // Constantes (dynamiques selon le type de session)
    const [maxHints, setMaxHints] = useState(3);
    const [maxQuestions, setMaxQuestions] = useState(10);

    // ========== PROTECTION ROUTE ==========
    useEffect(() => {
        if (!isAuthLoading && !user) {
            if (currentView !== 'home') toast.error('Connexion requise');
            router.push('/connexion');
        }
    }, [user, isAuthLoading, router, currentView]);

    // ========== DÉMARRAGE VIA URL ==========
    useEffect(() => {
        const category = searchParams.get('category');
        const mode = searchParams.get('mode') as 'diagnostic' | 'training' | 'evaluation' | null;

        if (category && user && !hasInitialized.current) {
            hasInitialized.current = true;
            startSessionFlow(category, mode || 'training');
        }
    }, [searchParams, user]);

    // ========== LOGIQUE DÉMARRAGE SESSION ==========
    const startSessionFlow = async (
        category: string,
        mode: 'diagnostic' | 'training' | 'evaluation'
    ) => {
        if (!user?.id) return;
        setCurrentView('loading');

        const loadingToast = toast.loading('Connexion au système expert...');

        try {
            // Appel API pour démarrer la session
            const sessionUuid = await startSimulationSession(
                user.id,
                null, // caseId géré par le backend
                category,
                mode
            );

            setSessionId(sessionUuid);
            setSessionType(mode);

            // IMPORTANT: Récupérer le vrai cas du backend ou utiliser un mock
            // Pour l'instant on utilise un ID fixe pour tester
            const testCaseId = 1040; // Remplacer par la vraie logique
            setCaseId(testCaseId);

            console.log('✅ Session started:', { sessionUuid, caseId: testCaseId, mode });

            // Configuration des limites selon le type
            if (mode === 'diagnostic') {
                setMaxQuestions(5);
                setMaxHints(0); // Pas d'indices en diagnostic
            } else if (mode === 'training') {
                setMaxQuestions(10);
                setMaxHints(5); // 5 indices en formation
            } else {
                setMaxQuestions(10);
                setMaxHints(3); // 3 indices en évaluation
            }

            // Charger les détails du cas (via votre service expert)
            // Note: Idéalement le backend /start devrait retourner clinical_case complet
            // Pour l'instant on simule avec un cas par défaut
            const mockCaseData = {
                id: 1040,
                code_fultang: 'CAS-001',
                presentation_clinique: {
                    histoire_maladie: `Patient présentant des symptômes nécessitant une évaluation ${category}.`
                },
                donnees_paracliniques: {},
                pathologie_principale: { nom_fr: 'À diagnostiquer', categorie: category }
            };

            const uiData = mapPatientToUI(mockCaseData);
            setPatientData(uiData);

            const visualService =
                services.find(
                    (s) =>
                        s.name.toLowerCase().includes(category.toLowerCase()) ||
                        category.toLowerCase().includes(s.id)
                ) || services[0];
            setSelectedService(visualService);

            // Message initial selon le mode
            let welcomeMsg = `Session ${
                mode === 'diagnostic'
                    ? 'de Test'
                    : mode === 'training'
                    ? "d'Entraînement"
                    : "d'Évaluation"
            } démarrée en ${category}.`;

            if (mode === 'training') {
                welcomeMsg +=
                    ' Vos questions seront commentées par le tuteur (vert = bon, jaune = attention, rouge = mauvais).';
            } else if (mode === 'evaluation') {
                welcomeMsg +=
                    ' Seules vos 3 premières questions seront commentées. Bonne chance !';
            }

            setMessages([
                {
                    sender: 'system',
                    text: welcomeMsg,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);

            setQuestionsCount(0);
            setGameState('asking');
            setCurrentView('consultation');
            toast.dismiss(loadingToast);
            toast.success('Session prête !');
        } catch (err: any) {
            console.error('❌ Erreur Start Session:', err);
            let errorMsg = 'Erreur technique.';
            try {
                if (err.message && err.message.startsWith('{')) {
                    const jsonErr = JSON.parse(err.message);
                    if (jsonErr.detail) errorMsg = JSON.stringify(jsonErr.detail);
                } else {
                    errorMsg = err.message;
                }
            } catch {
                errorMsg = 'Impossible de démarrer la session.';
            }

            toast.error(errorMsg, { id: loadingToast, duration: 4000 });
            setCurrentView('home');
            hasInitialized.current = false;
        }
    };

    // ========== INTERACTION UTILISATEUR ==========
    const handleLearnerAction = async (
        content: string,
        type: 'question' | 'exam' = 'question'
    ) => {
        // Mapper 'exam' vers le type approprié
        const actionType = type === 'exam' ? 'examen_complementaire' : 'question';
        return handleLearnerActionWithType(content, actionType);
    };

    // ========== DEMANDE INDICE ==========
    const requestHint = async () => {
        if (!sessionId || !caseId || !user) return;
        if (sessionType === 'diagnostic') {
            return toast.error("Pas d'indices en mode diagnostic.");
        }
        if (hintsUsed >= maxHints) {
            return toast.error("Quota d'indices épuisé.");
        }

        const tid = toast.loading('Demande au tuteur...');
        
        console.log('💡 [HINT REQUEST]', { caseId, userId: user.id, hintsUsed, maxHints });

        try {
            const hintContent = await requestHintFromTutor(
                caseId,
                user.id.toString(),
                messages.map(m => ({
                    sender: m.sender,
                    text: m.text,
                    time: m.time
                }))
            );

            setMessages((prev) => [
                ...prev,
                {
                    sender: 'tutor',
                    text: hintContent,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    icon: Lightbulb
                }
            ]);
            
            setHintsUsed((prev) => prev + 1);
            toast.success('Indice reçu !', { id: tid });
            
            console.log('✅ Hint delivered:', hintContent);

        } catch (error: any) {
            console.error('❌ Hint error:', error);
            toast.error('Service indisponible.', { id: tid });
        }
    };

    // ========== SOUMISSION FINALE ==========
    const submitFinal = async (treatmentString: string) => {
        if (!sessionId || !userDiagnosis.trim() || !caseId || !user) {
            return toast.error('Diagnostic requis.');
        }

        const tid = toast.loading('Analyse finale en cours...');
        setIsDrugModalOpen(false);

        console.log('📊 [FINAL SUBMISSION]', {
            caseId,
            sessionId,
            diagnosis: userDiagnosis,
            prescription: treatmentString
        });

        try {
            // Utiliser le service RAG pour l'évaluation
            const evaluationResult = await evaluateDiagnosis(
                caseId,
                user.id.toString(),
                messages.map(m => ({
                    sender: m.sender,
                    text: m.text,
                    time: m.time
                })),
                userDiagnosis,
                treatmentString
            );

            console.log('✅ Evaluation received:', evaluationResult);

            // Adapter le format de la réponse
            const formattedResult = {
                score: evaluationResult.score || evaluationResult.note_totale || 0,
                feedback_global: evaluationResult.feedback || evaluationResult.feedback_general || 'Évaluation terminée.',
                evaluation: evaluationResult.evaluation || evaluationResult,
                next_action: 'next_case' as const
            };

            setFinalResult(formattedResult);
            setGameState('finished');
            setShowResultModal(true);
            toast.success('Terminé !', { id: tid });

        } catch (error: any) {
            console.error('❌ Submission error:', error);
            toast.error('Erreur de soumission: ' + error.message, { id: tid });
        }
    };

    // ========== HANDLERS UI ==========
    const handleChatSubmit = (txt: string) => {
        if (PROFANITY_LIST.some((bw) => txt.toLowerCase().includes(bw))) {
            setMessages((p) => [
                ...p,
                { sender: 'system', text: '🚫 Langage inapproprié.', time: '', quality: 'bad' }
            ]);
            return;
        }
        handleLearnerActionWithType(txt, 'question');
    };

    const handleManualServiceSelect = () => {
        toast('Veuillez passer par la bibliothèque pour choisir un cas.', { icon: '📚' });
        router.push('/dashboard');
    };

    const handlePrescribeConfirm = (examName: string, justification: string) => {
        // Déterminer le type d'examen
        let actionType: 'examen_complementaire' | 'consulter_image' | 'parametres_vitaux' = 'examen_complementaire';
        
        const examLower = examName.toLowerCase();
        if (examLower.includes('radio') || examLower.includes('scanner') || examLower.includes('irm') || examLower.includes('echo')) {
            actionType = 'consulter_image';
        } else if (examLower.includes('tension') || examLower.includes('température') || examLower.includes('saturation')) {
            actionType = 'parametres_vitaux';
        }
        
        handleLearnerActionWithType(`Examen: ${examName}. Justification: ${justification}`, actionType);
        setIsExamModalOpen(false);
    };

    const handleQuickTool = (tool: any) => {
        handleLearnerActionWithType(`Prise de mesure : ${tool.name}`, 'parametres_vitaux');
    };

    // Nouvelle fonction pour gérer les types d'action spécifiques
    const handleLearnerActionWithType = async (
        content: string,
        actionType: 'question' | 'examen_complementaire' | 'consulter_image' | 'parametres_vitaux'
    ) => {
        if (!sessionId || isTyping || !caseId) return;

        console.log('🎯 [LEARNER ACTION]', { actionType, content, caseId, sessionId });

        const uiMsg: Message = {
            sender: 'doctor',
            text: content,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAction: actionType !== 'question'
        };
        setMessages((prev) => [...prev, uiMsg]);
        setIsTyping(true);

        if (actionType === 'question') setQuestionsCount((c) => c + 1);

        try {
            let patientResponse = '';
            let feedbackText: string | undefined;
            let feedbackQuality: 'good' | 'warning' | 'bad' | undefined;

            // === TRAITEMENT SELON LE TYPE ===
            if (actionType === 'question') {
                // 1. Envoyer au RAG pour obtenir la réponse du patient
                console.log('💬 Sending question to RAG...');
                patientResponse = await sendMessageToRAG(caseId, content);

                // 2. Si mode training ou début d'évaluation, analyser la qualité
                const shouldAnalyze = 
                    sessionType === 'training' || 
                    (sessionType === 'evaluation' && questionsCount < 3);

                if (shouldAnalyze) {
                    console.log('🎓 Analyzing question quality...');
                    const analysis = await analyzeQuestionQuality(
                        caseId,
                        content,
                        messages.map(m => ({
                            sender: m.sender,
                            text: m.text,
                            time: m.time
                        }))
                    );

                    feedbackText = analysis.justification;
                    feedbackQuality = analysis.status === 'good' ? 'good' : 
                                     analysis.status === 'warning' ? 'warning' : 'bad';
                    
                    console.log('✅ Analysis result:', { status: analysis.status, feedback: feedbackText });
                }

            } else {
                // Pour les examens (imagerie, bio, constantes)
                console.log('🔬 Requesting exam result...');
                patientResponse = await requestExamResult(caseId, content, content);
            }

            // === AFFICHAGE DE LA RÉPONSE ===
            const botMsg: Message = {
                sender: 'patient',
                text: patientResponse,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                feedback: feedbackText,
                quality: feedbackQuality
            };

            console.log('📨 Adding bot message:', botMsg);
            setMessages((prev) => [...prev, botMsg]);

        } catch (error: any) {
            console.error('❌ [LEARNER ACTION ERROR]', error);
            toast.error('Erreur: ' + error.message);
            
            setMessages((prev) => [
                ...prev,
                {
                    sender: 'system',
                    text: `⚠️ Erreur: ${error.message}`,
                    time: '',
                    quality: 'bad'
                }
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleNextCase = () => {
        setSessionId(null);
        hasInitialized.current = false;
        setShowResultModal(false);
        router.push('/dashboard');
    };

    // ========== RENDU ==========
    return (
        <div className="min-h-screen bg-[#052648] relative font-sans text-slate-800">
            <style jsx global>{`
                :root {
                    --color-primary: #052648;
                }
                .bg-primary {
                    background-color: var(--color-primary);
                }
                .text-primary {
                    color: var(--color-primary);
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
            `}</style>

            <main className="flex-1 h-[calc(100vh-0px)] flex items-center justify-center p-4">
                {currentView === 'loading' && (
                    <div className="flex flex-col items-center animate-pulse text-white">
                        <div className="w-16 h-16 border-4 border-white/20 border-t-emerald-400 rounded-full animate-spin mb-6"></div>
                        <span className="font-light text-xl tracking-wide">
                            Chargement du Patient...
                        </span>
                    </div>
                )}

                {currentView === 'home' && (
                    <HomeView
                        difficulty="Débutant"
                        onDifficultyChange={() => {}}
                        onServiceSelect={handleManualServiceSelect}
                        onRandomCase={() => router.push('/dashboard')}
                    />
                )}

                {currentView === 'consultation' && selectedService && patientData && (
                    <ConsultationView
                        patientData={patientData}
                        selectedService={selectedService}
                        messages={messages}
                        inputMessage={inputMessage}
                        onInputChange={setInputMessage}
                        onSendMessage={() => {
                            handleChatSubmit(inputMessage);
                            setInputMessage('');
                        }}
                        isTyping={isTyping}
                        gameState={gameState}
                        messageCount={questionsCount}
                        MAX_QUESTIONS={maxQuestions}
                        remainingHints={maxHints - hintsUsed}
                        onRequestHint={requestHint}
                        clinicalExams={exampleExams}
                        diagnosticTools={[
                            { name: 'Température', icon: Thermometer },
                            { name: 'Tension', icon: Gauge },
                            { name: 'SpO2', icon: Wind }
                        ]}
                        onToolClick={handleQuickTool}
                        isExamModalOpen={isExamModalOpen}
                        selectedExam={selectedExam}
                        onExamClick={(exam) => {
                            setSelectedExam(exam);
                            setIsExamModalOpen(true);
                        }}
                        onCloseExamModal={() => setIsExamModalOpen(false)}
                        onPrescribeExam={(exam) => setSelectedExam(exam)}
                        onPrescribe={handlePrescribeConfirm}
                        userDiagnosis={userDiagnosis}
                        setUserDiagnosis={setUserDiagnosis}
                        onTriggerDiagnosis={() => setGameState('diagnosing')}
                        onConfirmDiagnosis={() => {
                            if (!userDiagnosis.trim()) return toast.error('Le diagnostic est vide.');
                            setGameState('treating');
                            setIsDrugModalOpen(true);
                        }}
                        isDrugModalOpen={isDrugModalOpen}
                        onOpenDrugModal={() => setIsDrugModalOpen(true)}
                        onCloseDrugModal={() => setIsDrugModalOpen(false)}
                        onFinalPrescription={(med, dose) => submitFinal(`${med} ${dose}`)}
                        isGameOver={gameState === 'finished'}
                        onReset={() => router.push('/dashboard')}
                    />
                )}
            </main>

            {showResultModal && finalResult && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
                        <div
                            className={`h-3 w-full ${
                                finalResult.score >= 12 ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                        />

                        <div className="p-8 overflow-y-auto">
                            <div className="text-center mb-8">
                                <div
                                    className={`inline-flex items-center justify-center w-28 h-28 rounded-full border-8 mb-4 ${
                                        finalResult.score >= 12
                                            ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                                            : 'border-red-100 bg-red-50 text-red-600'
                                    }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <span className="text-5xl font-extrabold">
                                            {finalResult.score}
                                        </span>
                                        <span className="text-xs text-gray-400 font-bold uppercase mt-1">
                                            / 20
                                        </span>
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800">
                                    {finalResult.score >= 12 ? 'Session Validée' : 'Session Échouée'}
                                </h2>
                                <p className="text-slate-500 text-sm mt-1">Évaluation Automatique</p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-left mb-6">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-2">
                                    Feedback Tuteur
                                </p>
                                <p className="text-sm text-slate-800 leading-relaxed italic">
                                    {finalResult.feedback_global}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 border-t bg-slate-100 flex justify-between items-center shrink-0">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="text-slate-500 hover:text-primary font-bold text-sm"
                            >
                                Menu
                            </button>
                            <button
                                onClick={handleNextCase}
                                className="bg-[#052648] hover:bg-blue-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
                            >
                                Continuer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimulationContent;