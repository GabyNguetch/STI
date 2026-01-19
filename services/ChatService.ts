// services/ChatService.ts
import { apiClient } from '@/lib/apiClient';

// ================= TYPES POUR LE CHAT =================

export interface ChatMessageRequest {
    sender: 'learner' | 'patient' | 'system' | 'tutor';
    content: string;
    message_metadata?: {
        [key: string]: any;
    };
}

export interface ChatMessageResponse {
    id: number;
    session_id: string;
    sender: 'learner' | 'patient' | 'system' | 'tutor';
    content: string;
    timestamp: string;
    message_metadata?: {
        [key: string]: any;
    };
}

export interface ChatHistory {
    messages: ChatMessageResponse[];
    total: number;
}

// ================= ENDPOINTS CHAT =================

/**
 * 🔥 ENDPOINT PRINCIPAL: Envoie un message et récupère la réponse du Patient (IA)
 * ATTENTION: Cet endpoint est SYNCHRONE et BLOQUANT
 * Il peut prendre quelques secondes car il déclenche l'IA Patient
 */
export const sendChatMessage = async (
    sessionId: string,
    content: string,
    sender: 'learner' | 'patient' | 'system' | 'tutor' = 'learner',
    metadata?: { [key: string]: any }
): Promise<ChatMessageResponse> => {
    
    console.log('💬 [CHAT] Sending message:', { sessionId, sender, content });

    const payload: ChatMessageRequest = {
        sender,
        content,
        message_metadata: metadata
    };

    const response = await apiClient<ChatMessageResponse>(
        `/chat/sessions/${sessionId}/messages`,
        {
            method: 'POST',
            body: JSON.stringify(payload)
        }
    );

    console.log('✅ [CHAT] Response received:', response);

    return response;
};

/**
 * Récupère l'historique complet des messages d'une session
 */
export const getChatHistory = async (
    sessionId: string,
    limit?: number,
    offset?: number
): Promise<ChatHistory> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';

    return await apiClient<ChatHistory>(
        `/chat/sessions/${sessionId}/messages${queryString}`
    );
};

/**
 * 🤖 FONCTION WRAPPER pour envoyer un message étudiant et attendre la réponse du Patient
 * Cette fonction simplifie l'appel pour le composant
 */
export const askPatient = async (
    sessionId: string,
    question: string
): Promise<{ 
    userMessage: ChatMessageResponse; 
    patientResponse: ChatMessageResponse | null;
}> => {
    console.group('🗣️ [CHAT FLOW] Ask Patient');
    
    try {
        // 1. Envoyer le message de l'étudiant
        const userMessage = await sendChatMessage(sessionId, question, 'learner');
        console.log('✅ User message posted:', userMessage);

        // 2. Récupérer l'historique pour obtenir la réponse du patient
        // (L'IA a déjà répondu de manière synchrone, donc on récupère le dernier message)
        const history = await getChatHistory(sessionId, 10); // Les 10 derniers messages
        
        // 3. Trouver la réponse du patient qui suit notre message
        const patientResponse = history.messages.find(
            msg => msg.sender === 'patient' && 
                   new Date(msg.timestamp) > new Date(userMessage.timestamp)
        );

        console.log('✅ Patient response:', patientResponse);
        console.groupEnd();

        return {
            userMessage,
            patientResponse: patientResponse || null
        };

    } catch (error) {
        console.error('❌ Error in chat flow:', error);
        console.groupEnd();
        throw error;
    }
};

/**
 * ALTERNATIVE: Si le backend retourne directement la réponse du patient dans l'objet
 * (à vérifier selon votre implémentation exacte)
 */
export const sendMessageAndGetResponse = async (
    sessionId: string,
    question: string
): Promise<string> => {
    try {
        // L'endpoint étant synchrone, il retourne peut-être directement la réponse IA
        const response = await sendChatMessage(sessionId, question, 'learner');
        
        // Si la réponse contient déjà le message du patient
        if (response.sender === 'patient') {
            return response.content;
        }

        // Sinon, on fait une requête supplémentaire pour récupérer la réponse
        const history = await getChatHistory(sessionId, 5);
        const lastPatientMessage = history.messages
            .filter(m => m.sender === 'patient')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        return lastPatientMessage?.content || "Le patient ne répond pas.";

    } catch (error: any) {
        console.error('Error sending message:', error);
        throw new Error(error.message || 'Erreur communication chat');
    }
};