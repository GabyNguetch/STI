// services/SimulationService.ts
import { apiClient } from '@/lib/apiClient';

// ================= TYPES API BACKEND =================

export interface StartSessionResponse {
    session_id: string;
    session_type: 'diagnostic' | 'training' | 'evaluation';
    current_step: number;
    total_steps: number;
    hints_allowed: number;
    max_messages: number;
    clinical_case: {
        id: number;
        code_fultang: string;
        presentation_clinique: any;
        donnees_paracliniques: any;
        pathologie_principale: any;
    };
}

export interface ActionRequest {
    action_type: 'question' | 'examen_complementaire' | 'consulter_image' | 'parametres_vitaux' | 'biologie';
    action_name: string;
    content?: string;
    justification?: string;
    parameters?: any;
}

export interface ActionResponse {
    action_type: string;
    action_name: string;
    content?: string;
    result?: {
        type_resultat?: string;
        rapport_complet?: string;
        conclusion?: string;
        valeurs_cles?: any;
        text?: string;
        data?: any;
    };
    feedback?: string;
    meta?: {
        virtual_cost?: number;
        virtual_duration?: number;
        impact_score?: number | null;
    };
    timestamp?: string;
}


// ✅ INTERFACE CONFORME API v1 - UNIQUEMENT CES 3 CHAMPS
export interface SubmitRequest {
    diagnosed_pathology_text: string;      // REQUIS
    prescribed_treatment_text: string;     // REQUIS
    final_justification?: string;          // OPTIONNEL
}

// ✅ RESPONSE ATTENDUE
export interface SubmitResponse {
    evaluation: {
        score_diagnostic: number;       // /10
        score_therapeutique: number;    // /5
        score_demarche: number;         // /5
        score_total: number;            // /20
        details?: any;
    };
    feedback_global: string;
    recommendation_next_step: string;
    session_duration_seconds: number;
    virtual_cost_total: number;
}
export interface GoalStatus {
    category: string;
    level_name: string;
    phase: 'diagnostic' | 'training' | 'evaluation';
    cas_completed: number;
    total_cases_phase: number;
    score_avg: number;
    locked: boolean;
}

// Feedback Tuteur
export interface TutorFeedback {
    chronology_check?: string;
    interpretation_guide?: string;
    better_question?: string;
    general?: string;
}

export interface SimulationMessage {
    id: number;
    sender: 'learner' | 'patient' | 'system' | 'tutor' | 'Patient' | 'Learner';
    content: string;
    timestamp: string;
    message_metadata?: {
        tutor_feedback?: TutorFeedback;
        latencies?: any;
        is_action?: boolean;
        generated_by?: string;
    };
}

export interface SessionHistoryCategory {
    categorie: string;
    moyenne_categorie: number;
    progression_percentage?: number;
    sessions: Array<{
        session_id: string;
        date: string;
        etat: string;
        note: number;
        cas_titre: string;
    }>;
}

export interface DetailedHistoryResponse {
    learner_id: number;
    historique_par_categorie: SessionHistoryCategory[];
}

export interface HintResponse {
    hint_text: string;
    content: string;
    hints_remaining: number;
}

export interface ChatMessagePayload {
    sender: "learner";
    content: string;
    message_metadata?: Record<string, any>;
}

// ================= ENDPOINTS =================

/**
 * Démarre une nouvelle session
 */
export const startSimulationSession = async (
    learnerId: number,
    caseId: number | null = null,
    category: string,
    forceMode?: 'diagnostic' | 'training' | 'evaluation'
): Promise<StartSessionResponse> => {
    const payload: any = {
        learner_id: learnerId,
        category: category
    };

    if (caseId) payload.case_id = caseId;
    if (forceMode) payload.force_mode = forceMode;

    console.group('🚀 [API] Starting Session');
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));
    console.log('⏰', new Date().toISOString());

    const start = performance.now();

    try {
        const response = await apiClient<StartSessionResponse>(
            '/simulation/sessions/start',
            {
                method: 'POST',
                body: JSON.stringify(payload)
            }
        );

        console.log(`✅ Success (${(performance.now() - start).toFixed(2)}ms)`);
        console.log('📥 Response:', JSON.stringify(response, null, 2));
        console.groupEnd();

        return response;
    } catch (error) {
        console.error('❌ Failed:', error);
        console.groupEnd();
        throw error;
    }
};

/**
 * Envoyer un message dans le chat (NOUVELLE FONCTION)
 */
export const sendChatMessage = async (
    sessionId: string,
    payload: ChatMessagePayload
): Promise<SimulationMessage> => {
    console.group('💬 [API] Send Chat Message');
    console.log('📍 Session:', sessionId);
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));
    console.log('⏰', new Date().toISOString());

    const start = performance.now();

    try {
        const response = await apiClient<SimulationMessage>(
            `/chat/sessions/${sessionId}/messages`,
            {
                method: 'POST',
                body: JSON.stringify(payload)
            }
        );

        console.log(`✅ Success (${(performance.now() - start).toFixed(2)}ms)`);
        console.log('📥 Response:', JSON.stringify(response, null, 2));
        console.groupEnd();

        return response;
    } catch (error) {
        console.error('❌ Failed:', error);
        console.groupEnd();
        throw error;
    }
};

/**
 * Récupérer l'historique détaillé
 */
export const getLearnerHistoryDetailed = async (learnerId: number): Promise<DetailedHistoryResponse> => {
    const start = performance.now();
    console.group(`📚 [API] Get History - Learner ${learnerId}`);
    
    try {
        const data = await apiClient<DetailedHistoryResponse>(`/simulation/learners/${learnerId}/history`);
        
        console.log(`✅ Success (${(performance.now() - start).toFixed(2)}ms)`);
        console.log('📥 Response:', JSON.stringify(data, null, 2));
        console.groupEnd();
        
        return data;
    } catch (error) {
        console.error('❌ Failed:', error);
        console.groupEnd();
        throw error;
    }
};

/**
 * Envoyer une action (Examen, Paramètres)
 */
export const sendSimulationAction = async (
    sessionId: string,
    action: ActionRequest
): Promise<ActionResponse> => {
    const start = performance.now();
    console.group(`💉 [API] Action - ${action.action_type}`);
    console.log('📍 Session:', sessionId);
    console.log('📤 Request:', JSON.stringify(action, null, 2));
    console.log('⏰', new Date().toISOString());
    
    try {
        const response = await apiClient<ActionResponse>(
            `/simulation/sessions/${sessionId}/actions`,
            {
                method: 'POST',
                body: JSON.stringify(action)
            }
        );

        console.log(`✅ Success (${(performance.now() - start).toFixed(2)}ms)`);
        console.log('📥 Response:', JSON.stringify(response, null, 2));
        console.groupEnd();

        return response;
    } catch (error) {
        console.error('❌ Failed:', error);
        console.groupEnd();
        throw error;
    }
};

/**
 * Récupérer les messages d'une session
 */
export const getSessionMessages = async (
    sessionId: string,
    limit?: number
): Promise<SimulationMessage[]> => {
    const start = performance.now();
    console.group(`📨 [API] Get Messages - ${sessionId}`);
    
    const url = limit 
        ? `/chat/sessions/${sessionId}/messages?limit=${limit}`
        : `/chat/sessions/${sessionId}/messages`;
    
    console.log('📍 URL:', url);
    
    try {
        const messages = await apiClient<SimulationMessage[]>(url);
        
        console.log(`✅ Success (${(performance.now() - start).toFixed(2)}ms)`);
        console.log(`📨 Count: ${messages.length}`);
        console.log('📥 Messages:', JSON.stringify(messages, null, 2));
        console.groupEnd();
        
        return messages;
    } catch (error) {
        console.error('❌ Failed:', error);
        console.groupEnd();
        throw error;
    }
};

/**
 * Demander un indice
 */
export const requestSimulationHint = async (sessionId: string): Promise<HintResponse> => {
    const start = performance.now();
    console.group(`💡 [API] Request Hint - ${sessionId}`);
    console.log('⏰', new Date().toISOString());
    
    try {
        const response = await apiClient<HintResponse>(
            `/simulation/sessions/${sessionId}/request-hint`,
            { method: 'POST' }
        );

        console.log(`✅ Success (${(performance.now() - start).toFixed(2)}ms)`);
        console.log('📥 Response:', JSON.stringify(response, null, 2));
        console.groupEnd();

        return response;
    } catch (error) {
        console.error('❌ Failed:', error);
        console.groupEnd();
        throw error;
    }
};

/**
 * ✅ FONCTION CORRIGÉE - Soumettre le diagnostic final
 */
export const submitSimulationDiagnosis = async (
    sessionId: string,
    diagnosisText: string,
    prescriptionText: string,
    justification?: string
): Promise<SubmitResponse> => {
    console.group('🎓 [API] Submit Diagnosis');
    console.log('📍 Session:', sessionId);
    console.log('📋 Diagnostic:', diagnosisText);
    console.log('💊 Prescription:', prescriptionText);
    console.log('📝 Justification:', justification || 'N/A');
    console.log('⏰', new Date().toISOString());
    
    // ✅ PAYLOAD STRICT - SEULEMENT CES 3 CHAMPS
    const payload: SubmitRequest = {
        diagnosed_pathology_text: diagnosisText,
        prescribed_treatment_text: prescriptionText,
        final_justification: justification
    };
    
    console.log('📤 Payload envoyé:', JSON.stringify(payload, null, 2));
    console.log('⚠️ VERIFICATION: Le payload ne contient que diagnosed_pathology_text, prescribed_treatment_text, final_justification');
    
    const start = performance.now();
    
    try {
        const response = await apiClient<SubmitResponse>(
            `/simulation/sessions/${sessionId}/submit`,
            {
                method: 'POST',
                body: JSON.stringify(payload)
            }
        );
        
        console.log(`✅ Success (${(performance.now() - start).toFixed(2)}ms)`);
        console.log('📊 Score Total:', response.evaluation.score_total, '/20');
        console.log('   - Diagnostic:', response.evaluation.score_diagnostic, '/10');
        console.log('   - Thérapeutique:', response.evaluation.score_therapeutique, '/5');
        console.log('   - Démarche:', response.evaluation.score_demarche, '/5');
        console.log('💬 Feedback:', response.feedback_global);
        console.log('➡️ Recommandation:', response.recommendation_next_step);
        console.log('📥 Response complète:', JSON.stringify(response, null, 2));
        console.groupEnd();
        
        return response;
        
    } catch (error: any) {
        console.error('❌ Submit Failed:', error);
        console.error('❌ Error details:', error.message);
        console.groupEnd();
        throw error;
    }
};

/**
 * Récupérer le statut de progression
 */
export const getLearnerGoalsStatus = async (
    learnerId: number
): Promise<GoalStatus[]> => {
    console.log(`🎯 [API] Get Goals - Learner ${learnerId}`);
    
    try {
        // Mock temporaire - remplacer par vrai endpoint
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    { category: 'Cardiologie', phase: 'diagnostic', cas_completed: 0, total_cases_phase: 1, score_avg: 0, locked: false, level_name: 'Novice' },
                    { category: 'Pneumologie', phase: 'training', cas_completed: 1, total_cases_phase: 3, score_avg: 14, locked: true, level_name: 'Apprenti' },
                    { category: 'Neurologie', phase: 'diagnostic', cas_completed: 0, total_cases_phase: 1, score_avg: 0, locked: false, level_name: 'Novice' },
                ]);
            }, 500);
        });
    } catch (error) {
        console.warn('⚠️ Goals warning:', error);
        return [];
    }
};

/**
 * Récupérer les détails d'une session
 */
export const getSessionDetails = async (sessionId: string) => {
    console.log(`📄 [API] Get Session Details - ${sessionId}`);
    return await apiClient(`/simulation/sessions/${sessionId}`);
};





