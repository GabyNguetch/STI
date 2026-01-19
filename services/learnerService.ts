// services/learnerService.ts
'use client';

const BASE_URL = "https://appren-docker.onrender.com";

// --- TYPES (Basés sur l'OpenAPI fournie) ---

export interface LoginRequest {
  email: string;
  matricule: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LearnerCreate {
  matricule: string;
  nom: string;
  email: string;
  niveau_etudes: string;
  specialite_visee: string;
  langue_preferee: string;
  date_inscription: string;
}

export interface LearnerResponse extends LearnerCreate {
  id: number;
}

// Structures des Traces (Profil Complet)
export interface CognitiveProfile {
  vitesse_assimilation: number;
  capacite_memoire_travail: number;
  tendance_impulsivite: number;
  prefer_visual: boolean;
}

export interface AffectiveState {
  session_id: string;
  timestamp: string;
  stress_level: number;
  confidence_level: number;
  motivation_level: number;
  frustration_level: number;
}

export interface CompetencyMastery {
  competence_id: number;
  mastery_level: number;
  nb_success: number;
  nb_failures: number;
}

export interface LearningGoal {
  id?: number;
  type_objectif: string;
  statut: string; 
}

export interface TraceProfile {
  identification: Partial<LearnerResponse>;
  cognitive_dimension: {
    cognitive_profile: CognitiveProfile;
  };
  affective_state: AffectiveState;
  competencies: {
    mastery_levels: CompetencyMastery[];
  };
  behavioral_dimension: {
    strategies: any[]; 
  };
  learning_history: {
    goals: LearningGoal[];
    sessions?: Array<{ date: string; score: number }>; 
  };
}

export interface LearnerTrace {
  id: string;
  profile: TraceProfile;
}

export interface TraceResponse {
  learners: LearnerTrace[];
}

// --- LOGGING HELPER ---
function logApiCall(method: string, endpoint: string, body?: any, response?: any, error?: any) {
  const groupLabel = `📡 API [${method}] ${endpoint}`;
  
  if (error) {
    console.group(groupLabel); 
  } else {
    console.groupCollapsed(groupLabel);
  }

  console.log("%cRequest:", "color: #3b82f6; font-weight: bold;");
  console.log({ endpoint, body });

  if (error) {
    console.log("%cError:", "color: #ef4444; font-weight: bold;", error);
  } else {
    console.log("%cResponse:", "color: #10b981; font-weight: bold;", response);
  }
  
  console.groupEnd();
}

/**
 * Wrapper fetch générique avec Auth automatique et Logs
 */
async function learnerFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  // Récupération token (uniquement côté client)
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const headers: any = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  // Ajout conditionnel du token (sauf si déjà présent)
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });
    
    const textResponse = await response.text();
    let data;
    try {
        data = textResponse ? JSON.parse(textResponse) : {};
    } catch {
        data = textResponse;
    }

    logApiCall(options.method || 'GET', endpoint, options.body ? JSON.parse(options.body as string) : null, data);

    if (!response.ok) {
      throw new Error(data?.detail || response.statusText || "Erreur serveur");
    }

    return data as T;
  } catch (error) {
    logApiCall(options.method || 'GET', endpoint, options.body, null, error);
    throw error;
  }
}

// ================= MÉTHODES AUTONOMES (Crucial pour la compatibilité AuthContext) =================

export const createLearner = async (data: LearnerCreate): Promise<LearnerResponse> => {
  return await learnerFetch<LearnerResponse>('/learners/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const loginLearner = async (credentials: LoginRequest): Promise<TokenResponse> => {
  const response = await learnerFetch<TokenResponse>('/learner/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  if (response.access_token && typeof window !== 'undefined') {
    localStorage.setItem('access_token', response.access_token);
  }
  return response;
};

// C'EST ICI LA CORRECTION : Cette fonction doit être exportée individuellement
export const getLearnerMe = async (token?: string): Promise<LearnerResponse> => {
  const options: RequestInit = { method: 'GET' };
  // Si un token spécifique est passé (cas d'usage lors du SSR ou init AuthContext), on surcharge
  if (token) {
    options.headers = { 'Authorization': `Bearer ${token}` };
  }
  return await learnerFetch<LearnerResponse>('/learner/auth/me', options);
};

// ================= OBJET SERVICE GLOBAL (Pour le Dashboard) =================

export const LearnerService = {
  login: loginLearner, 
  getMe: getLearnerMe,

  /**
   * Récupère un apprenant spécifique par ID
   */
  getLearnerById: async (learner_id: number): Promise<LearnerResponse> => {
    return await learnerFetch<LearnerResponse>(`/learners/${learner_id}`, { method: 'GET' });
  },

  /**
   * Récupère les TRACES complètes (Profil Cognitif, Historique, Affectif...)
   * Endpoint OpenAPI: /learner/traces?learner_id={id}
   */
  getTraces: async (learner_id: number): Promise<TraceResponse> => {
    return await learnerFetch<TraceResponse>(`/learner/traces?learner_id=${learner_id}&limit=10`, { method: 'GET' });
  },
};