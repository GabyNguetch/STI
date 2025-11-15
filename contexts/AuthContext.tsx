// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/user/profile'; // <-- Importer le type du profil
import { useRouter } from 'next/navigation';


const supabase = createClient();

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null; // <-- AJOUT : pour stocker les données de la table 'profiles'
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null); // <-- AJOUT : état pour le profil
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getInitialData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(userProfile);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getInitialData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(userProfile);
      } else {
        setProfile(null); // Vider le profil à la déconnexion
      }

      setSession(session);
      setUser(session?.user ?? null);
      if (isLoading) setIsLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const value = {
    session,
    user,
    profile, // <-- Exposer le profil dans la valeur du contexte
    isLoading,
    signOut: async () => {
        await supabase.auth.signOut();
        router.push('/connexion'); // Optionnel : redirection après déconnexion
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};