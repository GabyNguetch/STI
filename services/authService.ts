// services/authService.ts

import { createClient } from '@/lib/supabaseClient';
import type { AuthError, AuthResponse, SignUpWithPasswordCredentials } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/user/profile'; // Assurez-vous d'importer votre type

const supabase = createClient();

// Type étendu pour l'inscription incluant le nom
interface SignUpCredentials extends SignUpWithPasswordCredentials {
  options?: {
    data: {
      username?: string;
      [key: string]: any;
    }
  }
}

// Fonction d'inscription (Sign Up) MISE À JOUR
export const signUp = async (credentials: SignUpCredentials): Promise<AuthResponse> => {
  const { email, password, options } = credentials;

  if (!email || !password) {
    throw new Error('Email et mot de passe sont requis.');
  }

  // L'objet options.data sera stocké dans raw_user_meta_data et utilisé par notre trigger SQL
  const response = await supabase.auth.signUp({
    email,
    password,
    options 
  });
  return response;
};

// Fonction de connexion (Sign In) - Inchangée
export const signIn = async (credentials: SignUpWithPasswordCredentials): Promise<AuthResponse> => {
    // ... (code inchangé)
    const { email, password } = credentials;

    if (!email || !password) {
        throw new Error('Email et mot de passe sont requis.');
    }

    const response = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return response;
};

// Fonction de déconnexion (Sign Out) - Inchangée
export const signOut = async (): Promise<{ error: AuthError | null }> => {
    // ... (code inchangé)
    const response = await supabase.auth.signOut();
    return response;
};

// Fonction pour récupérer l'utilisateur actuel - Inchangée
export const getCurrentUser = async () => {
    // ... (code inchangé)
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ?? null;
};

// NOUVELLE FONCTION : Mettre à jour le profil utilisateur
export const updateProfile = async (userId: string, profileData: Partial<UserProfile>) => {
  if (!userId) throw new Error("L'ID de l'utilisateur est manquant.");

  const updateData = {
    ...profileData,
    id: userId, // Utiliser l'ID fourni
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