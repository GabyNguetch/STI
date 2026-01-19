'use client';

import React, { useEffect, useState } from 'react';
import { 
  Stethoscope, Activity, Calendar, Trophy, ArrowRight, Brain, 
  Target, Zap, CheckCircle2, Star, BookOpen, Sparkles, 
  TrendingUp, Award, Flame, GraduationCap, ClipboardList,
  HeartPulse,
  AlertCircle,
  Copy,
  Rocket
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LearnerCreate } from '@/services/learnerService';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { services } from '@/types/simulation/constant';

// Images mappées aux étapes
const STEP_IMAGES = {
  1: "/images/on1.png",
  2: "/images/on2.png",
  3: "/images/on3.png",
  4: "/images/on-4.jpeg"
};

export default function Onboarding() {
  const { tempRegistrationData, finalizeRegistration } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    diagnosticLevel: 'debutant',
    frequency: 'daily',
    startMode: 'basics' as 'basics' | 'test_level'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATES DU FORMULAIRE ---
  // Mappe vers 'niveau_etudes' (backend)
  const [level, setLevel] = useState("Etudiant"); 
  
  // Mappe vers 'specialite_visee' (backend) - par défaut
  const [specialty, setSpecialty] = useState("Médecine Générale");
  
  // Frequency pour l'UX (optionnel pour backend, ou peut être ajouté plus tard)
  const [frequency, setFrequency] = useState('daily');
  
  // Résultat final : matricule généré APRES succès
  const [successMatricule, setSuccessMatricule] = useState<string | null>(null);

  const [language, setLanguage] = useState("Français"); // langue_preferee

    // Si on perd les données temporaires (refresh), retour à l'inscription
  useEffect(() => {
    if (!tempRegistrationData || !tempRegistrationData.email) {
      toast.error("Session expirée, veuillez recommencer.");
      router.push('/inscription');
    }
  }, [tempRegistrationData, router]);
  
// --- LOGIQUE FINALE ---
  const handleFinalSubmit = async (modeStart: 'basics' | 'test_level') => {
    if (!tempRegistrationData) return;
    setIsSubmitting(true);

    try {
        // 1. GÉNÉRER MATRICULE : INIT + TIMESTAMP (Ex: ELS-17361599)
        const namePart = (tempRegistrationData.nom || 'UNK').substring(0, 3).toUpperCase();
        const timePart = Date.now().toString().slice(-8); // Derniers 8 chiffres pour être concis
        const generatedMatricule = `${namePart}-${timePart}`;

        // 2. CONSTRUIRE L'OBJET REQUIS PAR LE BACKEND (/learners/)
        const finalPayload: LearnerCreate = {
            matricule: generatedMatricule,
            nom: tempRegistrationData.nom || "",
            email: tempRegistrationData.email || "",
            niveau_etudes: level, // Issu de l'étape 1
            specialite_visee: specialty, // Dropdown ajouté à étape 2 si voulu ou par défaut
            langue_preferee: "Français", // Hardcodé
            date_inscription: new Date().toISOString()
        };

        // 3. ENVOYER AU CONTEXT POUR API (CREATE + LOGIN)
        await finalizeRegistration(finalPayload);
        
        // 4. SI SUCCÈS -> Afficher la vue de fin avec Matricule
        setSuccessMatricule(generatedMatricule);
        setStep(6); // Une 5ème étape virtuelle "Succès"

    } catch (e: any) {
        toast.error("Échec création: " + e.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- VUE SUCCESS (Matricule Visible) ---
  if (step === 6 && successMatricule) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
             <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-10 shadow-2xl text-center animate-in zoom-in-95">
                 <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Rocket size={48} className="text-green-600"/>
                 </div>
                 
                 <h2 className="text-3xl font-bold text-[#052648] mb-4">Compte créé avec succès !</h2>
                 <p className="text-slate-600 mb-8">Votre espace apprenant est prêt. Voici votre identifiant unique à conserver précieusement.</p>

                 {/* Carte Matricule */}
                 <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 mb-8 max-w-sm mx-auto">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Votre Matricule</p>
                      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
                          <span className="font-mono text-2xl font-bold text-[#052648] tracking-widest">{successMatricule}</span>
                          <button 
                             onClick={() => {navigator.clipboard.writeText(successMatricule); toast.success("Copié !");}}
                             className="p-2 hover:bg-slate-100 rounded-full transition"
                             title="Copier"
                          >
                             <Copy size={20} className="text-blue-500"/>
                          </button>
                      </div>
                      <div className="mt-3 flex gap-2 items-start justify-center text-xs text-amber-600 bg-amber-50 p-2 rounded">
                          <AlertCircle size={14} className="shrink-0 mt-0.5"/>
                          <span>Notez-le, il sera demandé à chaque connexion.</span>
                      </div>
                 </div>

                 <button 
                    onClick={() => router.push('/dashboard')}
                    className="w-full max-w-xs bg-[#052648] text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl"
                 >
                     Accéder à mon dashboard
                 </button>
             </div>
        </div>
      );
  }

  // ÉTAPE 1: Jauge de Connaissance
  const Step1 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
      {/* Image à gauche - 2 colonnes */}
      <div className="hidden lg:block lg:col-span-2 relative h-full min-h-[500px] rounded-2xl overflow-hidden">
        <img 
          src={STEP_IMAGES[1]} 
          alt="Patient avec douleur thoracique"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%23052648" width="400" height="500"/%3E%3Ctext fill="white" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="24"%3EDouleur thoracique%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>

      {/* Contenu à droite - 3 colonnes */}
      <div className="lg:col-span-3 space-y-2 flex flex-col justify-center animate-in slide-in-from-right duration-700">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-[#052648]">Petite mise en situation...</h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            Vous êtes en balade avec votre ami. Il s'arrête brutalement, la main crispée sur la poitrine, en sueur froide. Pas de matériel, juste vos mains et votre tête. Quelle est votre réaction immédiate ?
          </p>
        </div>

        <div className="space-y-3 pt-4">
          {[
            { id: 'debutant', icon: GraduationCap, label: "Je panique et j'appelle un taxi", sub: "La pression est trop forte, j'ai peur de mal faire.", color: "hover:border-blue-500 hover:bg-blue-50", iconColor: "text-blue-600" },
            { id: 'interne', icon: TrendingUp, label: "Je gère la foule et les premiers gestes", sub: "J'écarte les curieux, je le mets au repos, je prends le pouls", color: "hover:border-orange-500 hover:bg-orange-50", iconColor: "text-orange-600" },
            { id: 'resident', icon: Award, label: "J'interroge et je stratifie le risque", sub: "Je cherche l'irradiation (bras/mâchoire) et les antécédents familiaux avant d'évacuer.", color: "hover:border-emerald-500 hover:bg-emerald-50", iconColor: "text-emerald-600" },
          ].map((opt) => (
            <button 
              key={opt.id}
              onClick={() => {
                setPreferences({...preferences, diagnosticLevel: opt.id});
                setTimeout(() => setStep(2), 200);
              }}
              className={`w-full flex items-center gap-4 p-5 bg-white border-2 border-slate-200 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] text-left group ${opt.color}`}
            >
              <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                <opt.icon size={28} className={`text-slate-600 group-hover:${opt.iconColor}`} />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-slate-800 block text-lg">{opt.label}</span>
                <span className="text-sm text-slate-500">{opt.sub}</span>
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-[#052648] transition-colors" size={20} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ÉTAPE 2: Showcase des capacités
  const Step2 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
      <div className="hidden lg:block lg:col-span-2 relative h-full min-h-[500px] rounded-2xl overflow-hidden">
        <img 
          src={STEP_IMAGES[2]} 
          alt="IA Tuteur médical"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%2306304d" width="400" height="500"/%3E%3Ctext fill="white" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="24"%3EIA Tuteur%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>

      <div className="lg:col-span-3 space-y-6 flex flex-col justify-center animate-in slide-in-from-right duration-700">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-bold text-[#052648] mb-2">Voici vos super-pouvoirs</h2>
          <p className="text-slate-600 text-lg">Avec The good doctor, vous ne faites pas que lire, vous pratiquez en vous servants des 3 piliers qui vont forger votre excellence médicale.</p>
        </div>

        <div className="grid gap-4">

          <div className="bg-white border-0 border-emerald-200 p-6 rounded-2xl transform transition-transform hover:scale-[1.02]">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 rounded-xl">
                <Sparkles size={28} className="text-slate-700"/>
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-800 mb-1">Un Tuteur Personnalisé</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Profitez d'un mentor virtuel qui <strong>analyse vos décisions</strong> en temps réel, corrige vos erreurs sans jugement et s'adapte à votre rythme d'apprentissage.</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-0 border-emerald-200 p-6 rounded-2xl transform transition-transform hover:scale-[1.02]">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 rounded-xl">
                <ClipboardList size={28} className="text-slate-700"/>
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-800 mb-1">Des Cas Cliniques Authentiques</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Exercez-vous sur des scénarios basés sur des <strong>données réelles (MIMIC-III)</strong>. De l'anamnèse au diagnostic, confrontez-vous à la réalité du terrain en toute sécurité.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl transform transition-transform hover:scale-[1.02]">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 rounded-xl">
                <Trophy size={28} className="text-slate-700"/>
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-800 mb-1">Une Progression Gamifiée</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Transformez l'étude en aventure. Gagnez des badges, montez en grade et <strong>validez vos compétences</strong> pour visualiser concrètement votre évolution.</p>
              </div>
            </div>
          </div>




        </div>

        <button 
          onClick={() => setStep(3)}
          className="w-full py-4 bg-[#052648] text-white rounded-xl font-bold shadow-lg hover:bg-blue-900 transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-xl"
        >
          Génial, continuons <ArrowRight size={20}/>
        </button>
      </div>
    </div>
  );

  // ÉTAPE 3: Fréquence d'apprentissage
  const Step3 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
      <div className="hidden lg:block lg:col-span-2 relative h-full min-h-[500px] rounded-2xl overflow-hidden">
        <img 
          src={STEP_IMAGES[3]} 
          alt="Étudiant avec IA"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%23064466" width="400" height="500"/%3E%3Ctext fill="white" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="24"%3EApprentissage%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>

      <div className="lg:col-span-3 space-y-6 flex flex-col justify-center animate-in slide-in-from-right duration-700">
        <div className="text-center lg:text-left space-y-3">
          <h2 className="text-3xl font-bold text-[#052648]">Votre rythme de croisière</h2>
          <p className="text-slate-600 text-lg">On ne vous met pas la pression, mais la régularité fait la différence.</p>
        </div>

        <div className="space-y-3 pt-4">
          {[
            {val: 'daily', label: 'Mode Intensif', sub: 'Quotidien - Pour préparer l\'ECN ou un examen proche', icon: Flame, iconColor: 'text-red-500'},
            {val: 'weekly', label: 'Mode Régulier', sub: 'Hebdomadaire - Pour maintenir les acquis sans stress', icon: TrendingUp, iconColor: 'text-blue-500'},
            {val: 'casual', label: 'Mode Flexible', sub: 'À mon rythme - Juste par curiosité', icon: Star, iconColor: 'text-yellow-500'}
          ].map(opt => (
            <button 
              key={opt.val}
              onClick={() => {
                setPreferences({...preferences, frequency: opt.val});
                setTimeout(() => setStep(4), 200);
              }}
              className={`w-full p-5 border-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] text-left group ${
                preferences.frequency === opt.val 
                  ? 'border-[#052648] bg-blue-50' 
                  : 'border-slate-200 bg-white hover:border-[#052648] hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg transition-colors ${
                  preferences.frequency === opt.val 
                    ? 'bg-[#052648]' 
                    : 'bg-slate-100 group-hover:bg-[#052648]'
                }`}>
                  <opt.icon size={28} className={
                    preferences.frequency === opt.val 
                      ? 'text-white' 
                      : `${opt.iconColor} group-hover:text-white`
                  } />
                </div>
                <div className="flex-1">
                  <span className="block font-bold text-slate-800 group-hover:text-[#052648] text-lg">{opt.label}</span>
                  <span className="text-sm text-slate-500">{opt.sub}</span>
                </div>
                {preferences.frequency === opt.val && <CheckCircle2 className="text-[#052648]" size={24}/>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ÉTAPE 4: Décision finale
  const Step4 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
      <div className="hidden lg:block lg:col-span-2 relative h-full min-h-[500px] rounded-2xl overflow-hidden">
        <img 
          src={STEP_IMAGES[4]} 
          alt="Diagnostic médical"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%23053a5c" width="400" height="500"/%3E%3Ctext fill="white" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="24"%3EDiagnostic%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>

      <div className="lg:col-span-3 space-y-6 flex flex-col justify-center animate-in zoom-in-95 duration-700">
        <div className="text-center lg:text-left space-y-3">
          <h2 className="text-3xl font-bold text-[#052648]">Dernière ligne droite !</h2>
          <p className="text-slate-600 text-lg">Comment souhaitez-vous configurer votre profil initial ?</p>
        </div>

        <div className="grid gap-4 pt-4">
          {/* OPTION 1 : BASES */}
          <button 
            onClick={() => setStep(5)}
            disabled={isSubmitting}
            className="relative p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all text-left group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-300 group-hover:bg-[#052648] transition-colors"></div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-blue-50">
                <GraduationCap size={32} className="text-slate-500 group-hover:text-[#052648]"/>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-slate-800 mb-2">Commencer par les bases</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Je préfère démarrer doucement avec des cas niveau débutant.
                </p>
              </div>
            </div>
            {isSubmitting && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-[#052648]"></div>
              </div>
            )}
          </button>

          {/* OPTION 2 : TEST NIVEAU */}
          <button 
            onClick={() => setPreferences({...preferences, startMode: 'test_level'})}
            className="relative p-6 bg-gradient-to-br from-[#052648] to-blue-900 text-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all text-left group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30">
                <Zap size={32} className="text-yellow-400"/>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2">Évaluer mon niveau</h3>
                <p className="text-sm text-blue-100 leading-relaxed">
                  Passez un diagnostic rapide pour débloquer des cas avancés et évoluefr rapidement.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex items-center justify-center top-0 fixed w-full h-full">
      <div className="w-full max-w-7xl">

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 min-h-[600px] flex flex-col justify-center relative overflow-hidden">
          {preferences.startMode === 'test_level' && step === 4 ? (
            <div className="text-center space-y-4 animate-in fade-in duration-500">
              <Brain size={64} className="mx-auto text-[#052648]"/>
              <h2 className="text-2xl font-bold text-[#052648]">Diagnostic en cours de développement</h2>
              <p className="text-slate-600">Cette fonctionnalité sera bientôt disponible.</p>
              <button 
                onClick={() => setPreferences({...preferences, startMode: 'basics'})}
                className="mt-4 px-6 py-3 bg-[#052648] text-white rounded-xl hover:bg-blue-900 transition-colors"
              >
                Retour aux options
              </button>
            </div>
          ) : (
            <>
              {step === 1 && <Step1 />}
              {step === 2 && <Step2 />}
              {step === 3 && <Step3 />}
              {step === 4 && <Step4 />}
              {/* ÉTAPE 5: Validation Finale */}
              {step === 5 && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full animate-in slide-in-from-right duration-500">
                      <div className="hidden lg:block lg:col-span-2 bg-[#052648] rounded-2xl p-12 text-white flex flex-col justify-between">
                          <ClipboardList size={64} className="text-blue-400 opacity-50"/>
                          <div>
                              <h3 className="text-2xl font-bold mb-2">Récapitulatif</h3>
                              <ul className="space-y-2 opacity-90">
                                  <li>• Niveau: {level}</li>
                                  <li>• Spécialité: {specialty}</li>
                                  <li>• Compte: {tempRegistrationData?.email}</li>
                              </ul>
                          </div>
                      </div>
                      <div className="lg:col-span-3 flex flex-col justify-center space-y-6">
                          <h2 className="text-3xl font-bold text-[#052648]">Prêt à démarrer ?</h2>
                          <p className="text-slate-600">
                              En validant, nous allons générer votre identifiant unique et configurer votre espace.
                          </p>
                          
                          <div className="grid gap-4">
                              {/* Bouton Bases */}
                              <button 
                                onClick={() => handleFinalSubmit('basics')}
                                disabled={isSubmitting}
                                className="p-6 border-2 border-slate-200 rounded-2xl text-left hover:border-[#052648] hover:shadow-lg transition-all group"
                              >
                                  <div className="flex items-center gap-4 mb-2">
                                      <div className="p-2 bg-blue-50 rounded text-blue-700 group-hover:bg-[#052648] group-hover:text-white transition"><GraduationCap size={24}/></div>
                                      <h3 className="font-bold text-xl text-slate-800">Commencer les cas cliniques</h3>
                                  </div>
                                  <p className="text-sm text-slate-500 pl-[56px]">Accès direct à la bibliothèque adaptée à votre niveau.</p>
                              </button>

                                {/* Bouton Test (Désactivé pour l'exemple ou fonctionnel) */}
                              <button disabled className="opacity-60 cursor-not-allowed p-6 border-2 border-slate-100 rounded-2xl text-left relative overflow-hidden">
                                  <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Bientôt</div>
                                  <div className="flex items-center gap-4 mb-2">
                                      <div className="p-2 bg-slate-100 rounded text-slate-500"><Brain size={24}/></div>
                                      <h3 className="font-bold text-xl text-slate-400">Passer le test d'évaluation</h3>
                                  </div>
                                  <p className="text-sm text-slate-400 pl-[56px]">Calibrer l'IA selon vos connaissances réelles.</p>
                              </button>
                          </div>

                          {isSubmitting && (
                              <div className="flex items-center gap-2 text-[#052648] font-bold justify-center mt-4">
                                  <div className="animate-spin h-5 w-5 border-2 border-[#052648] border-t-transparent rounded-full"></div>
                                  Création de l'espace en cours...
                              </div>
                          )}
                      </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Navigation Back */}
        {step > 1 && step <= 5 && preferences.startMode !== 'test_level' && (
          <button 
            onClick={() => setStep(step - 1)} 
            className="mt-6 text-slate-500 hover:text-[#052648] text-sm font-semibold flex items-center justify-center gap-2 mx-auto transition-colors group"
          >
            <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={18} /> 
            Retour
          </button>
        )}
      </div>
    </div>
  );
}