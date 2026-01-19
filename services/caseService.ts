// services/caseService.ts
import { apiClient } from '@/lib/apiClient';
// SUPPRESSION DE L'IMPORT SUPABASE

/**
 * Version API : On utilise maintenant directement l'API Expert pour charger les cas
 * plus besoin de Supabase ici.
 */

// On garde une fonction wrapper simple si nécessaire, 
// mais on utilisera surtout simulationService pour la logique active.
export const fetchCaseById = async (id: number) => {
   // Redirection vers le service expert existant
   return apiClient(`/clinical-cases/${id}`);
}