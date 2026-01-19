'use client';

import React, { useState } from 'react';
import { Mail, Lock, UserPlus, Eye, EyeOff, HeartPulse, Star, Package, Users, UserRound, KeyRound } from 'lucide-react';
import Link from 'next/link';
import type { AuthResponse, User } from '@supabase/supabase-js'; // <-- Importer le type User
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { signIn, signUp } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSuccess?: () => void;
}

export default function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const router = useRouter();
  const { login, saveTempRegistration } = useAuth(); // Utilisation du nouveau context
  const isLogin = mode === 'login';
  
  const [showMatricule, setShowMatricule] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // États formulaire
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [matricule, setMatricule] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast.dismiss();

    try {
      if (isLogin) {
        // --- LOGIQUE CONNEXION ---
        if (!email || !matricule) throw new Error("Email et matricule requis.");
        
        await login(email, matricule); 
        // La redirection vers /dashboard est gérée dans AuthContext
      } else {
        // --- LOGIQUE INSCRIPTION (ÉTAPE 1) ---
        if (!name.trim() || !email.trim()) throw new Error("Nom et Email sont requis.");
        
        // 1. Sauvegarder dans le contexte temporaire
        saveTempRegistration({
            nom: name,
            email: email
        });

        toast.success("Parfait ! Configurons votre profil.");
        
        // 2. Passer au composant Onboarding
        if (onSuccess) onSuccess(); 
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-48 items-center">
        <div className="hidden lg:block bg-transparent">
          {/* Logo et nom */}
          <div className="flex flex-col items-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-[#052648] to-[#0a4d8f] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Link href='/'><HeartPulse className='text-white h-10 w-10' /></Link> 
            </div>
            <span className="text-4xl font-bold text-[#052648] mb-2">The Good Doctor</span>
            <p className="text-gray-600 text-center text-lg">
              Gérez votre formation médicale avec notre plateforme intuitive.
            </p>
          </div>

          {/* Tagline */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#082038ff' }}>
              Simple • Sécurisé • Efficace
            </h2>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="text-teal-600" size={24} />
              </div>
              <div className="text-3xl font-bold text-[#052648] mb-1">500+</div>
              <div className="text-sm text-gray-600">Étudiants actifs</div>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Package className="text-blue-600" size={24} />
              </div>
              <div className="text-3xl font-bold text-[#052648] mb-1">50+</div>
              <div className="text-sm text-gray-600">Cas cliniques</div>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Star className="text-purple-600" size={24} />
              </div>
              <div className="text-3xl font-bold text-[#052648] mb-1">4.8/5</div>
              <div className="text-sm text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Section droite - Formulaire */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          
          {/* Titre */}
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-[#052648] mb-2">
              {isLogin ? 'Bon retour !' : 'Créer un compte'}
            </h2>
            <p className="text-gray-600">
              {isLogin
                ? 'Connectez-vous pour continuer votre formation'
                : 'Commencez votre parcours de formation médicale'}
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* AJOUT : Champ pour le nom complet, uniquement en mode inscription */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserRound className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent transition-all outline-none"
                    placeholder="Votre nom complet..."
                    required={!isLogin}
                  />
                </div>
              </div>
            )}
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent transition-all outline-none"
                  placeholder="Par exemple nom@universite.cm"
                  required
                />
              </div>
            </div>

          {/* MATRICULE (Login Uniquement) */}
          {/* Lors de l'inscription, le matricule est généré auto, donc on ne le demande pas */}
          {isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Matricule</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type={showMatricule ? 'text' : 'password'}
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-[#052648] outline-none transition-all font-mono"
                  placeholder="Votre ID (Ex: ELSA-12345)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowMatricule(!showMatricule)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showMatricule ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}


            {/* Mot de passe oublié (uniquement pour connexion) */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#052648] border-gray-300 rounded focus:ring-[#052648]"
                  />
                  <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
                </label>
                <a href="#" className="text-sm text-[#052648] hover:text-[#0a4d8f] font-medium">
                  Vous avez oublié votre matricule ?
                </a>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#052648] text-white rounded-lg font-bold text-lg hover:bg-[#0a4d8f] transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? 'Traitement...' : (isLogin ? 'Se connecter' : 'Configurer mon profil')}
            </button>
          </form>

          {/* Lien vers l'autre formulaire */}
          <p className="mt-8 text-center text-gray-600">
            {isLogin ? "Vous n'avez pas de compte ?" : 'Vous avez déjà un compte ?'}
            <Link
              href={isLogin ? '/inscription' : '/connexion'}
              className="ml-2 text-[#052648] hover:text-[#0a4d8f] font-semibold"
            >
              {isLogin ? 'Inscrivez-vous' : 'Connectez-vous'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}