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
    action_type: 'question' | 'examen_complementaire' | 'consulter_image' | 'parametres_vitaux';
    action_name: string;
    content?: string;
    justification?: string;
}

export interface ActionResponse {
    action_type: string;
    action_name: string;
    content?: string;
    result?: {
        rapport?: string;
        conclusion?: string;
        text?: string;
        data?: any;
    };
    feedback?: string;
}

export interface SubmitRequest {
    diagnosed_pathology_id: number;
    details_text: string;
    prescribed_medication_ids?: number[];
    comment?: string;
}

export interface SubmitResponse {
    session_id: string;
    score: number;
    feedback_global: string;
    evaluation: {
        score_total: number;
        details: any;
    };
    next_action: 'next_case' | 'retry_level' | 'module_completed';
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

// ================= ENDPOINTS =================

/**
 * Démarre une nouvelle session de simulation
 * Le backend gère automatiquement la logique de reprise ou création
 */
export const startSimulationSession = async (
    learnerId: number,
    caseId: number | null = null,
    category: string,
    forceMode?: 'diagnostic' | 'training' | 'evaluation'
): Promise<string> => {
    const payload: any = {
        learner_id: learnerId,
        category: category
    };

    if (caseId) payload.case_id = caseId;
    if (forceMode) payload.force_mode = forceMode;

    const response = await apiClient<StartSessionResponse>(
        '/simulation/sessions/start',
        {
            method: 'POST',
            body: JSON.stringify(payload)
        }
    );

    return response.session_id;
};

/**
 * Envoie une action (question ou examen) dans la session
 */
export const sendSimulationAction = async (
    sessionId: string,
    request: ActionRequest
): Promise<ActionResponse> => {
    return await apiClient<ActionResponse>(
        `/simulation/sessions/${sessionId}/actions`,
        {
            method: 'POST',
            body: JSON.stringify(request)
        }
    );
};

/**
 * Demande un indice au tuteur
 */
export const requestSimulationHint = async (
    sessionId: string
): Promise<{ hint_type: string; content: string; remaining_hints: number }> => {
    return await apiClient(
        `/simulation/sessions/${sessionId}/request-hint`,
        {
            method: 'POST',
            body: JSON.stringify({})
        }
    );
};

/**
 * Soumet le diagnostic final et la prescription
 */
export const submitSimulationDiagnosis = async (
    sessionId: string,
    diagnosisText: string,
    prescriptionText: string
): Promise<SubmitResponse> => {
    return await apiClient<SubmitResponse>(
        `/simulation/sessions/${sessionId}/submit`,
        {
            method: 'POST',
            body: JSON.stringify({
                diagnosed_pathology_id: 0,
                details_text: diagnosisText,
                comment: prescriptionText
            })
        }
    );
};

/**
 * Récupère le statut de progression pour toutes les catégories
 */
export const getLearnerGoalsStatus = async (
    learnerId: number
): Promise<GoalStatus[]> => {
    try {
        return await apiClient<GoalStatus[]>(
            `/learners/${learnerId}/goals_status`
        );
    } catch (error) {
        console.warn('Goals API not available, using mock data');
        // Fallback en attendant l'implémentation backend
        return [];
    }
};

/**
 * Récupère les détails d'une session spécifique
 */
export const getSessionDetails = async (sessionId: string) => {
    return await apiClient(`/simulation/sessions/${sessionId}`);
};

/**
 * Récupère l'historique des messages d'une session
 */
export const getSessionMessages = async (sessionId: string) => {
    return await apiClient(`/chat/sessions/${sessionId}/messages`);
};