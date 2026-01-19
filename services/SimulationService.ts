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
 * ✅ FIXÉ: Démarre une nouvelle session de simulation
 * Retourne maintenant l'objet complet au lieu de juste l'ID
 */
export const startSimulationSession = async (
    learnerId: number,
    caseId: number | null = null,
    category: string,
    forceMode?: 'diagnostic' | 'training' | 'evaluation'
): Promise<StartSessionResponse> => {  // ✅ Type de retour corrigé
    const payload: any = {
        learner_id: learnerId,
        category: category
    };

    if (caseId) payload.case_id = caseId;
    if (forceMode) payload.force_mode = forceMode;

    console.log('📤 [API] Starting session with payload:', payload);

    const response = await apiClient<StartSessionResponse>(
        '/simulation/sessions/start',
        {
            method: 'POST',
            body: JSON.stringify(payload)
        }
    );

    console.log('📥 [API] Session started, response:', response);

    // ✅ Retourne l'objet complet
    return response;
};

export const sendSimulationAction = async (
    sessionId: string,
    request: ActionRequest
): Promise<ActionResponse> => {
    const chatMessage = {
        sender: 'learner',
        content: request.content || request.action_name,
        message_metadata: {
            action_type: request.action_type,
            action_name: request.action_name,
            justification: request.justification
        }
    };

    console.log('📤 [API] Sending message:', chatMessage);

    // 1. Envoyer le message user
    const response = await apiClient<any>(
        `/chat/sessions/${sessionId}/messages`,
        { method: 'POST', body: JSON.stringify(chatMessage) }
    );

    const userId = response.id;
    console.log('📥 [API] User message ID:', userId);

    // 2. Attendre la réponse (ajuster selon votre backend)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // 3. Récupérer l'historique
    const historyResponse = await apiClient<any>(
        `/chat/sessions/${sessionId}/messages?limit=20`
    );

    const messages = Array.isArray(historyResponse) 
        ? historyResponse 
        : (historyResponse.messages || []);
    
    console.log('📚 [API] Messages in history:', messages.length);

    // 4. ✅ Trouver la réponse du Patient (insensible à la casse)
    const patientResponse = messages
        .filter((msg: any) => {
            const isAfterUserMessage = msg.id > userId;
            const senderLower = (msg.sender || '').toLowerCase();
            const isPatientOrTutor = senderLower === 'patient' || 
                                     senderLower === 'tutor' || 
                                     senderLower === 'system';
            return isAfterUserMessage && isPatientOrTutor;
        })
        .sort((a: any, b: any) => a.id - b.id)[0]; // Prendre le premier après userId

    console.log('🤖 [API] Patient response found:', patientResponse);

    const finalContent = patientResponse?.content || 
                        "Le patient tarde à répondre...";

    return {
        action_type: request.action_type,
        action_name: request.action_name,
        content: finalContent,
        result: {
            text: finalContent,
            data: patientResponse?.message_metadata || {}
        },
        feedback: patientResponse?.message_metadata?.feedback
    };
};

/**
 * 3. Demande un indice
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
 * 4. Soumet le diagnostic final
 */
export const submitSimulationDiagnosis = async (
    sessionId: string,
    diagnosisText: string,
    prescriptionText: string
): Promise<SubmitResponse> => {
    
    console.group('🎓 [EVALUATION] Submit Final Diagnosis');
    
    const route = `/simulation/sessions/${sessionId}/submit`;
    const fullUrl = `/api/backend${route}`;
    
    // ✅ Payload selon la spec de votre API
    const payload = {
        diagnosed_pathology_id: 0,
        prescribed_medication_ids: [] // Vide pour l'instant
        // Note: details_text et comment ne sont pas dans la spec API
        // mais on peut les ajouter si votre backend les accepte
    };
    
    console.log('📍 Route:', route);
    console.log('🌐 Full URL:', fullUrl);
    console.log('📤 Request Payload:', JSON.stringify(payload, null, 2));
    console.log('📋 Diagnosis Text:', diagnosisText);
    console.log('💊 Prescription Text:', prescriptionText);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    try {
        const response = await apiClient<SubmitResponse>(
            route,
            {
                method: 'POST',
                body: JSON.stringify(payload)
            }
        );
        
        console.log('✅ Backend Response:', response);
        console.log('📊 Evaluation Scores:', {
            diagnostic: response.evaluation?.score_diagnostic,
            therapeutique: response.evaluation?.score_therapeutique,
            demarche: response.evaluation?.score_demarche,
            total: response.evaluation?.score_total || response.score
        });
        console.log('💬 Feedback:', response.feedback_global);
        console.log('➡️ Next Step:', response.next_action || response.recommendation_next_step);
        console.groupEnd();
        
        return response;
        
    } catch (error: any) {
        console.error('❌ Evaluation Error:', error);
        console.error('📛 Error Details:', {
            message: error.message,
            status: error.status,
            details: error.details
        });
        console.groupEnd();
        throw error;
    }
};

/**
 * 5. Récupère le statut de progression
 */
export const getLearnerGoalsStatus = async (
    learnerId: number
): Promise<GoalStatus[]> => {
    try {
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
        console.warn('Goals API warning:', error);
        return [];
    }
};

/**
 * 6. Récupère les détails d'une session
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