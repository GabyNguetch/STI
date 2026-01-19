// app/api/chat/route.ts
// NOTE: Cette route n'est plus nécessaire car on appelle directement le RAG
// depuis ChatService.ts. On la garde pour compatibilité mais elle n'est pas utilisée.

import { NextResponse } from 'next/server';

const RAG_SERVICE_URL = "https://backend-sti.onrender.com/api/v1"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
        mode, 
        userMessage,
        messages,
        caseId,
        learnerId,
        userDiagnosis, 
        userPrescription,
        examName,
        examReason
    } = body;

    const backendCaseId = caseId ? parseInt(caseId) : 1040;

    console.log(`\n🔵 [PROXY REQUEST] Mode: ${mode} | CaseID: ${backendCaseId}`);

    // MODE CHAT (Discussion Patient)
    if (mode === 'chat') {
        const payload = { 
            prompt: userMessage
        };

        const res = await fetch(`${RAG_SERVICE_URL}/chat2/${backendCaseId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        return NextResponse.json(data);
    }

    // MODE ANALYZE (Tuteur - Feu Tricolore)
    else if (mode === 'analyze') {
        const payload = {
            case_id: backendCaseId,
            user_message: userMessage,
            history: messages
        };

        const res = await fetch(`${RAG_SERVICE_URL}/tutor/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            return NextResponse.json({ status: 'good', justification: "Analyse indisponible." });
        }

        const data = await res.json();
        return NextResponse.json(data);
    }

    // MODE EXAM (Résultats Médicaux)
    else if (mode === 'exam') {
        const payload = {
            case_id: backendCaseId,
            exam_name: examName,
            exam_reason: examReason || ""
        };

        const res = await fetch(`${RAG_SERVICE_URL}/tools/exam`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            return NextResponse.json({ 
                resultat: "Le laboratoire n'a pas pu traiter cet échantillon." 
            });
        }

        const data = await res.json();
        return NextResponse.json(data);
    }

    // MODE GRADE (Evaluation Finale)
    else if (mode === 'grade') {
        const evalPayload = {
            case_id: backendCaseId,
            learner_id: learnerId ? learnerId.toString() : "anonymous",
            messages: messages,
            user_diagnosis: userDiagnosis,
            user_prescription: userPrescription
        };

        const res = await fetch(`${RAG_SERVICE_URL}/evaluate/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(evalPayload)
        });

        if (!res.ok) throw new Error("Erreur grading backend");
        
        const data = await res.json();
        return NextResponse.json(data);
    }

    // MODE HINT (Indice)
    else if (mode === 'hint') {
         const payload = {
             case_id: backendCaseId,
             learner_id: learnerId ? learnerId.toString() : "anonymous",
             messages: messages 
         };

         const res = await fetch(`${RAG_SERVICE_URL}/tutor/hint`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(payload)
         });

         if (!res.ok) {
             return NextResponse.json({ content: "Revenez aux bases de la sémiologie." });
         }

         const data = await res.json();
         return NextResponse.json({ content: data.content });
    }

    return NextResponse.json({ error: "Mode inconnu" }, { status: 400 });

  } catch (error: any) {
    console.error("🔥 PROXY ERROR:", error);
    return NextResponse.json({ 
        error: "Erreur serveur interne", 
        details: error.message 
    }, { status: 500 });
  }
}