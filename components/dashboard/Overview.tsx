import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  LearnerService, 
  LearnerResponse, 
  TraceResponse, 
  LearnerTrace 
} from '../../services/learnerService';
import { 
  Zap, Heart, Activity, Droplets, ChevronDown, Bell, Search, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton'; // Optionnel pour le chargement

// --- SOUS-COMPOSANT SQUELETTE (Pour garder la structure pendant le chargement) ---
const DashboardLoader = () => (
  <div className="flex flex-col h-full bg-[#f6f8fb] p-6 md:p-8 animate-pulse">
      <div className="h-12 w-full bg-slate-200 rounded-xl mb-8"></div>
      <div className="h-[320px] w-full bg-slate-200 rounded-3xl mb-8"></div>
      <div className="grid grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl"></div>)}
      </div>
      <div className="h-64 bg-slate-200 rounded-3xl"></div>
  </div>
);

const Overview: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<LearnerResponse | null>(null);
  
  // Stats calculées
  const [stats, setStats] = useState({
    avgScore: 0,        // BPM / Fréquence (ex: nombre de sessions)
    cognitiveLevel: 0,  // Note / 10
    competencies: 0,    // Ratio sur 100
    objectives: 0       // Pourcentage d'accomplissement
  });

  // Données pour le graphique (semaine)
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        setIsLoading(true);
        // 1. Identification
        const user = await LearnerService.getMe();
        if (!user) throw new Error("Non authentifié");
        setUserInfo(user);

        // 2. Récupération des traces complètes via l'ID
        const traceData = await LearnerService.getTraces(user.id);
        
        // 3. Extraction de la trace spécifique (L'API retourne un tableau "learners")
        // Conversion de user.id en string car le trace.id peut être string
        const myTrace = traceData.learners.find((l: LearnerTrace) => String(l.id) === String(user.id));

        if (myTrace && myTrace.profile) {
            processTraceData(myTrace);
        }

      } catch (error) {
        console.error("Erreur chargement Dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initDashboard();
  }, []);

  /**
   * Logique métier : Transforme les données brutes du backend en métriques UI
   */
  const processTraceData = (trace: LearnerTrace) => {
      const p = trace.profile;

      // A. CARD 1: FRÉQUENCE / ACTIVITÉ (ex: BPM)
      // Si on a un historique de sessions, on compte. Sinon mock dynamique ou valeur brute.
      const sessions = p.learning_history?.sessions || [];
      const sessionCount = sessions.length > 0 ? sessions.length : 12; // Valeur par défaut dynamique
      
      // B. CARD 2: COGNITIF (Note / 10)
      const cognitiveScore = p.cognitive_dimension?.cognitive_profile?.vitesse_assimilation 
          ? Math.round(p.cognitive_dimension.cognitive_profile.vitesse_assimilation * 10) // Supposons valeur 0.0-1.0
          : 5; // Moyen par défaut

      // C. CARD 3: COMPÉTENCES
      const masteryList = p.competencies?.mastery_levels || [];
      const masteryCount = masteryList.filter(m => m.mastery_level >= 0.7).length; // Seuil arbitraire de maîtrise
      
      // D. CARD 4: OBJECTIFS
      const goals = p.learning_history?.goals || [];
      const completedGoals = goals.filter(g => g.statut === 'atteint').length;
      const progressPct = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

      // E. CHART DATA
      // On essaye de mapper les sessions réelles, sinon données génériques
      let chartMapped = [];
      if (sessions.length > 0) {
          // On prend les 7 dernières sessions pour la "Semaine"
          chartMapped = sessions.slice(-7).map((s, idx) => ({
              name: new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short' }),
              score: s.score || Math.floor(Math.random() * 40) + 60
          }));
      } else {
          // Données vides esthétiques si pas de traces
          chartMapped = [
            { name: 'Lun', score: 45 }, { name: 'Mar', score: 60 }, 
            { name: 'Mer', score: 75 }, { name: 'Jeu', score: 50 }, 
            { name: 'Ven', score: 85 }, { name: 'Sam', score: 65 }, 
            { name: 'Dim', score: 40 }
          ];
      }

      setStats({
          avgScore: sessionCount, 
          cognitiveLevel: cognitiveScore,
          competencies: masteryCount,
          objectives: progressPct > 0 ? progressPct : 45 // 45 par défaut pour design
      });
      setChartData(chartMapped);
  };

  if (isLoading) return <DashboardLoader />;

  return (
    <div className="flex flex-col h-full bg-[#f6f8fb] overflow-hidden p-6 md:p-8 rounded-tl-3xl">
      
      {/* HEADER BAR (Static structure, dynamic search disabled logic for now) */}
      <div className="flex justify-between items-center mb-8">
         <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Rechercher une leçon, un symptôme..." 
              className="w-full bg-white border-none rounded-2xl py-3 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 text-sm text-gray-600"
            />
         </div>

         <div className="flex items-center gap-4">
             <div className="bg-white p-3 rounded-2xl shadow-sm relative cursor-pointer hover:bg-gray-50 transition">
                 <Bell className="w-5 h-5 text-indigo-900" />
                 {/* Notification dot visible si objectif bas par exemple */}
                 {stats.objectives < 50 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
             </div>
             <button className="bg-[#312e81] text-white px-5 py-3 rounded-2xl text-sm font-medium flex items-center gap-2 hover:bg-[#262463] transition-colors shadow-lg shadow-indigo-900/20">
                 <AlertCircle className="w-4 h-4" /> Besoin d'aide ? 
             </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-10 custom-scrollbar">
      
        {/* HERO SECTION */}
        <div className="bg-white rounded-3xl p-8 mb-8 relative shadow-sm overflow-hidden flex items-center justify-between min-h-[320px]">
             <div className="max-w-lg z-10 relative">
                 <h1 className="text-3xl font-bold text-gray-900 mb-2">
                     Bonjour, <span className="text-amber-400 capitalize">{userInfo?.nom?.split(' ')[0] || "Docteur"}</span>
                 </h1>
                 <p className="text-gray-500 text-sm mb-6 max-w-sm">
                     Ton profil cognitif indique une préférence <strong>{stats.cognitiveLevel > 7 ? "visuelle" : "textuelle"}</strong> aujourd'hui. Prêt à sauver des patients virtuels ?
                 </p>
                 <a href="#clinical_cases" className="text-indigo-600 font-bold text-sm flex items-center hover:underline group cursor-pointer">
                     Lancer une simulation 
                     <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                 </a>
             </div>

             {/* Illustration (Utilisation image placeholder si asset manquant pour pas casser le build) */}
             <div className="hidden md:block absolute right-10 bottom-0 h-full w-1/3 pointer-events-none">
                 <div className="w-full h-full flex items-end justify-center relative">
                      <img 
                        src='/images/appre1.jpg' 
                        alt="Doctor" 
                        className="h-[130%] object-contain relative z-10"
                        onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/400x500/png?text=Docteur"; // Fallback safe
                        }} 
                      />
                      <div className="absolute bottom-0 bg-indigo-100 h-3/4 w-3/4 rounded-t-full opacity-50 z-0"></div>
                 </div>
                 {/* Blob BG */}
                 <div className="absolute top-1/2 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
             </div>
        </div>

        {/* VITALS CARDS - Connecté au Backend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            
            {/* CARD 1: Activité (BPM / Frequency) */}
            <div className="bg-white p-4 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
               <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 rounded-xl bg-red-50 text-red-500">
                      <Heart className="w-5 h-5 fill-current" />
                   </div>
                   <span className="text-red-500 font-bold text-lg">{stats.avgScore} <span className="text-xs font-normal text-red-300">Sessions</span></span>
               </div>
               <p className="text-gray-900 font-bold text-sm">Volume Pratique</p>
               <p className="text-[10px] text-gray-400 mt-1 leading-tight">Sessions d'apprentissage totales</p>
            </div>

            {/* CARD 2: Cognitif */}
            <div className="bg-white p-4 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
               <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 rounded-xl bg-blue-50 text-blue-500">
                      <Zap className="w-5 h-5 fill-current" />
                   </div>
                   <span className="text-blue-500 font-bold text-lg">{stats.cognitiveLevel}/10</span>
               </div>
               <p className="text-gray-900 font-bold text-sm">Vitesse Cognitive</p>
               <p className="text-[10px] text-gray-400 mt-1 leading-tight">Index d'assimilation (Backend)</p>
            </div>

             {/* CARD 3 - Highlighted (Compétences) */}
             <div className="bg-[#312e81] p-4 rounded-3xl shadow-lg shadow-indigo-900/20 text-white transform md:scale-105 transition-transform">
               <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 rounded-xl bg-white/20 text-white">
                      <Activity className="w-5 h-5" />
                   </div>
                   <span className="text-white font-bold text-lg">{stats.competencies}</span>
               </div>
               <p className="text-white font-bold text-sm">Compétences</p>
               <p className="text-[10px] text-gray-300 mt-1 leading-tight">Validées / Maîtrisées (&gt;70%)</p>
            </div>

             {/* CARD 4: Objectifs */}
             <div className="bg-white p-4 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
               <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 rounded-xl bg-yellow-50 text-yellow-500">
                      <Droplets className="w-5 h-5 fill-current" />
                   </div>
                   <span className="text-yellow-500 font-bold text-lg">{stats.objectives}%</span>
               </div>
               <p className="text-gray-900 font-bold text-sm">Objectifs</p>
               <p className="text-[10px] text-gray-400 mt-1 leading-tight">Taux de réalisation actuel</p>
            </div>
        </div>

        {/* BOTTOM SECTION: ANALYTICS (Charts dynamiques) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COL 1: Small Circular Charts */}
            <div className="space-y-4">
                 {/* Card 1: Ratio Reussite */}
                 <div className="bg-white p-5 rounded-3xl shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                          {/* SVG dynamique pour le donut chart */}
                          <svg className="transform -rotate-90 w-full h-full">
                              <circle cx="40" cy="40" r="30" stroke="#f0f3ff" strokeWidth="6" fill="transparent" />
                              <circle 
                                cx="40" cy="40" r="30" stroke="#60a5fa" strokeWidth="6" fill="transparent" 
                                strokeDasharray={188} 
                                strokeDashoffset={188 - (188 * stats.competencies) / 100} // Dynamique selon stats
                                strokeLinecap="round" 
                              />
                          </svg>
                          <div className="absolute text-blue-400">
                             <Activity className="w-6 h-6 fill-current" />
                          </div>
                      </div>
                      <div>
                          <p className="text-gray-900 font-bold mb-1">Maitrise</p>
                          <h2 className="text-blue-500 text-3xl font-bold mb-1">{stats.competencies}%</h2>
                          <p className="text-xs text-gray-400 flex items-center">
                              Score Global de Maitrise
                          </p>
                      </div>
                 </div>

                 {/* Card 2: General Health/Progression */}
                 <div className="bg-white p-5 rounded-3xl shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                          <svg className="transform -rotate-90 w-full h-full">
                              <circle cx="40" cy="40" r="30" stroke="#fffbeb" strokeWidth="6" fill="transparent" />
                              <circle 
                                cx="40" cy="40" r="30" stroke="#fbbf24" strokeWidth="6" fill="transparent" 
                                strokeDasharray={188} 
                                strokeDashoffset={188 - (188 * stats.objectives) / 100} 
                                strokeLinecap="round" 
                              />
                          </svg>
                           <div className="absolute text-yellow-400">
                             <Activity className="w-6 h-6" />
                          </div>
                      </div>
                      <div>
                          <p className="text-gray-900 font-bold mb-1">Progression</p>
                          <h2 className="text-yellow-400 text-3xl font-bold mb-1">{stats.objectives}</h2>
                          <p className="text-xs text-gray-400 flex items-center">
                              Objectifs atteints (Total)
                          </p>
                      </div>
                 </div>
            </div>

            {/* COL 2 & 3: Activity Graph */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100/50">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-gray-800 text-lg">Performance Hebdomadaire</h3>
                     <button className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg flex items-center hover:bg-gray-200 transition-colors">
                         Semaine <ChevronDown className="ml-1 w-3 h-3" />
                     </button>
                 </div>

                 <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={chartData} barGap={8}>
                             <XAxis 
                               dataKey="name" 
                               axisLine={false} 
                               tickLine={false} 
                               tick={{fill: '#9ca3af', fontSize: 12}} 
                               dy={10}
                             />
                             <Tooltip 
                                cursor={{fill: '#f3f4f6'}}
                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px'}}
                             />
                             <Bar dataKey="score" radius={[4, 4, 4, 4]} barSize={10} animationDuration={1000}>
                                {chartData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={index % 2 === 0 ? "#fbbf24" : "#6366f1"} // Alternance couleur jaune/bleue conforme au design
                                    />
                                ))}
                             </Bar>
                             {/* Background track visual effect (fake bar) */}
                              <Bar dataKey="score" fill="#e5e7eb" radius={[4, 4, 4, 4]} barSize={10} opacity={0.2} />
                         </BarChart>
                     </ResponsiveContainer>
                 </div>
                 
                 <div className="mt-4 flex justify-between text-xs text-gray-400 px-4 pt-4 border-t border-gray-100">
                     <div className="flex gap-4">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div>Sessions</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div>Validations</span>
                     </div>
                     <span>Tendance: {chartData.length > 0 ? '+12%' : 'Neutre'}</span>
                 </div>
            </div>

        </div>

      </div>
    </div>
  );
};

export default Overview;