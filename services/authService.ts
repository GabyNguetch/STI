// services/authService.ts

import { createClient } from '@/lib/supabaseClient';
import type { AuthError, AuthResponse } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/user/profile';

const supabase = createClient();

// 1. Interface stricte pour l'Inscription (Email)
export interface SignUpCredentials {
  email: string;
  password: string;
  options?: {
    data: {
      username?: string;
      [key: string]: any;
    }
    emailRedirectTo?: string;
  }
}

// 2. Interface stricte pour la Connexion (Email uniquement pour notre app)
export interface SignInCredentials {
  email: string;
  password: string;
}

// --- Fonction d'Inscription ---
export const signUp = async (credentials: SignUpCredentials): Promise<AuthResponse> => {
  const { email, password, options } = credentials;

  if (!email || !password) {
    throw new Error('Email et mot de passe sont requis.');
  }

  const response = await supabase.auth.signUp({
    email,
    password,
    options 
  });
  return response;
};

// --- Fonction de Connexion (CORRIGÉE) ---
export const signIn = async (credentials: SignInCredentials): Promise<AuthResponse> => {
    // TypeScript sait maintenant que 'email' existe obligatoirement dans SignInCredentials
    const { email, password } = credentials;

    if (!email || !password) {
        throw new Error('Email et mot de passe sont requis.');
    }

    // On passe l'objet à Supabase (qui est compatible avec la structure {email, password})
    const response = await supabase.auth.signInWithPassword(credentials);
    return response;
};

// --- Fonction de Déconnexion ---
export const signOut = async (): Promise<{ error: AuthError | null }> => {
    const response = await supabase.auth.signOut();
    return response;
};

// --- Fonction Utilitaires ---
export const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ?? null;
};

// --- Mise à jour du Profil ---
export const updateProfile = async (userId: string, profileData: Partial<UserProfile>) => {
  if (!userId) throw new Error("L'ID de l'utilisateur est manquant.");

  const updateData = {
    ...profileData,
    id: userId,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(updateData)
    .select()
    .single();

  if (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    throw error;
  }

  return data;
};