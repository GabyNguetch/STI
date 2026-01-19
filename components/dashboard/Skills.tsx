'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, List, LayoutGrid, Brain, TrendingUp, 
  Clock, AlertTriangle, CheckCircle, Flame, ArrowRight,
  BookOpen, MoreHorizontal, ChevronDown, RefreshCcw
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip 
} from 'recharts';
import { LearnerService } from '@/services/learnerService';
import toast from 'react-hot-toast';

// --- TYPES (Adaptés aux données retournées par les routes citées) ---

// Extension du type pour inclure les métadonnées UI si le backend ne les envoie pas directement
// On suppose que getListMastery renvoie une jointure ou qu'on mappe localement
interface SkillData {
  id: number;
  competence_id: number;
  name: string;             // 'competence_name' du backend
  domain: string;           // 'domaine_medical' du backend
  mastery_level: number;    // 0.0 à 1.0
  last_practice: string;    // ISO Date
  success_count: number;    // 'nb_success'
  failure_count: number;    // 'nb_failures'
  streak: number;           // 'streak_correct'
  difficulty: number;       // 1-5
}

// Stats calculées
interface SkillsStats {
  total: number;
  mastered: number; // >= 0.7
  progress: number; // 0.4 - 0.7
  todo: number;     // < 0.4
  global_avg: number;
  weekly_activity: number;
  best_streak: number;
  to_review_today: number;
  regressing: number;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444']; // Vert, Jaune, Rouge

export default function Skills() {
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [stats, setStats] = useState<SkillsStats>({
    total: 0, mastered: 0, progress: 0, todo: 0, global_avg: 0,
    weekly_activity: 0, best_streak: 0, to_review_today: 0, regressing: 0
  });

  // États Filtres & UI
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [levelFilter, setLevelFilter] = useState<'all' | 'mastered' | 'progress' | 'todo'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'urgent' | 'warning' | 'ok'>('all');

  // Données de domaines mockées (à remplacer par API domains si dispo)
  const AVAILABLE_DOMAINS = ['Cardiologie', 'Pneumologie', 'Infectiologie', 'Neurologie', 'Pédiatrie', 'Urgences'];

  // --- CHARGEMENT ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Récupération ID User
      const user = await LearnerService.getMe();
      if (!user) throw new Error("Non connecté");

      // 2. Récupération Compétences (GET /competency-mastery/learner/{id})
      console.log(`📡 API [GET] /competency-mastery/learner/${user.id}`);
      const rawData: any[] = await LearnerService.getListMastery(user.id);
      
      // 3. Transformation & Enrichissement (Si le backend ne renvoie pas tout)
      // On simule des noms/domaines si manquants pour l'UI
      const processedSkills: SkillData[] = rawData.map((item, index) => ({
        id: index,
        competence_id: item.competence_id,
        name: item.competence_name || `Compétence Clinique #${item.competence_id}`,
        domain: item.domaine_medical || AVAILABLE_DOMAINS[item.competence_id % AVAILABLE_DOMAINS.length],
        mastery_level: item.mastery_level || 0,
        last_practice: item.last_practice_date || new Date().toISOString(),
        success_count: item.nb_success || 0,
        failure_count: item.nb_failures || 0,
        streak: item.streak_correct || 0,
        difficulty: 3 // Défaut
      }));

      setSkills(processedSkills);
      calculateStats(processedSkills);

    } catch (e) {
      console.error(e);
      toast.error("Impossible de charger les compétences.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: SkillData[]) => {
    const total = data.length;
    const mastered = data.filter(s => s.mastery_level >= 0.7).length;
    const progress = data.filter(s => s.mastery_level >= 0.4 && s.mastery_level < 0.7).length;
    const todo = data.filter(s => s.mastery_level < 0.4).length;
    
    // Moyenne globale
    const sumMastery = data.reduce((acc, curr) => acc + curr.mastery_level, 0);
    const global_avg = total > 0 ? Math.round((sumMastery / total) * 100) : 0;

    // Activité Hebdomadaire (Mock date logic)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weekly_activity = data.filter(s => new Date(s.last_practice) > oneWeekAgo).length;

    // Meilleur Streak
    const best_streak = Math.max(...data.map(s => s.streak), 0);

    // Algorithme Urgence (Mock)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const regressing = data.filter(s => new Date(s.last_practice) < twoWeeksAgo && s.mastery_level > 0.5).length;
    const to_review_today = regressing + 3; // +3 arbitraire pour "répétition espacée"

    setStats({ total, mastered, progress, todo, global_avg, weekly_activity, best_streak, to_review_today, regressing });
  };

  // --- LOGIQUE FILTRAGE ---
  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      // 1. Recherche Texte
      const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            skill.domain.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Filtre Domaine
      const matchesDomain = selectedDomains.length === 0 || selectedDomains.includes(skill.domain);
      
      // 3. Filtre Niveau
      let matchesLevel = true;
      if (levelFilter === 'mastered') matchesLevel = skill.mastery_level >= 0.7;
      if (levelFilter === 'progress') matchesLevel = skill.mastery_level >= 0.4 && skill.mastery_level < 0.7;
      if (levelFilter === 'todo') matchesLevel = skill.mastery_level < 0.4;

      // 4. Filtre Urgence (Basé sur last_practice)
      let matchesUrgency = true;
      const daysSince = (new Date().getTime() - new Date(skill.last_practice).getTime()) / (1000 * 3600 * 24);
      if (urgencyFilter === 'urgent') matchesUrgency = daysSince > 14;
      if (urgencyFilter === 'warning') matchesUrgency = daysSince > 7 && daysSince <= 14;
      if (urgencyFilter === 'ok') matchesUrgency = daysSince <= 7;

      return matchesSearch && matchesDomain && matchesLevel && matchesUrgency;
    });
  }, [skills, searchQuery, selectedDomains, levelFilter, urgencyFilter]);


  // --- HELPERS UI ---
  const getProgressColor = (val: number) => {
    if (val >= 0.7) return 'bg-emerald-500';
    if (val >= 0.4) return 'bg-amber-400';
    return 'bg-red-500';
  };

  const getDomainColor = (domain: string) => {
    switch(domain) {
      case 'Cardiologie': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Pneumologie': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'Neurologie': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Infectiologie': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const toggleDomain = (d: string) => {
    if (selectedDomains.includes(d)) setSelectedDomains(prev => prev.filter(item => item !== d));
    else setSelectedDomains(prev => [...prev, d]);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="h-40 bg-slate-200 rounded-3xl w-full animate-pulse" />
        <div className="h-16 bg-slate-200 rounded-xl w-full animate-pulse" />
        <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-200 rounded-xl w-full animate-pulse" />)}
        </div>
      </div>
    );
  }

  // === RENDU PRINCIPAL ===

  return (
    <div className="flex flex-col gap-6 min-h-screen pb-10">
      
      {/* -------------------- SECTION 1: HEADER STATISTIQUES -------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARTE 1 : VUE D'ENSEMBLE (PIE) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide">Maitrise Globale</p>
            <div className="mt-2">
              <span className="text-3xl font-bold text-[#052648]">{stats.global_avg}%</span>
              <p className="text-xs text-slate-400 mt-1">{stats.total} compétences suivies</p>
            </div>
            <div className="flex flex-col gap-1 mt-4 text-xs">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Maîtrisées ({stats.mastered})</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400"/> En cours ({stats.progress})</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"/> À travailler ({stats.todo})</div>
            </div>
          </div>
          <div className="w-32 h-32 relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={[
                     {name: 'Mastered', value: stats.mastered},
                     {name: 'Progress', value: stats.progress},
                     {name: 'Todo', value: stats.todo}
                   ]}
                   cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value" stroke="none"
                 >
                   {COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                 </Pie>
                 <RechartsTooltip />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <Brain className="w-6 h-6 text-slate-300 opacity-50"/>
             </div>
          </div>
        </div>

        {/* CARTE 2 : ACTIVITÉ RÉCENTE */}
        <div className="bg-[#052648] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
           <div className="flex justify-between items-start z-10">
               <div>
                  <h3 className="font-bold text-lg mb-1">Activité Récente</h3>
                  <p className="text-blue-200 text-xs">Cette semaine</p>
               </div>
               <div className="bg-white/10 p-2 rounded-lg"><TrendingUp size={20} className="text-white"/></div>
           </div>

           <div className="grid grid-cols-2 gap-4 mt-6 z-10">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                 <p className="text-2xl font-bold">{stats.weekly_activity}</p>
                 <p className="text-[10px] text-blue-200 uppercase font-bold mt-1">Pratiquées</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                 <div className="flex items-center gap-1"><Flame size={14} className="text-orange-400 fill-orange-400"/> {stats.best_streak}j</div>
                 <p className="text-[10px] text-blue-200 uppercase font-bold mt-1">Best Streak</p>
              </div>
           </div>
        </div>

        {/* CARTE 3 : PROCHAINES RÉVISIONS (URGENCE) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
                    <Clock size={16}/> Révisions Prioritaires
                </p>
            </div>
            
            <div className="flex-1 flex items-center gap-4 border-b border-dashed border-slate-200 pb-4 mb-4">
                <div className="text-center w-16">
                    <span className="block text-2xl font-bold text-red-500">{stats.to_review_today}</span>
                    <span className="text-[10px] text-red-400 font-bold uppercase">À voir</span>
                </div>
                <div className="flex-1">
                    <p className="text-sm text-slate-800 font-medium">Selon votre courbe d'oubli, il est temps de réviser ces notions.</p>
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
               <AlertTriangle size={14}/>
               <span className="font-bold">{stats.regressing} compétences</span> montrent des signes de régression (&gt;14j).
            </div>
        </div>
      </div>


      {/* -------------------- SECTION 2: FILTRES & BARRE DE RECHERCHE -------------------- */}
      <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 sticky top-[90px] z-30 transition-all">
         {/* LIGNE 1 : Recherche + Tri */}
         <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between">
            <div className="relative flex-1 max-w-xl">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
               <input 
                  type="text"
                  placeholder="Rechercher une compétence..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#052648]/20 focus:bg-white outline-none transition-all"
               />
            </div>
            
            <div className="flex gap-2 items-center">
                 <div className="bg-slate-200 w-px h-6 mx-2"/>
                 <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#052648] text-white' : 'text-slate-400 hover:bg-slate-100'}`}>
                    <List size={18}/>
                 </button>
                 <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#052648] text-white' : 'text-slate-400 hover:bg-slate-100'}`}>
                    <LayoutGrid size={18}/>
                 </button>
            </div>
         </div>

         {/* LIGNE 2 : Filtres Catégoriels */}
         <div className="flex flex-wrap gap-2 items-center text-sm">
             <div className="flex items-center gap-1 text-slate-400 mr-2 text-xs uppercase font-bold"><Filter size={14}/> Filtres :</div>
             
             {/* Domains (Dropdown simple simulé par toggle buttons) */}
             <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar max-w-md">
                 {AVAILABLE_DOMAINS.map(domain => (
                     <button 
                        key={domain} 
                        onClick={() => toggleDomain(domain)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap
                            ${selectedDomains.includes(domain) 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                            }
                        `}
                     >
                         {domain}
                     </button>
                 ))}
             </div>

             <div className="w-px h-4 bg-slate-200 mx-2"/>

             {/* Statut Maîtrise */}
             <div className="flex bg-slate-100 p-1 rounded-lg">
                {(['all', 'mastered', 'progress', 'todo'] as const).map(l => (
                    <button
                        key={l}
                        onClick={() => setLevelFilter(l)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                            levelFilter === l ? 'bg-white shadow text-[#052648]' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {l === 'all' ? 'Tout' : l === 'mastered' ? 'Maîtrisé' : l === 'progress' ? 'En cours' : 'Faible'}
                    </button>
                ))}
             </div>

             {/* Urgence (Radio Style) */}
             <div className="flex items-center gap-2 ml-auto">
                 <label className="flex items-center gap-1 cursor-pointer">
                     <input type="radio" name="urgency" checked={urgencyFilter === 'urgent'} onChange={() => setUrgencyFilter('urgent')} className="accent-red-500" /> 
                     <span className={`text-xs ${urgencyFilter === 'urgent' ? 'text-red-600 font-bold' : 'text-slate-500'}`}>Urgent 🔥</span>
                 </label>
                 <label className="flex items-center gap-1 cursor-pointer">
                     <input type="radio" name="urgency" checked={urgencyFilter === 'all'} onChange={() => setUrgencyFilter('all')} className="accent-blue-500" />
                     <span className={`text-xs ${urgencyFilter === 'all' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>Tous</span>
                 </label>
             </div>
         </div>
      </div>


      {/* -------------------- SECTION 3: LISTE / GRILLE -------------------- */}
      
      {filteredSkills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
             <Filter size={48} className="mb-4 opacity-50"/>
             <p>Aucune compétence ne correspond aux filtres actuels.</p>
             <button onClick={() => { setSearchQuery(''); setSelectedDomains([]); setLevelFilter('all'); }} className="mt-4 text-blue-600 font-semibold text-sm hover:underline">Réinitialiser les filtres</button>
          </div>
      ) : viewMode === 'list' ? (
        
        // --- VUE TABLEAU DÉTAILLÉ ---
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Compétence / Domaine</th>
                            <th className="px-6 py-4 w-48">Niveau Maîtrise</th>
                            <th className="px-6 py-4 text-center">Tentatives</th>
                            <th className="px-6 py-4 text-center">Dernière Pratique</th>
                            <th className="px-6 py-4 text-center">Streak</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredSkills.map((s) => {
                            const masteryPct = Math.round(s.mastery_level * 100);
                            const total = s.success_count + s.failure_count;
                            const lastPracticeDate = new Date(s.last_practice);
                            const daysAgo = Math.floor((new Date().getTime() - lastPracticeDate.getTime()) / (1000 * 3600 * 24));
                            
                            return (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-[#052648] text-base mb-1 cursor-pointer hover:underline">{s.name}</p>
                                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full uppercase border font-bold tracking-wider ${getDomainColor(s.domain)}`}>
                                            {s.domain}
                                        </span>
                                    </td>
                                    
                                    <td className="px-6 py-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${getProgressColor(s.mastery_level)}`} style={{width: `${masteryPct}%`}}></div>
                                            </div>
                                            <span className="font-bold text-slate-700 text-xs w-8 text-right">{masteryPct}%</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                                <span className="text-emerald-600">{s.success_count}✓</span> / <span className="text-red-500">{s.failure_count}✗</span>
                                            </span>
                                            <span className="text-[10px] text-slate-400 mt-1">{total} essais</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-xs font-medium ${daysAgo > 14 ? 'text-red-500 font-bold flex items-center justify-center gap-1' : 'text-slate-600'}`}>
                                            {daysAgo > 14 && <AlertTriangle size={12}/>}
                                            {daysAgo === 0 ? "Aujourd'hui" : `Il y a ${daysAgo}j`}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1 font-bold text-amber-500">
                                            <Flame size={16} className={s.streak > 3 ? "fill-amber-500" : ""}/>
                                            {s.streak}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 bg-[#052648] hover:bg-blue-900 text-white rounded-lg shadow-md transition-transform hover:scale-105" title="Pratiquer">
                                                <RefreshCcw size={16} />
                                            </button>
                                            <button className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg" title="Détails">
                                                <BookOpen size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

      ) : (

        // --- VUE GRILLE (CARTES) ---
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4">
             {filteredSkills.map(s => {
                 const masteryPct = Math.round(s.mastery_level * 100);
                 const daysAgo = Math.floor((new Date().getTime() - new Date(s.last_practice).getTime()) / (1000 * 3600 * 24));
                 
                 return (
                     <div key={s.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg transition-all group hover:-translate-y-1 relative overflow-hidden">
                         
                         {/* Badge Urgence en absolu */}
                         {daysAgo > 14 && (
                             <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                                 À RÉVISER
                             </div>
                         )}

                         <div className="mb-4">
                             <div className={`text-[9px] uppercase font-bold tracking-widest mb-2 w-fit px-2 py-0.5 rounded border ${getDomainColor(s.domain)}`}>{s.domain}</div>
                             <h3 className="text-base font-bold text-[#052648] line-clamp-1 mb-1" title={s.name}>{s.name}</h3>
                         </div>

                         {/* Barre Progrès Large */}
                         <div className="mb-4">
                             <div className="flex justify-between text-xs mb-1">
                                 <span className="text-slate-400 font-medium">Maîtrise</span>
                                 <span className={`font-bold ${s.mastery_level >= 0.7 ? 'text-emerald-600' : s.mastery_level < 0.4 ? 'text-red-500' : 'text-amber-500'}`}>{masteryPct}%</span>
                             </div>
                             <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                 <div className={`h-full ${getProgressColor(s.mastery_level)}`} style={{width: `${masteryPct}%`}}/>
                             </div>
                         </div>

                         {/* Métriques */}
                         <div className="grid grid-cols-2 gap-2 text-xs mb-5">
                             <div className="bg-slate-50 p-2 rounded-lg flex flex-col">
                                 <span className="text-slate-400">Dernier essai</span>
                                 <span className="font-semibold text-slate-700">{daysAgo === 0 ? "Aujourd'hui" : `${daysAgo}j`}</span>
                             </div>
                             <div className="bg-slate-50 p-2 rounded-lg flex flex-col">
                                 <span className="text-slate-400">Taux réussite</span>
                                 <span className="font-semibold text-slate-700">
                                     {Math.round((s.success_count / (s.success_count + s.failure_count || 1)) * 100)}%
                                 </span>
                             </div>
                         </div>

                         {/* Footer Actions */}
                         <div className="flex gap-2">
                             <button className="flex-1 bg-[#052648] text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors flex items-center justify-center gap-2">
                                <RefreshCcw size={14}/> Pratiquer
                             </button>
                             <button className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors">
                                 <MoreHorizontal size={18}/>
                             </button>
                         </div>
                     </div>
                 );
             })}
        </div>
      )}
    </div>
  );
}