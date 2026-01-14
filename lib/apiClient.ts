// lib/apiClient.ts

// URL de base de votre backend déployé sur Render
const BASE_URL = "/api/backend"; 

/**
 * Wrapper générique pour fetch avec logging complet dans la console
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  // --- LOG REQUEST ---
  console.group(`🚀 [API REQUEST] ${config.method || 'GET'} ${endpoint}`);
  console.log("URL:", url);
  console.log("Headers:", headers);
  if (config.body) {
    try {
      console.log("Body:", JSON.parse(config.body as string));
    } catch {
      console.log("Body (Raw):", config.body);
    }
  }
  console.groupEnd();

  try {
    const response = await fetch(url, config);

    // --- LOG RESPONSE ---
    // On clone la réponse pour pouvoir lire le JSON sans "consommer" le flux principal
    const responseClone = response.clone();
    let data;
    try {
        data = await responseClone.json();
    } catch (e) {
        data = await responseClone.text();
    }

    console.group(`✅ [API RESPONSE] ${response.status} ${endpoint}`);
    console.log("Data:", data);
    console.groupEnd();

    if (!response.ok) {
        // Gestion basique d'erreur renvoyée par FastAPI (HTTPValidationError)
        const errorDetail = typeof data === 'object' && data.detail 
            ? JSON.stringify(data.detail) 
            : "Une erreur est survenue";
        throw new Error(errorDetail);
    }

    return data as T;
  } catch (error) {
    console.error(`wm [API ERROR] ${endpoint}`, error);
    throw error;
  }
}