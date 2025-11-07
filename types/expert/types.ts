// types/expert/types.ts
import { UseCase } from '../simulation/types';

// Statut de validation pour un cas clinique
export type CaseStatus = 'pending' | 'approved' | 'rejected';

// Nouveaux types pour les cas d'utilisation avancés
export type PatientPersona = 'standard' | 'anxieux' | 'coopératif' | 'pressé' | 'silencieux';

export interface GoldenPathItem {
  id: string;
  type: 'question' | 'examen' | 'action';
  description: string; // Ex: "Demander les antécédents de diabète", "Faire un ECG"
  isCritical: boolean; // Est-ce une étape indispensable ?
}

// Un cas clinique enrichi avec toutes les métadonnées pour l'expert
export interface ExpertUseCase extends UseCase {
  status: CaseStatus;
  submittedAt: string; 
  submittedBy: string; 
  feedback?: string; 
  
  // Champs pour l'enrichissement pédagogique
  annotations?: string; // Notes de l'expert, pièges à éviter
  persona?: PatientPersona;
  goldenPath?: GoldenPathItem[];
}

// Type pour l'analyse des sessions des apprenants
export interface SessionLog {
    sessionId: string;
    caseId: string;
    studentId: string; // Anonymisé, ex: "Student-1A4B"
    success: boolean;
    score: number; // Sur 100
    timeSpent: number; // en minutes
    date: string;
    isFlagged: boolean; // Pour les cas "hors-piste"
}