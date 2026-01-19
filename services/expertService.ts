// services/expertService.ts
import { apiClient } from '@/lib/apiClient';
import { BackendDisease, BackendSymptom, BackendClinicalCase, BackendClinicalCaseCreate, BackendClinicalCaseSimple, TreatmentForSymptom, DiseaseForSymptom, BackendSymptomCreate } from '@/types/backend';

// === PATHOLOGIES ===
export const getDiseases = async (): Promise<BackendDisease[]> => {
  return await apiClient<BackendDisease[]>('/diseases/');
};

// === SYMPTOMES ===
export const getSymptoms = async (): Promise<BackendSymptom[]> => {
  return await apiClient<BackendSymptom[]>('/symptoms/');
};

export const getAllClinicalCases = async (): Promise<BackendClinicalCaseSimple[]> => {
  return await apiClient<BackendClinicalCaseSimple[]>('/clinical-cases/?limit=120');
  // Comme vous l'avez fait pour getAllDiseases (ligne 150)
};

// CREATE cas
export const createClinicalCase = async (caseData: BackendClinicalCaseCreate): Promise<BackendClinicalCase> => {
  // Ici aussi, attention aux types JSON qui doivent correspondre au schéma Pydantic backend
  return await apiClient<BackendClinicalCase>('/clinical-cases/', {
    method: 'POST',
    body: JSON.stringify(caseData),
  });
};

// 2. Lire un cas spécifique (Détail complet)
export const getClinicalCaseById = async (caseId: number): Promise<BackendClinicalCase> => {
  return await apiClient<BackendClinicalCase>(`/clinical-cases/${caseId}`);
};

// === MEDIA ===
export const uploadImage = async (file: File, type: string = "Radiographie"): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type_examen', type);

  // Note: Pour FormData avec fetch, on ne met PAS 'Content-Type': 'application/json'
  // Le navigateur le gère automatiquement. On utilise donc un fetch direct ici pour simplifier.
  const response = await fetch("https://expert-cmck.onrender.com/api/v1/media/images/upload", {
    method: "POST",
    body: formData,
    headers: {
        'Accept': 'application/json',
    }
  });
  
  if(!response.ok) throw new Error("Upload Failed");
  return await response.json();
}

// ================= SYMPTOMES =================

// 1. Lire tous les symptômes (Liste)
export const getAllSymptoms = async (): Promise<BackendSymptom[]> => {
  return await apiClient<BackendSymptom[]>('/symptoms/');
};

// 2. Lire un symptôme unique
export const getSymptomById = async (id: number): Promise<BackendSymptom> => {
  return await apiClient<BackendSymptom>(`/symptoms/${id}`);
};

// 3. Créer un symptôme
export const createSymptom = async (data: BackendSymptomCreate): Promise<BackendSymptom> => {
  return await apiClient<BackendSymptom>('/symptoms/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// 4. Mettre à jour
export const updateSymptom = async (id: number, data: Partial<BackendSymptomCreate>): Promise<BackendSymptom> => {
  return await apiClient<BackendSymptom>(`/symptoms/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

// 5. Supprimer
export const deleteSymptom = async (id: number): Promise<void> => {
  return await apiClient<void>(`/symptoms/${id}`, {
    method: 'DELETE'
  });
};

// ================= RELATIONS SYMPTOMES =================

// 6. Maladies liées au symptôme (Diagnostic Différentiel Inversé)
export const getDiseasesForSymptom = async (id: number): Promise<DiseaseForSymptom[]> => {
    // Le endpoint attendu selon ta spec : GET /api/v1/symptoms/{id}/diseases
    return await apiClient<DiseaseForSymptom[]>(`/symptoms/${id}/diseases`);
};

// 7. Traitements Symptomatiques
export const getTreatmentsForSymptom = async (id: number): Promise<TreatmentForSymptom[]> => {
    return await apiClient<TreatmentForSymptom[]>(`/symptoms/${id}/treatments`);
};

// 8. Ajouter un Traitement au Symptôme
export const addTreatmentToSymptom = async (symptomId: number, data: { medicament_id: number, efficacite?: string }): Promise<any> => {
    return await apiClient(`/symptoms/${symptomId}/treatments`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

// UPDATE (PATCH)
export const updateClinicalCase = async (id: number, data: Partial<BackendClinicalCaseCreate>): Promise<BackendClinicalCase> => {
    // Note: Pour un PATCH, on envoie uniquement les champs modifiés
    return await apiClient<BackendClinicalCase>(`/clinical-cases/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};

// DELETE
export const deleteClinicalCase = async (id: number): Promise<void> => {
    return await apiClient<void>(`/clinical-cases/${id}`, {
        method: 'DELETE'
    });
};

// services/expertService.ts
// ... imports existants ...
import { BackendMedication, BackendMedicationCreate } from '@/types/backend';

// ... (fonctions existantes) ...

// === MEDICATIONS ===

// GET ALL
export const getAllMedications = async (): Promise<BackendMedication[]> => {
    return await apiClient<BackendMedication[]>('/medications/');
};

// GET ONE
export const getMedicationById = async (id: number): Promise<BackendMedication> => {
    return await apiClient<BackendMedication>(`/medications/${id}`);
};

// CREATE
export const createMedication = async (data: BackendMedicationCreate): Promise<BackendMedication> => {
    return await apiClient<BackendMedication>('/medications/', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

// UPDATE
export const updateMedication = async (id: number, data: Partial<BackendMedicationCreate>): Promise<BackendMedication> => {
    return await apiClient<BackendMedication>(`/medications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};

// DELETE
export const deleteMedication = async (id: number): Promise<void> => {
    return await apiClient<void>(`/medications/${id}`, {
        method: 'DELETE'
    });
};

// services/expertService.ts

// ... imports existants ...
import { BackendDiseaseCreate } from '@/types/backend';

// === PATHOLOGIES (DISEASES) ===

// GET ALL
export const getAllDiseases = async (): Promise<BackendDisease[]> => {
    return await apiClient<BackendDisease[]>('/diseases/?limit=1000'); // On charge tout pour la liste
};

// GET ONE
export const getDiseaseById = async (id: number): Promise<BackendDisease> => {
    return await apiClient<BackendDisease>(`/diseases/${id}`);
};

// CREATE
export const createDisease = async (data: BackendDiseaseCreate): Promise<BackendDisease> => {
    return await apiClient<BackendDisease>('/diseases/', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

// UPDATE
export const updateDisease = async (id: number, data: Partial<BackendDiseaseCreate>): Promise<BackendDisease> => {
    return await apiClient<BackendDisease>(`/diseases/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};

// DELETE
export const deleteDisease = async (id: number): Promise<void> => {
    return await apiClient<void>(`/diseases/${id}`, {
        method: 'DELETE'
    });
};

// services/expertService.ts
// ... imports ...
import { BackendImage, ImageMetadata } from '@/types/backend';

// === MEDIA / IMAGES ===

// 1. Lire toutes les images (avec pagination théorique)
export const getAllImages = async (): Promise<BackendImage[]> => {
    // Si votre API a besoin de pagination, ajoutez ?limit=...
    return await apiClient<BackendImage[]>('/media/images/?limit=100'); 
};

// 2. Upload avec métadonnées
export const uploadMedicalImage = async (file: File, metadata: ImageMetadata): Promise<BackendImage> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Ajout des champs textuels au FormData
    formData.append('type_examen', metadata.type_examen);
    if(metadata.sous_type) formData.append('sous_type', metadata.sous_type);
    if(metadata.description) formData.append('description', metadata.description);
    if(metadata.pathologie_id) formData.append('pathologie_id', metadata.pathologie_id.toString());
    formData.append('niveau_difficulte', metadata.niveau_difficulte.toString());
    formData.append('qualite_image', metadata.qualite_image.toString());

    // NOTE: On utilise fetch natif pour gérer le multipart/form-data correctement (le boundary est géré par le navigateur)
    const API_URL = "https://expert-cmck.onrender.com/api/v1"; // Adaptez selon votre configuration apiClient

    const response = await fetch(`${API_URL}/media/images/upload`, {
        method: "POST",
        body: formData,
        // Ne PAS mettre de header Content-Type ici, fetch le fait automatiquement
        headers: {
            'Accept': 'application/json',
        }
    });
    
    if(!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Erreur upload image");
    }
    
    return await response.json();
};

// 3. Delete
export const deleteImage = async (id: number): Promise<void> => {
    return await apiClient<void>(`/media/images/${id}`, {
        method: 'DELETE'
    });
};











