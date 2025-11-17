// services/caseService.ts
'use client';

import { createClient } from '@/lib/supabaseClient';
import type { UseCase } from '@/types/simulation/types';

const supabase = createClient();

export const fetchCases = async (): Promise<UseCase[]> => {
    const { data, error } = await supabase
        .from('clinical_cases')
        .select('*'); // Le '*' sélectionne toutes les colonnes de la table.

    // Si une erreur survient pendant la requête à la base de données.
    if (error) {
        console.error("Erreur lors de la récupération des cas cliniques:", error);
        // On lance une nouvelle erreur pour que le composant qui appelle puisse la gérer.
        throw new Error(`Échec de la récupération des cas: ${error.message}`);
    }

    // Si les données sont nulles ou vides (ce qui ne devrait pas arriver s'il y a des cas).
    if (!data) {
        return []; // Retourne un tableau vide pour éviter les erreurs.
    }
    
    // Le `data` retourné par Supabase doit correspondre à notre type `UseCase`.
    // On s'assure que la casse des propriétés correspond (snake_case vs camelCase).
    // Ici, on renomme `service_id` en `serviceId` pour correspondre au type `UseCase`.
    const formattedData = data.map(item => ({
        ...item,
        serviceId: item.service_id, 
    })) as UseCase[];

    return formattedData;
};
/**
 * MODIFIÉ : La fonction accepte maintenant l'ID de l'utilisateur.
 * @param caseId - L'ID du cas à démarrer.
 * @param userId - L'ID de l'utilisateur qui démarre le cas.
 */
export const startCaseForUser = async (caseId: string, userId: string) => {
  if (!userId) {
    throw new Error("L'utilisateur n'est pas authentifié.");
  }

  const { error } = await supabase
    .from('user_case_progress')
    .upsert(
      { case_id: caseId, user_id: userId, status: 'started' },
      { onConflict: 'user_id, case_id', ignoreDuplicates: true }
    );

  if (error) {
    console.error("Erreur Supabase lors du démarrage du cas:", error);
    throw error;
  }

  return { success: true };
};

/**
 * Récupère toute la progression de l'utilisateur pour tous les cas.
 * Joint les données des cas cliniques pour avoir le titre, etc.
 */
export const fetchUserProgress = async (userId: string) => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('user_case_progress')
        .select(`
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
        .order('started_at', { ascending: false });

    if (error) {
        console.error("Erreur lors de la récupération de la progression:", error);
        throw error;
    }

    return data || [];
}

/**
 * Crée un nouveau cas clinique dans la base de données.
 * Réservé aux utilisateurs avec les permissions adéquates (RLS).
 */
export const createCase = async (caseData: Partial<UseCase>) => {
    const { data, error } = await supabase
        .from('clinical_cases')
        .insert([
            { ...caseData }
        ])
        .select();

    if (error) {
        console.error("Erreur lors de la création du cas:", error);
        throw error;
    }
    
    return data;
}