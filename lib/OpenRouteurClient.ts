// lib/openRouterClient.ts
import OpenAI from 'openai';

/**
 * Configuration pour OpenRouter avec modèle gratuit
 * Modèle recommandé : meta-llama/llama-3.1-8b-instruct:free
 * Excellent pour le roleplay médical et gratuit
 */
export const openRouterClient = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "FullTang Medical Simulator",
  }
});

// Configuration des modèles disponibles
export const MODELS = {
  // Modèle GRATUIT pour simulation patient (roleplay)
  PATIENT_SIMULATION: "meta-llama/llama-3.1-8b-instruct:free",
  
  // Modèle GRATUIT pour correction (raisonnement)
  GRADING: "meta-llama/llama-3.1-8b-instruct:free",
  
  // Alternative premium si budget disponible
  PREMIUM: "anthropic/claude-3.5-sonnet"
};

export default openRouterClient;