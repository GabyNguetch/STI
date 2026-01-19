// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LearnerResponse, 
  LearnerCreate, 
  loginLearner, 
  createLearner, 
  getLearnerMe 
} from '@/services/learnerService';
import toast from 'react-hot-toast';

// Type pour les données temporaires (ce qu'on remplit dans AuthForm)
interface TempData {
  nom: string;
  email: string;
  // Le reste sera rempli dans Onboarding
}

interface AuthContextType {
  user: LearnerResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Stockage temporaire inscription (Etape 1 -> Etape 2)
  tempRegistrationData: TempData | null;
  saveTempRegistration: (data: TempData) => void;
  
  // Actions
  finalizeRegistration: (completeData: LearnerCreate) => Promise<void>;
  login: (email: string, matricule: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<LearnerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Données temporaires conservées dans l'état (ou LocalStorage si on veut persistance au refresh)
  const [tempRegistrationData, setTempDataState] = useState<TempData | null>(null);

  // --- Initialisation : Vérifier si déjà connecté ---
  useEffect(() => {
    const initAuth = async () => {
      // Restaurer temp data si refresh page
      const savedTemp = localStorage.getItem('temp_reg_data');
      if (savedTemp) setTempDataState(JSON.parse(savedTemp));

      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const userData = await getLearnerMe(token);
          setUser(userData);
        } catch {
          logout(); // Token invalide
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // 1. Sauvegarder nom/email temporairement
  const saveTempRegistration = (data: TempData) => {
    setTempDataState(data);
    localStorage.setItem('temp_reg_data', JSON.stringify(data));
  };

  // 2. Finaliser inscription (Appelé à la fin du Onboarding)
  const finalizeRegistration = async (completeData: LearnerCreate) => {
    try {
      setIsLoading(true);
      // a. Créer l'apprenant en base
      await createLearner(completeData);
      
      // b. Auto-login pour récupérer le token
      await login(completeData.email, completeData.matricule);
      
      // c. Nettoyer
      localStorage.removeItem('temp_reg_data');
      setTempDataState(null);
      
      // Pas de redirection ici, on laisse le composant UI gérer l'affichage du succès
    } catch (error: any) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, matricule: string) => {
    try {
      setIsLoading(true);
      const { access_token } = await loginLearner({ email, matricule });
      
      // Stockage Token
      localStorage.setItem('access_token', access_token);
      
      // Chargement profil
      const userProfile = await getLearnerMe(access_token);
      setUser(userProfile);
      
      toast.success(`Bienvenue, Dr. ${userProfile.nom} !`);
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    router.push('/connexion');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      tempRegistrationData,
      saveTempRegistration,
      finalizeRegistration, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};