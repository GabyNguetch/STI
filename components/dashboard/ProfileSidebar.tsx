import React, { useMemo } from 'react';
import { 
  User, Activity, Clock, Award, ChevronLeft, ChevronRight, 
  Stethoscope, CalendarCheck, Zap 
} from 'lucide-react';
import { LearnerResponse, LearnerTrace } from '../../services/learnerService';

interface ProfileSidebarProps {
  user: LearnerResponse | null;
  trace: LearnerTrace | null;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ user, trace }) => {
  // --- 1. LOGIQUE TEMPORELLE (CALENDRIER) ---
  const today = new Date();
  const currentMonthIndex = today.getMonth(); // 0 = Janvier
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();
  
  // Formatage : "Janvier 2026"
  const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(today);
  // Premier jour du mois (pour le décalage dans la grille)
  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 = Dimanche
  // Nombre de jours dans le mois
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  
  // Ajustement pour commencer la semaine le Lundi (Lundi=1 ... Dimanche=7)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // --- 2. LOGIQUE STATISTIQUE (BACKEND) ---
  
  // A. Jours d'activité (Sessions passées)
  const activeDates = useMemo(() => {
    if (!trace?.profile?.learning_history?.sessions) return [];
    
    // On extrait les jours (1..31) des sessions qui sont dans le mois courant
    return trace.profile.learning_history.sessions
      .map(s => {
          const d = new Date(s.date);
          // Vérifie si c'est le même mois/année
          if (d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear) {
              return d.getDate();
          }
          return -1;
      })
      .filter(d => d !== -1);
  }, [trace, currentMonthIndex, currentYear]);

  // B. KPIs Calculés
  const kpi = useMemo(() => {
      // 1. Compétences Maîtrisées
      const masteryLevels = trace?.profile?.competencies?.mastery_levels || [];
      const masteredCount = masteryLevels.filter(m => m.mastery_level >= 0.7).length;
      
      // 2. Objectifs Atteints
      const goals = trace?.profile?.learning_history?.goals || [];
      const doneGoals = goals.filter(g => g.statut === 'atteint').length;
      const goalsPercentage = goals.length > 0 ? Math.round((doneGoals / goals.length) * 100) : 0;

      // 3. Temps / Sessions
      const sessionsCount = trace?.profile?.learning_history?.sessions?.length || 0;
      
      return {
          competencies: masteredCount,
          goals: goalsPercentage,
          sessions: sessionsCount
      };
  }, [trace]);

  // --- 3. RENDU VISUEL ---

  return (
    <div className="w-full h-full bg-white border-l border-slate-200 p-6 flex flex-col overflow-y-auto no-scrollbar shadow-xl z-20">
      
      {/* HEADER PROFIL */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
           {/* Cercle animé au survol */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
          <div className="w-24 h-24 relative bg-slate-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg overflow-hidden">
             {/* Utilisation de l'API UI Avatars pour un avatar stable basé sur le nom */}
             <img 
               src={`https://ui-avatars.com/api/?name=${user?.nom || 'User'}&background=052648&color=fff&size=128`} 
               alt="Avatar" 
               className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-4 right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
        </div>
        
        <h3 className="font-bold text-slate-800 text-lg">{user?.nom || "Non Connecté"}</h3>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mt-1">
            {user?.niveau_etudes || "Invité"} • {user?.matricule}
        </p>
      </div>

      {/* CARTES KPI (STATS) */}
      <div className="grid grid-cols-3 gap-1 mb-8">
        {/* Carte 1: Compétences */}
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all duration-300 group">
            <div className="bg-transparent p-2 mb-2 text-indigo-600 border-0 border-slate-100 group-hover:scale-110 transition-transform">
               <Activity className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 text-lg">{kpi.competencies}</span> 
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Compétences</span>
        </div>

        {/* Carte 2: Objectifs */}
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center hover:bg-white hover:shadow-md hover:border-amber-100 transition-all duration-300 group">
             <div className="bg-transparent p-2 rounded-xl mb-2 text-amber-500 border-0 border-slate-100 group-hover:scale-110 transition-transform">
               <Award className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 text-lg">{kpi.goals}%</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Objectifs</span>
        </div>

        {/* Carte 3: Sessions */}
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center hover:bg-white hover:shadow-md hover:border-blue-100 transition-all duration-300 group">
            <div className="bg-transparent p-2 rounded-xl mb-2 text-blue-500 border-0 border-slate-100 group-hover:scale-110 transition-transform">
               <Clock className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 text-lg">{kpi.sessions}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Sessions</span>
        </div>
      </div>

      {/* CALENDRIER DYNAMIQUE */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 px-1">
          <span className="text-slate-800 font-bold capitalize text-sm">{monthName}</span>
          <div className="flex gap-1 text-slate-400">
            <button className="hover:text-indigo-600 hover:bg-slate-100 p-1 rounded-md transition"><ChevronLeft className="w-4 h-4" /></button>
            <button className="hover:text-indigo-600 hover:bg-slate-100 p-1 rounded-md transition"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
        
        {/* Header Jours */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
          <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
        </div>
        
        {/* Grille Dates */}
        <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-xs">
           {/* Padding vide pour le début du mois */}
           {Array.from({ length: startOffset }).map((_, i) => <span key={`empty-${i}`} />)}
           
           {/* Jours Réels */}
           {Array.from({ length: daysInMonth }).map((_, i) => {
             const day = i + 1;
             const isToday = day === currentDay;
             const hasActivity = activeDates.includes(day); // Vérifie via Trace si l'élève a bossé ce jour là
             
             return (
               <div key={day} className="flex justify-center items-center relative">
                  {/* Point indicateur si activité ce jour là (hors aujourd'hui) */}
                  {!isToday && hasActivity && (
                      <span className="absolute bottom-0 w-1 h-1 bg-indigo-500 rounded-full"></span>
                  )}

                  <span className={`
                     w-8 h-8 flex items-center justify-center rounded-xl transition-all cursor-default text-sm
                     ${isToday 
                        ? 'bg-[#052648] text-white font-bold shadow-lg shadow-indigo-200' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                     }
                  `}>
                    {day}
                  </span>
               </div>
             )
           })}
        </div>
      </div>

      </div>
  );
};

export default ProfileSidebar;