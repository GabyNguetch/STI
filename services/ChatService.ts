// services/ChatService.ts
// Updated to use Next.js API proxy instead of direct backend calls

const API_PROXY = "/api/chat";

interface MessageHistory {
    sender: string;
    text: string;
    time: string;
}

export const sendMessageToRAG = async (caseId: number, message: string): Promise<string> => {
    console.log('🔵 [RAG CHAT REQUEST via Proxy]');
    console.log('Case ID:', caseId);
    console.log('Message:', message);

    try {
        const response = await fetch(API_PROXY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: 'chat',
                caseId: caseId,
                userMessage: message
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ RAG Response:', data);
        
        return data.response || data.content || "Pas de réponse du patient.";
    } catch (error: any) {
        console.error('🔥 [RAG ERROR]', error);
        throw new Error(`Erreur communication RAG: ${error.message}`);
    }
};

export const analyzeQuestionQuality = async (
    caseId: number,
    userMessage: string,
    history: MessageHistory[]
): Promise<{ status: 'good' | 'warning' | 'bad'; justification: string }> => {
    console.log('🎓 [ANALYZE QUESTION via Proxy]');

    try {
        const response = await fetch(API_PROXY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: 'analyze',
                caseId: caseId,
                userMessage: userMessage,
                messages: history
            })
        });

        if (!response.ok) {
            console.warn('Analysis failed, returning neutral');
            return { status: 'good', justification: 'Analyse non disponible.' };
        }

        const data = await response.json();
        console.log('✅ Analysis result:', data);

        return {
            status: data.status || 'good',
            justification: data.justification || 'Continuez.'
        };
    } catch (error: any) {
        console.error('❌ Analysis error:', error);
        return { status: 'good', justification: 'Service indisponible.' };
    }
};

export const requestHintFromTutor = async (
    caseId: number,
    learnerId: string,
    messages: MessageHistory[]
): Promise<string> => {
    console.log('💡 [REQUEST HINT via Proxy]');

    try {
        const response = await fetch(API_PROXY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: 'hint',
                caseId: caseId,
                learnerId: learnerId,
                messages: messages
            })
        });

        if (!response.ok) {
            throw new Error('Service indisponible');
        }

        const data = await response.json();
        console.log('✅ Hint received:', data);

        return data.content || data.hint || 'Revenez aux bases de la sémiologie.';
    } catch (error: any) {
        console.error('❌ Hint error:', error);
        throw new Error('Impossible d\'obtenir un indice pour le moment.');
    }
};

export const requestExamResult = async (
    caseId: number,
    examName: string,
    examReason: string
): Promise<string> => {
    console.log('🔬 [REQUEST EXAM via Proxy]');

    try {
        const response = await fetch(API_PROXY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: 'exam',
                caseId: caseId,
                examName: examName,
                examReason: examReason
            })
        });

        if (!response.ok) {
            throw new Error('Laboratoire indisponible');
        }

        const data = await response.json();
        console.log('✅ Exam result:', data);

        return data.resultat || data.result || 'Résultat non disponible.';
    } catch (error: any) {
        console.error('❌ Exam error:', error);
        return 'Le laboratoire n\'a pas pu traiter cette demande.';
    }
};

export const evaluateDiagnosis = async (
    caseId: number,
    learnerId: string,
    messages: MessageHistory[],
    userDiagnosis: string,
    userPrescription: string
): Promise<any> => {
    console.log('📊 [EVALUATE DIAGNOSIS via Proxy]');

    try {
        const response = await fetch(API_PROXY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: 'grade',
                caseId: caseId,
                learnerId: learnerId,
                messages: messages,
                userDiagnosis: userDiagnosis,
                userPrescription: userPrescription
            })
        });

        if (!response.ok) {
            throw new Error('Service d\'évaluation indisponible');
        }

        const data = await response.json();
        console.log('✅ Evaluation result:', data);

        return data;
    } catch (error: any) {
        console.error('❌ Evaluation error:', error);
        throw new Error('Impossible d\'évaluer le diagnostic pour le moment.');
    }
};