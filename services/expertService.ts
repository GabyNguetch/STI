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

// GET liste des cas
export const getAllClinicalCases = async (): Promise<BackendClinicalCaseSimple[]> => {
  // Attention au chemin: api/backend pointe vers le proxy, qui pointe vers /clinical-cases/
  // FastAPI aime les slashs finaux sur les get-all souvent
  return await apiClient<BackendClinicalCaseSimple[]>('/clinical-cases/');
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






