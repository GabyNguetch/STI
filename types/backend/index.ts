// types/backend/index.ts

/**
 * 📘 Ref: Dictionnaire de Données - MODULE EXPERT
 * Table: cas_cliniques_enrichis
 */

// Représentation de la pathologie (Table: pathologies)
export interface BackendDisease {
  id: number;
  nom_fr: string;
  code_icd10: string;
  categorie?: string;
  prevalence_cameroun?: string | number; // Float 0.0-1.0 stocké en string ou number
  niveau_gravite?: number; // 1-5
  description?: string;
}

export interface BackendSymptom {
  id: number;
  nom: string;
  categorie?: string;
  signes_alarme?: boolean;
}

// Structure JSON complexe pour presentation_clinique
export interface PresentationClinique {
  histoire_maladie: string;
  // Anamnèse et signes physiques
  anamnese?: string | Record<string, any>; 
  symptomes_patient: Array<{
    symptome_id: number;
    details: string; // ex: "Depuis 3 jours, intensité 7/10"
  }>;
  antecedents?: string | {
    details: string;
    personnels?: string[];
    familiaux?: string[];
  };
}

// Structure JSON pour donnees_paracliniques
export interface DonneesParacliniques {
  signes_vitaux?: string | Record<string, any>;
  examen_clinique?: string; // Observations physiques
  analyses_biologiques?: Record<string, any>; // Résultats labo
  imagerie?: Record<string, any>;
}

// Schema de Création (Payload POST)
export interface BackendClinicalCaseCreate {
  code_fultang: string; // Obligatoire: Identifiant unique
  pathologie_principale_id: number;
  
  // Champs JSONB dans Postgres
  presentation_clinique: PresentationClinique;
  donnees_paracliniques?: DonneesParacliniques;
  
  medicaments_prescrits?: Array<any>; // JSON
  competences_requises?: Record<string, any>; // Lien Q-Matrix
  
  // Relations Tableaux
  pathologies_secondaires_ids?: number[];
  images_associees_ids?: number[];
  
  niveau_difficulte?: number; // 1-100 ou 1-5
}

// Schema de Réponse (Ce qu'on reçoit du GET)
export interface BackendClinicalCase extends BackendClinicalCaseCreate {
  id: number;
  created_at: string;
  updated_at: string;
  // La jointure est faite par FastAPI/Pydantic
  pathologie_principale: BackendDisease;
  // Les images jointes
  images_associees?: Array<{
      id: number;
      fichier_url: string;
      type_examen: string;
  }>;
}

// Version simplifiée pour les listes (Lightweight)
export interface BackendClinicalCaseSimple {
    id: number;
    code_fultang: string;
    niveau_difficulte: number;
    pathologie_principale: {
        nom_fr: string;
        code_icd10: string;
        categorie: string;
    };
    created_at: string;
}

// ... existants ...

// --- TYPES SYMPTOMES & RELATIONS ---

export interface BackendSymptom {
  id: number;
  nom: string;
  nom_local?: string; // ex: "Mal de ventre" vs "Douleur abdominale"
  categorie?: string; // "Signe vital", "Général", "Digestif"
  type_symptome?: string; // "Subjectif", "Objectif"
  description?: string;
  // Le JSON des questions peut être flexible, on le type génériquement
  questions_anamnese?: Record<string, any> | null; 
  signes_alarme: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DiseaseForSymptom {
  pathologie_id: number; // L'API pourrait renvoyer l'objet complet ou l'ID
  pathologie_nom?: string; // Si le backend fait le join, sinon on devra peut-être le récupérer
  probabilite: number | string; // % de chance d'avoir cette maladie
  importance_diagnostique: number;
}

export interface TreatmentForSymptom {
    medicament_id: number;
    medicament_dci?: string;
    medicament_nom?: string;
    efficacite: string;
    rang_preference: number;
}

// Pour la création/update
export type BackendSymptomCreate = Omit<BackendSymptom, 'id' | 'created_at' | 'updated_at'>;