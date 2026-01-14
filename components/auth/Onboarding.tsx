// components/auth/Onboarding.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // AJOUT
import toast from 'react-hot-toast'; // AJOUT

import { 
  ArrowRight, ArrowLeft, CheckCircle, GraduationCap, Target, Heart, Award, Zap, 
  User, BookOpen, BarChart3, HeartPulse, Stethoscope, Microscope, 
  ListChecks, Hourglass, Sparkles, Trophy, Calendar
} from 'lucide-react';
// Importation des composants UI
import { Button } from '@/components/ui/Button';
import type { User as SuperBaseUser } from '@supabase/supabase-js'; // <-- Importer le type User
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

// AJOUT : Importation du service pour mettre à jour le profil
import { updateProfile as updateProfileService } from '@/services/authService';
import { UserProfile, UserLevel, PracticeFrequency, DifficultyLevel } from '@/types/user/profile';
import { useAuth } from '@/contexts/AuthContext';

// Mock des types (peut être remplacé par des imports depuis un fichier de types centralisé)
const SPECIALTIES = ['Cardiologie', 'Neurologie', 'Pédiatrie', 'Chirurgie', 'Dermatologie', 'Psychiatrie', 'Médecine Interne', 'Gynécologie'];
const LEARNING_GOALS = ['Préparer les examens', 'Améliorer le diagnostic', 'Approfondir les connaissances', 'Formation continue'];
const CASE_TYPES = ["Cas d'urgence", 'Cas complexes', 'Cas pédagogiques', 'Cas rares'];

// Sous-composant pour le guide
const stepGuides = [
  {
    icon: User,
    title: "Votre Profil Professionnel",
    description: "Définissez votre niveau, de l'étudiant à l'expert, pour accéder à des défis adaptés.",
    gradient: "from-[#052648] to-blue-900"
  },
  {
    icon: BookOpen,
    title: "Vos Domaines d'Étude",
    description: "Indiquez les spécialités qui vous passionnent pour recevoir des cas cliniques pertinents.",
    gradient: "from-[#052648] to-blue-900"
  },
  {
    icon: Target,
    title: "Cap sur Vos Objectifs",
    description: "Définissez vos ambitions pour créer un parcours sur mesure pour votre réussite.",
    gradient: "from-[#052648] to-blue-900"
  },
  {
    icon: BarChart3,
    title: "Votre Style d'Apprentissage",
    description: "Ajustons l'expérience selon votre rythme et vos préférences de difficulté.",
    gradient: "from-[#052648] to-blue-900"
  },
];

// CORRECTION : Typage explicite de la prop 'step'
const OnboardingGuide = ({ step }: { step: number }) => {
  const guide = stepGuides[step - 1];
  const Icon = guide.icon;

  return (
    <div className="flex flex-col text-center sticky top-8">
      <div className="flex items-center gap-3 mb-12 justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#052648] to-blue-900 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
          <div className="relative w-14 h-14 bg-gradient-to-br from-[#052648] to-blue-900 rounded-2xl flex items-center justify-center shadow-2xl">
            <HeartPulse className='text-white h-7 w-7' />
          </div>
        </div>
        <span className="text-3xl font-bold bg-gradient-to-r from-[#052648] to-blue-900 bg-clip-text text-transparent">FullTang</span>
      </div>
      <div className="relative group">
        <div className={`absolute -inset-1 bg-gradient-to-r ${guide.gradient} rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-300`}></div>
        <div className="relative bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-8 shadow-2xl">
          <div className={`w-20 h-20 bg-gradient-to-br ${guide.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:scale-110 transition duration-300`}>
            <Icon size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#052648] mb-3">{guide.title}</h2>
          <p className="text-slate-600 leading-relaxed">{guide.description}</p>
          <div className="flex gap-2 justify-center mt-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${ i + 1 === step ? 'w-8 bg-gradient-to-r ' + guide.gradient : 'w-1.5 bg-slate-300'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface OnboardingProps {
user?: SuperBaseUser | null;
}

export default function Onboarding({ user: propUser }: OnboardingProps = {}) {
  const router = useRouter(); // AJOUT
  const { user: contextUser } = useAuth();
// Utilise l'utilisateur passé en prop (inscription) OU celui du contexte (déjà connecté)
  const user = propUser || contextUser;
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false); // AJOUT
  const totalSteps = 4;

  const [profile, setProfile] = useState<Partial<UserProfile>>({
    username: user?.user_metadata.username || '', // On peut pré-remplir avec le nom de l'inscription
    level: 'student',
    university: '',
    areasOfInterest: [],
    learningGoals: [],
    practiceFrequency: 'weekly',
    difficultyPreference: 'beginner',
    preferredCaseTypes: []
  });

  const updateProfile = (field: keyof UserProfile, value: any) => setProfile({ ...profile, [field]: value });
  
  const toggleArrayItem = (field: keyof UserProfile, item: string) => {
    const currentArray = (profile[field] as string[]) || [];
    const newArray = currentArray.includes(item) ? currentArray.filter(i => i !== item) : [...currentArray, item];
    updateProfile(field, newArray);
  };

  const saveOnboardingProfile = async () => {
    // On a maintenant la certitude d'avoir l'utilisateur via la prop !
    if (!user) {
        toast.error("Une erreur critique est survenue. Session utilisateur introuvable.");
        router.push('/connexion');
        return;
    }

    setIsLoading(true);
    toast.loading('Finalisation de votre profil...');

    try {
      const { username, ...profileDataToUpdate } = profile;
      
      // On utilise l'ID de l'utilisateur reçu via les props
      await updateProfileService(user.id, profileDataToUpdate);

      toast.dismiss();
      toast.success('Profil enregistré ! Bienvenue !');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      toast.dismiss();
      toast.error("Une erreur est survenue lors de l'enregistrement de votre profil.");
      console.error("Erreur d'onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  // MODIFIÉ : Logique de gestion du clic sur le bouton "Suivant" / "Terminer"
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // A la dernière étape, on déclenche la sauvegarde
      saveOnboardingProfile();
    }
  };

  const handleBack = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const levelOptions = [
    { value: 'student', label: 'Étudiant', icon: GraduationCap },
    { value: 'intern', label: 'Interne', icon: Stethoscope },
    { value: 'resident', label: 'Résident', icon: Microscope },
    { value: 'doctor', label: 'Médecin', icon: Heart },
    { value: 'specialist', label: 'Spécialiste', icon: Award }
  ];

  // Le rendu de chaque étape reste le même (renderStepContent)
  // Assurez-vous simplement que le `name` est renommé en `username` dans le `useState` et dans la première étape
  const renderStepContent = () => {
    // Le code de renderStepContent reste identique, juste le champ 'name' est maintenant 'username'
    switch (currentStep) {
        case 1:
          return (
            <div className="space-y-6">
              <div>
                <Label htmlFor="username">Nom complet (celui utilisé à l'inscription)</Label>
                <Input 
                  id="username" 
                  type="text" 
                  value={profile.username} 
                  onChange={(e) => updateProfile('username', e.target.value)} 
                  placeholder="Ce champ est hérité de l'inscription"
                  // On pourrait le rendre readOnly si on le chargeait au démarrage
                />
              </div>
              <div>
                <Label>Votre statut professionnel</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {levelOptions.map((level) => {
                    const Icon = level.icon;
                    const isSelected = profile.level === level.value;
                    return (
                      <button key={level.value} onClick={() => updateProfile('level', level.value as UserLevel)} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${isSelected ? 'bg-gradient-to-br from-[#052648] to-blue-900 text-white border-transparent shadow-lg scale-105' : 'bg-white border-slate-200 text-slate-700 hover:border-[#052648] hover:shadow-md'}`}>
                        <Icon size={24} />
                        <span className="text-sm font-medium">{level.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
      // Les `case` 2, 3 et 4 restent exactement les mêmes que dans votre code original
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="university">Université (optionnel)</Label>
              <Input 
                id="university" 
                value={profile.university} 
                onChange={(e) => updateProfile('university', e.target.value)} 
                placeholder="Ex: Université de Yaoundé"
              />
            </div>
            <div>
              <Label>Domaines d'intérêt</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2">
                {SPECIALTIES.map((specialty) => {
                  const isSelected = profile.areasOfInterest?.includes(specialty);
                  return (
                    <button
                      key={specialty}
                      onClick={() => toggleArrayItem('areasOfInterest', specialty)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                        isSelected 
                          ? 'bg-gradient-to-br from-[#052648] to-blue-900 text-white border-transparent shadow-lg' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-[#052648] hover:shadow-md'
                      }`}
                    >
                      {isSelected && <CheckCircle size={16} />}
                      {specialty}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>Objectifs d'apprentissage</Label>
              <div className="space-y-3">
                {LEARNING_GOALS.map((goal) => {
                  const isSelected = profile.learningGoals?.includes(goal);
                  return (
                    <button
                      key={goal}
                      onClick={() => toggleArrayItem('learningGoals', goal)}
                      className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected 
                          ? 'bg-gradient-to-br from-[#052648] to-blue-900 text-white border-transparent shadow-lg' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-[#052648] hover:shadow-md'
                      }`}
                    >
                      {isSelected ? <CheckCircle size={20} /> : <Target size={20} />}
                      <span className="font-medium">{goal}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Fréquence de pratique</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'daily', label: 'Quotidienne', icon: Zap }, 
                  { value: 'weekly', label: 'Hebdomadaire', icon: Calendar }, 
                  { value: 'occasional', label: 'Occasionnelle', icon: Hourglass }
                ].map((freq) => {
                  const Icon = freq.icon;
                  const isSelected = profile.practiceFrequency === freq.value;
                  return (
                    <button
                      key={freq.value}
                      onClick={() => updateProfile('practiceFrequency', freq.value as PracticeFrequency)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                        isSelected 
                          ? 'bg-gradient-to-br from-[#052648] to-blue-900 text-white border-transparent shadow-lg scale-105' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-[#052648] hover:shadow-md'
                      }`}
                    >
                      <Icon size={24} />
                      <span className="text-xs font-medium text-center">{freq.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label>Niveau de difficulté préféré</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'beginner', label: 'Débutant', icon: '🌱' }, 
                  { value: 'intermediate', label: 'Intermédiaire', icon: '🚀' }, 
                  { value: 'advanced', label: 'Avancé', icon: '⚡' }
                ].map((level) => {
                  const isSelected = profile.difficultyPreference === level.value;
                  return (
                    <button
                      key={level.value}
                      onClick={() => updateProfile('difficultyPreference', level.value as DifficultyLevel)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                        isSelected 
                          ? 'bg-gradient-to-br from-[#052648] to-blue-900 text-white border-transparent shadow-lg scale-105' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-[#052648] hover:shadow-md'
                      }`}
                    >
                      <span className="text-2xl">{level.icon}</span>
                      <span className="text-sm font-medium">{level.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Types de cas préférés</Label>
              <div className="space-y-3">
                {CASE_TYPES.map((caseType) => {
                  const isSelected = profile.preferredCaseTypes?.includes(caseType);
                  return (
                    <button
                      key={caseType}
                      onClick={() => toggleArrayItem('preferredCaseTypes', caseType)}
                      className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected 
                          ? 'bg-gradient-to-br from-[#052648] to-blue-900 text-white border-transparent shadow-lg' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-[#052648] hover:shadow-md'
                      }`}
                    >
                      {isSelected ? <CheckCircle size={20} /> : <ListChecks size={20} />}
                      <span className="font-medium">{caseType}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
        <div className="hidden lg:block">
          <OnboardingGuide step={currentStep} />
        </div>
        <Card className="w-full">
          <CardHeader>
            <div className="relative h-2 w-full bg-slate-200 rounded-full mb-6 overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#052648] to-blue-900 rounded-full transition-all duration-500 ease-out shadow-lg" style={{ width: `${(currentStep / totalSteps) * 100}%` }}/>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="text-[#052648]" size={20} />
              <h1 className="text-2xl font-bold text-center text-[#052648]">
                Étape {currentStep} sur {totalSteps}
              </h1>
            </div>
          </CardHeader>

          <CardContent className="min-h-[350px]">
            {renderStepContent()}
          </CardContent>

          <CardFooter className="flex-col gap-4">
            <div className="flex justify-between w-full gap-3">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isLoading} className="flex-1">
                <ArrowLeft size={18} className="mr-2"/> Précédent
              </Button>
              {/* Le bouton gère l'état de chargement */}
              <Button onClick={handleNext} disabled={isLoading} className="flex-1">
                {isLoading ? 'Enregistrement...' : currentStep === totalSteps ? (
                  <>Terminer <Trophy size={18} className="ml-2"/></>
                ) : (
                  <>Suivant <ArrowRight size={18} className="ml-2"/></>
                )}
              </Button>
            </div>
            <Button variant="link" onClick={() => router.push('/dashboard')} disabled={isLoading}>
              Passer pour le moment
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}