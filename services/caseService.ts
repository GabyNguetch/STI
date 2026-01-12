// services/caseService.ts
'use client';

import { createClient } from '@/lib/supabaseClient';
import type { UseCase } from '@/types/simulation/types';

// Initialisation du client Supabase
const supabase = createClient();

/**
 * TYPE pour les données retournées par la jointure Supabase
 * Cela permet de typer correctement les données dans ton Dashboard.
 */
export interface UserProgressData {
    id: number;
    case_id: string;
    started_at: string;
    status: 'started' | 'completed';
    score: number | null;
    clinical_cases: { // Données jointes
        id: string;
        service_id: string;
        difficulty: string;
        patient: any; // Idéalement, type Patient ici
    };
}


/**
 * 1. Récupère TOUS les cas cliniques disponibles (Pour la Bibliothèque)
 */
export const fetchCases = async (): Promise<UseCase[]> => {
    const { data, error } = await supabase
        .from('clinical_cases')
        .select('*');

    if (error) {
        console.error("Erreur fetchCases:", error);
        throw new Error(error.message);
    }

    if (!data) return [];

    // Transformation pour correspondre au type UseCase (camelCase)
    return data.map(item => ({
        id: item.id,
        serviceId: item.service_id, 
        difficulty: item.difficulty,
        patient: item.patient
    })) as UseCase[];
};


/**
 * 2. Récupère la progression d'un utilisateur spécifique (Pour le Dashboard)
 * Fait une jointure avec la table `clinical_cases` pour avoir les détails (titre, service...)
 */
export const fetchUserProgress = async (userId: string): Promise<UserProgressData[]> => {
    if (!userId) return [];

    // Requête Supabase avec JOIN
    const { data, error } = await supabase
        .from('user_case_progress')
        .select(`
            id,
            case_id,
            started_at,
            status,
            score,
            clinical_cases (
                id,
                service_id,
                difficulty,
                patient
            )
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false }); // Trie du plus récent au plus ancien

    if (error) {
        console.error("Erreur fetchUserProgress:", error);
        throw new Error(`Impossible de charger la progression: ${error.message}`);
    }

    // Le cast ici permet à TypeScript de comprendre la structure jointe
    return data as unknown as UserProgressData[];
}


/**
 * 3. Enregistre le démarrage d'un cas (Si non présent dans simulationService)
 */
export const startCaseForUser = async (caseId: string, userId: string) => {
    if (!userId) throw new Error("Utilisateur non connecté");

    // On utilise UPSERT pour éviter les doublons si l'utilisateur relance le même cas
    // (Assure-toi d'avoir une contrainte UNIQUE sur (user_id, case_id) dans ta DB)
    const { error } = await supabase
        .from('user_case_progress')
        .upsert({ 
            case_id: caseId, 
            user_id: userId, 
            status: 'started',
            // On ne met pas à jour 'score' ici pour ne pas écraser une ancienne note si on relance
            started_at: new Date().toISOString() 
        }, { onConflict: 'user_id, case_id' });

    if (error) {
        console.error("Erreur startCaseForUser:", error);
        throw error;
    }
};

/**
 * 4. Crée un nouveau cas clinique (Pour l'interface Expert/Admin)
 */
export const createCase = async (caseData: any) => {
    const { data, error } = await supabase
        .from('clinical_cases')
        .insert([caseData])
        .select();

    if (error) {
        console.error("Erreur createCase:", error);
        throw error;
    }
    return data;
}