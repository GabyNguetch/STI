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

// types/backend/index.ts (Ajouter ou mettre à jour)

export interface BackendMedication {
    id: number;
    dci: string; // Dénomination Commune Internationale
    nom_commercial: string;
    classe_therapeutique: string;
    forme_galenique: string;
    dosage: string;
    voie_administration: string;
    mecanisme_action?: string;
    // Les champs JSONB : on les type en Record<string, any> ou any pour la flexibilité
    indications?: Record<string, any> | string; 
    contre_indications?: Record<string, any> | string;
    effets_secondaires?: Record<string, any> | string;
    interactions_medicamenteuses?: Record<string, any> | string;
    precautions_emploi?: string;
    posologie_standard?: Record<string, any> | string;
    disponibilite_cameroun?: string;
    cout_moyen_fcfa?: number;
    statut_prescription?: string; // ex: "Ordonnance simple", "Stupéfiant"
    created_at?: string;
    updated_at?: string;
}

export type BackendMedicationCreate = Omit<BackendMedication, 'id' | 'created_at' | 'updated_at'>;

// types/backend/index.ts

export interface BackendDisease {
  id: number;
  nom_fr: string;
  code_icd10: string;
  nom_en?: string;
  nom_local?: string;
  categorie?: string; // ex: Cardiologie
  prevalence_cameroun?: string | number; // "0.5%" ou "Fréquent"
  niveau_gravite?: number; // 1 à 5
  description?: string;
  physiopathologie?: string;
  
  // Champs JSON pour futures extensions
  complications?: Record<string, any> | string;
  facteurs_risque?: Record<string, any> | string;
  
  created_at?: string;
  updated_at?: string;
}

export type BackendDiseaseCreate = Omit<BackendDisease, 'id' | 'created_at' | 'updated_at'>;


// types/backend/index.ts

// ... (autres interfaces)

export interface BackendImage {
    id: number;
    // Métadonnées médicales
    type_examen: string; // "Radio", "Scanner", "IRM", "Echographie"
    sous_type?: string;  // "Thorax", "Genou"
    pathologie_id?: number;
    description?: string;
    
    // Analyses
    signes_radiologiques?: Record<string, any> | string; // JSONB
    annotations?: any[]; // JSONB
    interpretation_experte?: string;
    diagnostic_differentiel?: string[]; // Array
    
    // Validation
    niveau_difficulte: number; // 1-5
    qualite_image: number; // 1-5
    valide_expert: boolean;
    expert_validateur?: string;
    date_validation?: string;
    
    // Technique
    fichier_url: string;
    fichier_miniature_url?: string; // Optional si le backend le génère
    format_image: string; // "jpg", "dicom"
    taille_ko: number;
    resolution?: string; // "1920x1080"
    created_at: string;
}

// Pour l'envoi (FormData gère le fichier, mais on type les champs textes ici)
export interface ImageMetadata {
    type_examen: string;
    sous_type?: string;
    pathologie_id?: number;
    description?: string;
    niveau_difficulte: number;
    qualite_image: number;
}

export interface BackendClinicalCaseCreate {
  code_fultang: string;
  pathologie_principale_id: number;
  pathologies_secondaires_ids: number[];
  presentation_clinique: {
    histoire_maladie: string;
    symptomes_patient: Array<{ symptome_id: number; details: string }>;
    antecedents: Record<string, any>;
  };
  donnees_paracliniques: Record<string, any>;
  evolution_patient: string;
  images_associees_ids: number[];
  sons_associes_ids: number[];
  medicaments_prescrits: any[]; 
  niveau_difficulte: number;
  duree_estimee_resolution_min: number;
  objectifs_apprentissage: string[];
  competences_requises: Record<string, any>;
}





