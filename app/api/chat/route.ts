// app/api/chat/route.ts
import { NextResponse } from 'next/server';

// Configuration
// Assure-toi que ton backend FastAPI tourne sur ce port
const RAG_SERVICE_URL = "https://backend-sti.onrender.com/api/v1"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
        mode, 
        userMessage, // Message actuel
        messages,    // Historique
        caseId,      // ID venant du front
        learnerId,
        userDiagnosis, 
        userPrescription,
        examName,    // Pour mode exam
        examReason
    } = body;

    // Conversion ID cas : si null ou non numérique, fallback 1040
    const backendCaseId = caseId ? parseInt(caseId) : 1040;

    // --- LOGS SERVER SIDE ---
    console.log(`\n🔵 [PROXY REQUEST] Mode: ${mode} | CaseID: ${backendCaseId}`);

    // =========================================================================
    // 1. MODE CHAT (Discussion Patient)
    // =========================================================================
    if (mode === 'chat') {
        const payload = { 
            prompt: userMessage, 
            messages: messages, // On passe l'historique pour contexte
            mode: 'chat',
            learner_id: learnerId 
        };

        const res = await fetch(`${RAG_SERVICE_URL}/chat/${backendCaseId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        return NextResponse.json(data);
    }

    // =========================================================================
    // 2. MODE ANALYZE (Tuteur - Feu Tricolore) - NOUVEAU
    // =========================================================================
    else if (mode === 'analyze') {
        const payload = {
            case_id: backendCaseId,
            user_message: userMessage,
            history: messages // Pour juger de la pertinence vs ce qui a déjà été dit
        };

        const res = await fetch(`${RAG_SERVICE_URL}/tutor/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            // Fallback si le tuteur plante
            return NextResponse.json({ status: 'good', justification: "Analyse indisponible." });
        }

        const data = await res.json(); 
        // data attendu: { "status": "good" | "warning", "justification": "..." }
        return NextResponse.json(data);
    }

    // =========================================================================
    // 3. MODE EXAM (Résultats Médicaux) - NOUVEAU
    // =========================================================================
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
        // data attendu: { "exam_name": "...", "resultat": "..." }
        return NextResponse.json(data);
    }

    // =========================================================================
    // 4. MODE GRADE (Evaluation Finale)
    // =========================================================================
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

    // =========================================================================
    // 5. MODE HINT (Indice)
    // =========================================================================
    else if (mode === 'hint') {
         const payload = {
             case_id: backendCaseId,
             learner_id: learnerId ? learnerId.toString() : "anonymous",
             messages: messages 
         };

         const res = await fetch(`${RAG_SERVICE_URL}/hint/`, {
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
    return NextResponse.json({ error: "Erreur serveur interne", details: error.message }, { status: 500 });
  }
}