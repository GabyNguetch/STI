// ================================================================================
// FICHIER: services/SimulationService.ts
// ================================================================================

import { createClient } from '@/lib/supabaseClient';
import { Patient, UseCase, GameResult, Message } from '@/types/simulation/types';

const supabase = createClient();

/**
 * Charge un cas depuis Supabase. Si difficulty est fourni, filtre. 
 * Sinon, prend un cas aléatoire dans le service.
 */
export const fetchClinicalCase = async (serviceId: string, difficulty?: string): Promise<UseCase | null> => {
  let query = supabase
    .from('clinical_cases')
    .select('*')
    .eq('service_id', serviceId); // Note: colonne en snake_case dans la DB

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erreur chargement cas:", error);
    return null;
  }

  if (!data || data.length === 0) return null;

  // Sélection aléatoire parmi les cas trouvés (si plusieurs cas même difficulté)
  const randomCase = data[Math.floor(Math.random() * data.length)];

  // Mapping DB -> Frontend Types
  return {
    id: randomCase.id,
    serviceId: randomCase.service_id,
    difficulty: randomCase.difficulty,
    patient: randomCase.patient // La colonne patient est JSONB, elle contient tout
  };
};

/**
 * Enregistre qu'un utilisateur a démarré un cas
 */
export const startCaseForUser = async (caseId: string, userId: string) => {
  const { error } = await supabase
    .from('user_case_progress')
    .upsert({ // Upsert pour éviter les doublons si l'user redémarre le même cas
        user_id: userId,
        case_id: caseId,
        started_at: new Date().toISOString(),
        status: 'started'
    }, { onConflict: 'user_id, case_id' }); // Supposant une contrainte unique

  if (error) console.error("Erreur startCase:", error);
};

/**
 * Sauvegarde l'évaluation finale et met à jour le statut
 */
export const saveEvaluation = async (
  userId: string,
  caseId: string,
  result: GameResult,
  transcript: Message[],
  studentDiagnosis: string,
  studentPrescription: string
) => {
  // 1. Sauvegarde dans la table des évaluations (historique complet)
  const { error: evalError } = await supabase
    .from('evaluations')
    .insert({
        user_id: userId,
        case_id: caseId,
        score: result.score,
        feedback: result.feedback,
        diagnosis_status: result.diagnosisStatus,
        missed_steps: JSON.stringify(result.missedSteps),
        transcript: JSON.stringify(transcript), // On stocke le chat complet
        student_diagnosis: studentDiagnosis,
        student_prescription: studentPrescription
    });

  if (evalError) console.error("Erreur save eval:", evalError);

  // 2. Met à jour la progression globale (Score + Statut terminé)
  const { error: progressError } = await supabase
    .from('user_case_progress')
    .update({ 
        status: 'completed', 
        score: Math.round((result.score / 20) * 100) // Convertir sur 100 pour le dashboard
    })
    .match({ user_id: userId, case_id: caseId });

  if (progressError) console.error("Erreur update progress:", progressError);
};

// Utilisé pour la page Bibliothèque
export const fetchCases = async (): Promise<UseCase[]> => {
    const { data, error } = await supabase.from('clinical_cases').select('*');
    if (error || !data) return [];
    
    return data.map(c => ({
        id: c.id,
        serviceId: c.service_id,
        difficulty: c.difficulty,
        patient: c.patient
    }));
};