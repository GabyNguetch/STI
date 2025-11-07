'use client';
import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, GraduationCap, Target, Heart, Award, Zap } from 'lucide-react';
import { UserProfile, UserLevel, PracticeFrequency, DifficultyLevel, SPECIALTIES, LEARNING_GOALS, CASE_TYPES } from '@/types/user/profile';
import { useRouter } from 'next/navigation';

export default function Onboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    email: '',
    level: 'student',
    areasOfInterest: [],
    learningGoals: [],
    practiceFrequency: 'weekly',
    difficultyPreference: 'beginner',
    preferredCaseTypes: []
  });

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Sauvegarder le profil et rediriger
      console.log('Profil complété:', profile);
      router.push('/profile');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile({ ...profile, [field]: value });
  };

  const toggleArrayItem = (field: keyof UserProfile, item: string) => {
    const currentArray = (profile[field] as string[]) || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateProfile(field, newArray);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#052648] to-[#0a4d8f] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">FT</span>
            </div>
            <span className="text-3xl font-bold text-[#052648]">FullTang</span>
          </div>
          <h1 className="text-3xl font-bold text-[#052648] mb-2">Bienvenue !</h1>
          <p className="text-gray-600">Configurons votre profil pour personnaliser votre expérience</p>
        </div>

        {/* Indicateur de progression */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step < currentStep 
                    ? 'bg-green-500 text-white' 
                    : step === currentStep 
                    ? 'bg-[#052648] text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step < currentStep ? <CheckCircle size={20} /> : step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-2 transition-all ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 px-2">
            <span>Profil</span>
            <span>Académique</span>
            <span>Objectifs</span>
            <span>Préférences</span>
          </div>
        </div>

        {/* Contenu des étapes */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 min-h-[500px]">
          {/* Étape 1: Informations de base */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#052648]/10 rounded-full flex items-center justify-center">
                  <GraduationCap className="text-[#052648]" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#052648]">Informations de base</h2>
                  <p className="text-gray-600">Parlez-nous un peu de vous</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => updateProfile('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent outline-none"
                  placeholder="Dr. elsa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateProfile('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent outline-none"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau d'études / Statut professionnel
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'student', label: 'Étudiant' },
                    { value: 'intern', label: 'Interne' },
                    { value: 'resident', label: 'Résident' },
                    { value: 'doctor', label: 'Médecin' },
                    { value: 'specialist', label: 'Spécialiste' }
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => updateProfile('level', level.value as UserLevel)}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        profile.level === level.value
                          ? 'border-[#052648] bg-[#052648] text-white'
                          : 'border-gray-300 text-gray-700 hover:border-[#052648]'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {(profile.level === 'student' || profile.level === 'intern') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année d'études
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={profile.yearOfStudy || ''}
                    onChange={(e) => updateProfile('yearOfStudy', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent outline-none"
                    placeholder="Ex: 3"
                  />
                </div>
              )}
            </div>
          )}

          {/* Étape 2: Informations académiques */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#052648]/10 rounded-full flex items-center justify-center">
                  <Heart className="text-[#052648]" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#052648]">Spécialisation</h2>
                  <p className="text-gray-600">Quels domaines vous intéressent ?</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Université (optionnel)
                </label>
                <input
                  type="text"
                  value={profile.university || ''}
                  onChange={(e) => updateProfile('university', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent outline-none"
                  placeholder="Ex: Université de Yaoundé"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spécialité principale (optionnel)
                </label>
                <select
                  value={profile.specialty || ''}
                  onChange={(e) => updateProfile('specialty', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent outline-none"
                >
                  <option value="">Sélectionnez une spécialité</option>
                  {SPECIALTIES.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Domaines d'intérêt (sélectionnez plusieurs)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {SPECIALTIES.map((specialty) => (
                    <button
                      key={specialty}
                      onClick={() => toggleArrayItem('areasOfInterest', specialty)}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        profile.areasOfInterest?.includes(specialty)
                          ? 'border-[#052648] bg-[#052648] text-white'
                          : 'border-gray-300 text-gray-700 hover:border-[#052648]'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Étape 3: Objectifs d'apprentissage */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#052648]/10 rounded-full flex items-center justify-center">
                  <Target className="text-[#052648]" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#052648]">Vos objectifs</h2>
                  <p className="text-gray-600">Que souhaitez-vous accomplir ?</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Objectifs d'apprentissage (sélectionnez plusieurs)
                </label>
                <div className="space-y-3">
                  {LEARNING_GOALS.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => toggleArrayItem('learningGoals', goal)}
                      className={`w-full px-4 py-3 rounded-lg border-2 text-left font-medium transition-all flex items-center justify-between ${
                        profile.learningGoals?.includes(goal)
                          ? 'border-[#052648] bg-[#052648] text-white'
                          : 'border-gray-300 text-gray-700 hover:border-[#052648]'
                      }`}
                    >
                      {goal}
                      {profile.learningGoals?.includes(goal) && <CheckCircle size={20} />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Examen cible (optionnel)
                </label>
                <input
                  type="text"
                  value={profile.targetExam || ''}
                  onChange={(e) => updateProfile('targetExam', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent outline-none"
                  placeholder="Ex: ECN, Concours d'internat"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Fréquence de pratique souhaitée
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'daily', label: 'Quotidienne', icon: Zap },
                    { value: 'weekly', label: 'Hebdomadaire', icon: Award },
                    { value: 'occasional', label: 'Occasionnelle', icon: Target }
                  ].map((freq) => (
                    <button
                      key={freq.value}
                      onClick={() => updateProfile('practiceFrequency', freq.value as PracticeFrequency)}
                      className={`px-4 py-4 rounded-lg border-2 font-medium transition-all flex flex-col items-center gap-2 ${
                        profile.practiceFrequency === freq.value
                          ? 'border-[#052648] bg-[#052648] text-white'
                          : 'border-gray-300 text-gray-700 hover:border-[#052648]'
                      }`}
                    >
                      <freq.icon size={24} />
                      <span className="text-sm">{freq.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Étape 4: Préférences */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#052648]/10 rounded-full flex items-center justify-center">
                  <Award className="text-[#052648]" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#052648]">Préférences</h2>
                  <p className="text-gray-600">Personnalisez votre expérience</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Niveau de difficulté préféré
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'beginner', label: 'Débutant', color: 'green' },
                    { value: 'intermediate', label: 'Intermédiaire', color: 'yellow' },
                    { value: 'advanced', label: 'Avancé', color: 'red' }
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => updateProfile('difficultyPreference', level.value as DifficultyLevel)}
                      className={`px-4 py-4 rounded-lg border-2 font-medium transition-all ${
                        profile.difficultyPreference === level.value
                          ? 'border-[#052648] bg-[#052648] text-white'
                          : 'border-gray-300 text-gray-700 hover:border-[#052648]'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Types de cas préférés (sélectionnez plusieurs)
                </label>
                <div className="space-y-3">
                  {CASE_TYPES.map((caseType) => (
                    <button
                      key={caseType}
                      onClick={() => toggleArrayItem('preferredCaseTypes', caseType)}
                      className={`w-full px-4 py-3 rounded-lg border-2 text-left font-medium transition-all flex items-center justify-between ${
                        profile.preferredCaseTypes?.includes(caseType)
                          ? 'border-[#052648] bg-[#052648] text-white'
                          : 'border-gray-300 text-gray-700 hover:border-[#052648]'
                      }`}
                    >
                      {caseType}
                      {profile.preferredCaseTypes?.includes(caseType) && <CheckCircle size={20} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Profil presque terminé !</h3>
                    <p className="text-sm text-green-700">
                      Cliquez sur "Terminer" pour commencer votre parcours d'apprentissage personnalisé.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Boutons de navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ArrowLeft size={20} />
              Précédent
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-[#052648] text-white rounded-lg font-semibold hover:bg-[#0a4d8f] transition-all shadow-lg hover:shadow-xl"
            >
              {currentStep === totalSteps ? 'Terminer' : 'Suivant'}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Lien pour passer */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/simulation')}
            className="text-gray-500 hover:text-[#052648] text-sm font-medium transition-colors"
          >
            Passer cette étape pour le moment
          </button>
        </div>
      </div>
    </div>
  );
}
