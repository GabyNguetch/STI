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

export interface SubmitRequest {
    diagnosed_pathology_id: number;
    details_text?: string;
    prescribed_medication_ids?: number[];
    comment?: string;
}

export interface SubmitResponse {
    session_id: string;
    score: number;
    feedback_global: string;
    evaluation: {
        score_total: number;
        score_diagnostic?: number;
        score_therapeutique?: number;
        score_demarche?: number;
        details: any;
    };
    next_action: 'next_case' | 'retry_level' | 'module_completed';
    recommendation_next_step?: string;
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

// Feedback Tuteur (venant de message_metadata)
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

// ================= ENDPOINTS =================

/**
 * Démarre une nouvelle session de simulation
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

    console.group('🚀 [API] Starting Simulation Session');
    console.log('📤 Request Payload:', JSON.stringify(payload, null, 2));
    console.log('⏰ Timestamp:', new Date().toISOString());

    const start = performance.now();

    try {
        const response = await apiClient<StartSessionResponse>(
            '/simulation/sessions/start',
            {
                method: 'POST',
                body: JSON.stringify(payload)
            }
        );

        const duration = (performance.now() - start).toFixed(2);
        console.log('✅ Session Started Successfully');
        console.log('⏱️ Duration:', duration + 'ms');
        console.log('📥 Response:', JSON.stringify(response, null, 2));
        console.groupEnd();

        return response;
    } catch (error) {
        console.error('❌ Session Start Failed:', error);
        console.groupEnd();
        throw error;
    }
};

/**
 * Récupérer l'historique détaillé pour le Dashboard
 */
export const getLearnerHistoryDetailed = async (learnerId: number): Promise<DetailedHistoryResponse> => {
    const start = performance.now();
    console.group(`📚 [API] Get Learner History - ID: ${learnerId}`);
    
    try {
        const data = await apiClient<DetailedHistoryResponse>(`/simulation/learners/${learnerId}/history`);
        
        const duration = (performance.now() - start).toFixed(2);
        console.log(`✅ Loaded ${data.historique_par_categorie.length} categories in ${duration}ms`);
        console.log('📥 Response:', JSON.stringify(data, null, 2));
        console.groupEnd();
        
        return data;
    } catch (error) {
        console.error('❌ History Load Failed:', error);
        console.groupEnd();
        throw error;
    }
};

/**
 * Envoyer une action (Message, Examen ou Paramètres)
 */
export const sendSimulationAction = async (
    sessionId: string,
    action: ActionRequest
): Promise<ActionResponse> => {
    const start = performance.now();
    console.group(`💬 [API] Simulation Action - ${action.action_type}`);
    console.log('📍 Session ID:', sessionId);
    console.log('📤 Request:', JSON.stringify(action, null, 2));
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    try {
        const response = await apiClient<ActionResponse>(
            `/simulation/sessions/${sessionId}/actions`,
            {
                method: 'POST',
                body: JSON.stringify(action)
            }
        );

        const duration = (performance.now() - start).toFixed(2);
        console.log('✅ Action Completed');
        console.log('⏱️ Duration:', duration + 'ms');
        console.log('📥 Response:', JSON.stringify(response, null, 2));
        console.groupEnd();

        return response;
    } catch (error) {
        console.error('❌ Action Failed:', error);
        console.groupEnd();
        throw error;
    }
};

/**
 * Récupérer les messages d'une session (avec feedback tuteur)
 */
export const getSessionMessages = async (
    sessionId: string,
    limit?: number
): Promise<SimulationMessage[]> => {
    const start = performance.now();
    console.group(`📨 [API] Get Session Messages - ${sessionId}`);
    
    const url = limit 
        ? `/chat/sessions/${sessionId}/messages?limit=${limit}`
        : `/chat/sessions/${sessionId}/messages`;
    
    try {
        const messages = await apiClient<SimulationMessage[]>(url);
        
        const duration = (performance.now() - start).toFixed(2);
        console.log(`✅ Loaded ${messages.length} messages in ${duration}ms`);
        console.log('📥 Messages:', JSON.stringify(messages, null, 2));
        console.groupEnd();
        
        return messages;
    } catch (error) {
        console.error('❌ Messages Load Failed:', error);
        console.groupEnd();
        throw error;
    }
};

/**
 * Demander un indice au tuteur
 */
export const requestSimulationHint = async (sessionId: string): Promise<HintResponse> => {
    const start = performance.now();
    console.group(`💡 [API] Request Hint - ${sessionId}`);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    try {
        const response = await apiClient<HintResponse>(
            `/simulation/sessions/${sessionId}/request-hint`,
            { method: 'POST' }
        );

        const duration = (performance.now() - start).toFixed(2);
        console.log('✅ Hint Received');
        console.log('⏱️ Duration:', duration + 'ms');
        console.log('📥 Response:', JSON.stringify(response, null, 2));
        console.groupEnd();

        return response;
    } catch (error) {
        console.error('❌ Hint Request Failed:', error);
        console.groupEnd();
        throw error;
    }
};

/**
 * Soumettre le diagnostic final
 */
export const submitSimulationDiagnosis = async (
    sessionId: string,
    diagnosisText: string,
    prescriptionText: string
): Promise<SubmitResponse> => {
    console.group('🎓 [API] Submit Final Diagnosis');
    console.log('📍 Session ID:', sessionId);
    console.log('📋 Diagnosis:', diagnosisText);
    console.log('💊 Prescription:', prescriptionText);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    const payload: SubmitRequest = {
        diagnosed_pathology_id: 0,
        details_text: diagnosisText,
        prescribed_medication_ids: [],
        comment: prescriptionText
    };
    
    console.log('📤 Request Payload:', JSON.stringify(payload, null, 2));
    
    const start = performance.now();
    
    try {
        const response = await apiClient<SubmitResponse>(
            `/simulation/sessions/${sessionId}/submit`,
            {
                method: 'POST',
                body: JSON.stringify(payload)
            }
        );
        
        const duration = (performance.now() - start).toFixed(2);
        console.log('✅ Diagnosis Submitted Successfully');
        console.log('⏱️ Duration:', duration + 'ms');
        console.log('📊 Score:', response.score);
        console.log('💬 Feedback:', response.feedback_global);
        console.log('➡️ Next Action:', response.next_action);
        console.log('📥 Full Response:', JSON.stringify(response, null, 2));
        console.groupEnd();
        
        return response;
        
    } catch (error) {
        console.error('❌ Diagnosis Submission Failed:', error);
        console.groupEnd();
        throw error;
    }
};

/**
 * Récupérer le statut de progression (Goals)
 */
export const getLearnerGoalsStatus = async (
    learnerId: number
): Promise<GoalStatus[]> => {
    console.log(`🎯 [API] Get Goals Status - Learner ${learnerId}`);
    
    try {
        // Pour l'instant, fallback mock - à remplacer par vrai endpoint
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
        console.warn('⚠️ Goals API warning:', error);
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