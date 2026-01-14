// services/authService.ts

import { createClient } from '@/lib/supabaseClient';
import type { AuthError, AuthResponse, SignUpWithPasswordCredentials } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/user/profile'; 

const supabase = createClient();

// --- CORRECTION DU TYPAGE ICI ---
// Au lieu d'étendre 'SignUpWithPasswordCredentials' (qui peut être un type Union ambigu pour TS),
// nous définissons explicitement les champs attendus pour une inscription par Email.
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

// Fonction d'inscription (Sign Up) MISE À JOUR
export const signUp = async (credentials: SignUpCredentials): Promise<AuthResponse> => {
  const { email, password, options } = credentials;

  if (!email || !password) {
    throw new Error('Email et mot de passe sont requis.');
  }

  // Supabase accepte structurellement ces données
  const response = await supabase.auth.signUp({
    email,
    password,
    options 
  });
  return response;
};

// Fonction de connexion (Sign In)
export const signIn = async (credentials: SignUpWithPasswordCredentials): Promise<AuthResponse> => {
    // Dans le cas du SignIn, on garde le type Supabase générique car on passe l'objet directement
    const { email, password } = credentials;

    // Petite sécurité type pour s'assurer qu'on a bien l'email si c'est ce mode choisi
    if ('email' in credentials && (!email || !password)) {
        throw new Error('Email et mot de passe sont requis.');
    }

    const response = await supabase.auth.signInWithPassword(credentials);
    return response;
};

// Fonction de déconnexion (Sign Out)
export const signOut = async (): Promise<{ error: AuthError | null }> => {
    const response = await supabase.auth.signOut();
    return response;
};

// Fonction pour récupérer l'utilisateur actuel
export const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ?? null;
};

// Mettre à jour le profil utilisateur
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