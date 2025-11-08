'use client';
import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Authentification() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique d'authentification à implémenter
    console.log('Form submitted:', formData);
    
    // Si c'est une inscription, rediriger vers l'onboarding
    if (!isLogin) {
      router.push('/onboarding');
    } else {
      // Si c'est une connexion, rediriger vers la simulation
      router.push('/simulation');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      {/* Bouton retour */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-[#052648] hover:text-[#0a4d8f] transition-colors font-medium"
      >
        <ArrowLeft size={20} />
        <span>Retour à l'accueil</span>
      </Link>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Section gauche - Informations */}
        <div className="hidden lg:block space-y-6 p-8">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#052648] to-[#0a4d8f] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">FT</span>
            </div>
            <span className="text-3xl font-bold text-[#052648]">FullTang</span>
          </div>

          <h1 className="text-4xl font-bold text-[#052648] leading-tight">
            Rejoignez la Plateforme de Formation Médicale
          </h1>
          
          <p className="text-lg text-gray-600">
            Accédez à des centaines de cas cliniques et améliorez vos compétences diagnostiques.
          </p>

          <div className="space-y-4 pt-6">
            {[
              'Plus de 50 cas cliniques réalistes',
              'Feedback instantané sur vos diagnostics',
              'Suivi personnalisé de votre progression',
              'Accès 24/7 depuis n\'importe quel appareil'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-green-600" size={16} />
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section droite - Formulaire */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Toggle Login/Register */}
          <div className="relative flex gap-2 mb-8 p-1 bg-gray-100 rounded-lg">
            {/* Marqueur bleu animé */}
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-[#052648] rounded-lg shadow-md transition-all duration-300 ease-in-out ${
                isLogin ? 'left-1' : 'left-[calc(50%+0.25rem)]'
              }`}
            />
            
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 relative z-10 ${
                isLogin
                  ? 'text-white'
                  : 'text-gray-600 hover:text-[#052648]'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 relative z-10 ${
                !isLogin
                  ? 'text-white'
                  : 'text-gray-600 hover:text-[#052648]'
              }`}
            >
              Inscription
            </button>
          </div>

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
            {/* Nom complet (uniquement pour inscription) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent transition-all outline-none"
                    placeholder="Dr. Nanfah Elsa"
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
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-[#052648] hover:text-[#0a4d8f] font-semibold"
            >
              {isLogin ? 'Inscrivez-vous' : 'Connectez-vous'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
