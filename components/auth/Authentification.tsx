'use client';

import React, { useState } from 'react';
import { Mail, Lock, UserPlus, Eye, EyeOff, HeartPulse, Star, Package, Users, UserRound } from 'lucide-react';
import Link from 'next/link';
import type { AuthResponse, User } from '@supabase/supabase-js'; // <-- Importer le type User
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { signIn, signUp } from '@/services/authService';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSuccess?: (user: User) => void;
}

export default function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const router = useRouter();
  const isLogin = mode === 'login';
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', // Utilisé pour l'inscription
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast.dismiss();

    const { name, email, password, confirmPassword } = formData;

    if (!isLogin) {
      if (!name.trim()) {
        toast.error("Le nom complet est requis.");
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Les mots de passe ne correspondent pas.");
        setIsLoading(false);
        return;
      }
    }

    try {
      let response: AuthResponse;
      if (isLogin) {
        response = await signIn({ email, password });
      } else {
        response = await signUp({
          email,
          password,
          options: {
            data: {
              username: name 
            }
          }
        });
      }
      
      if (response.error) { throw response.error; }

      if (isLogin) {
        toast.success('Connexion réussie ! Redirection...');
        router.push('/simulation');
        router.refresh();
      } else {
        // MODIFIÉ : On vérifie que `response.data.user` existe et on le passe à `onSuccess`
        if (onSuccess && response.data.user) {
          toast.success('Compte créé ! Complétez votre profil.');
          onSuccess(response.data.user); // On passe l'objet utilisateur au parent
        } else {
            throw new Error("Erreur: L'objet utilisateur n'a pas été retourné après l'inscription.");
        }
      }
    } catch (error: any) {
      console.error("Erreur d'authentification:", error);
      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Adresse email ou mot de passe incorrect.';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'Un utilisateur avec cet email existe déjà.';
      } else if (error.message.includes('Password should be at least 6 characters')) {
        errorMessage = 'Le mot de passe doit faire au moins 6 caractères.';
      }
      toast.error(errorMessage);
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
            <span className="text-4xl font-bold text-[#052648] mb-2">FullTang</span>
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
          <div className="mb-8">
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
          <form onSubmit={handleSubmit} className="space-y-5">
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
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent transition-all outline-none"
                    placeholder="Ex: Jean Dupont"
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
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent transition-all outline-none"
                  placeholder="example@gmail.com"
                  required
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#052648] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirmer mot de passe (uniquement pour inscription) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                    required={!isLogin}
                  />
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
                  Mot de passe oublié ?
                </a>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              className="w-full py-4 bg-[#052648] text-white rounded-lg font-semibold text-lg hover:bg-[#0a4d8f] transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] transform"
            >
              {isLogin ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          {/* Séparateur */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Ou continuer avec</span>
            </div>
          </div>

          {/* Connexion sociale */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium text-gray-700">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium text-gray-700">
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

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