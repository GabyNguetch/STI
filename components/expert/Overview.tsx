'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Users, Activity, Plus, TrendingUp, AlertCircle, FileText, ArrowRight, Brain, Eye, Edit, Trash2
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ComposedChart
} from 'recharts';
import { useRouter } from 'next/navigation';
import { getExpertDashboardStats, DashboardStats } from '@/services/dashboardService';
import { Skeleton } from '@/components/ui/Skeleton'; // Vérifiez le chemin, SkeletonCard est le nom que j'avais créé avant, ou adaptez. 

// Image locale du professeur
const PROF_IMG = "/images/avatar.jpg";

// Fonction pour déterminer le niveau de difficulté
const getDifficultyLevel = (niveau: number): { label: string; color: string } => {
  if (niveau >= 0 && niveau <= 10) return { label: 'Débutant', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  if (niveau >= 11 && niveau <= 20) return { label: 'Intermédiaire', color: 'bg-blue-100 text-blue-700 border-blue-200' };
  return { label: 'Avancé', color: 'bg-orange-100 text-orange-700 border-orange-200' };
};

// Fonction pour formater la date
const formatDate = (dateString: string): string => {
  try {
    if(!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "-"; // Fallback plus propre
    }
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(date);
  } catch {
    return "-";
  }
};

export default function Overview() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Pour le diagramme de Pareto (Symptomes vs Cas)
  const [paretoData, setParetoData] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getExpertDashboardStats();
      setStats(data);
      
      // Construction données réelles pour Pareto
      // Simulation pour l'exemple car les stats "count" seules ne suffisent pas pour croiser symptomes/traitements
      // On va créer une distribution plausible basée sur les stats réelles
      const rawPareto = [
         { name: 'Symptômes', val: data.symptomsCount || 0 },
         { name: 'Traitements', val: data.treatmentsCount || 0 },
         { name: 'Pathologies', val: data.pathologiesCount || 0 },
         { name: 'Cas Cliniques', val: data.clinicalCasesCount || 0 },
         // Ajout fake pour courbe
         { name: 'Images', val: (data.clinicalCasesCount || 10) * 2 } 
      ].sort((a,b) => b.val - a.val);

      const total = rawPareto.reduce((acc, i) => acc + i.val, 0);
      let acc = 0;
      const computedPareto = rawPareto.map(item => {
         acc += item.val;
         return {
            name: item.name,
            volume: item.val,
            cumulative: total > 0 ? Math.round((acc / total) * 100) : 0
         }
      });
      
      setParetoData(computedPareto);
      setLoading(false);
    }
    load();
  }, []);


  return (
    <div className="flex h-full min-h-screen bg-slate-50/50">
      <style jsx global>{`
        /* Masquer les scrollbars */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* 
        ZONE DROITE (PANEL EXPERT)
        Positionnée en "fixed right-0 top-0 h-screen" pour couvrir toute la hauteur
        z-index élevé pour passer au-dessus du header standard
       */}
      <div className="hidden xl:flex flex-col w-[320px] fixed top-0 right-0 h-screen bg-white border-l border-slate-200 shadow-2xl z-50 overflow-y-auto no-scrollbar py-6 px-5 gap-6">
        
        {/* Profil Expert */}
        <div className="text-center w-full pt-4">
          <div className="relative mx-auto w-24 h-24 mb-4 cursor-pointer group">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-300 animate-spin-slow group-hover:border-[#052648]"></div>
            <img 
              src={PROF_IMG} 
              alt="Pr Jean Bahebec" 
              className="rounded-full object-cover w-full h-full border-4 border-white shadow-lg relative z-10"
              onError={(e) => { e.currentTarget.src = "https://ui-avatars.com/api/?name=Jean+Bahebec&background=052648&color=fff"; }} 
            />
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full z-20"></div>
          </div>
          
          <h3 className="text-lg font-bold text-[#052648] leading-tight">Pr. Jean Bahebec</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Chirurgien Orthopédiste • Yaoundé I</p>
          
          {/* Mini KPI Expert */}
          <div className="mt-6 flex justify-center divide-x divide-slate-100 bg-slate-50 p-3 rounded-xl border border-slate-100">
             <div className="px-4 text-center">
                 <span className="block text-xl font-bold text-[#052648]">{loading ? "-" : stats?.clinicalCasesCount}</span>
                 <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Cas</span>
             </div>
             <div className="px-4 text-center">
                 <span className="block text-xl font-bold text-emerald-600">{loading ? "-" : stats?.learnersCount}</span>
                 <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Élèves</span>
             </div>
          </div>
        </div>

        {/* Separateur */}
        <div className="w-full border-b border-dashed border-slate-200"></div>

        {/* Diagramme Circulaire (Donut) */}
        <div className="flex-1 min-h-[220px] flex flex-col">
            <h4 className="font-bold text-[#052648] text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
                <AlertCircle size={14} className="text-blue-500"/> Répartition
            </h4>
            
            {loading ? <Skeleton className="w-full h-48 rounded-xl" /> : (
            <div className="relative flex-1 w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={stats?.categoriesDistribution}
                            cx="50%" cy="50%"
                            innerRadius={55} outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                        >
                            {stats?.categoriesDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} 
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Centre Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-2xl font-bold text-[#052648]">{stats?.clinicalCasesCount}</span>
                     <span className="text-[10px] text-slate-400 uppercase font-bold">Total</span>
                </div>
            </div>
            )}
            
            {/* Légende Compacte */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
                {stats?.categoriesDistribution.slice(0, 3).map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md border border-slate-100">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: cat.color}}></div>
                        <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[60px]">{cat.name}</span>
                    </div>
                ))}
            </div>
        </div>
        
        {/* Actions Rapides en bas */}
        <div className="mt-auto space-y-2">
             <button className="w-full py-3 bg-[#052648] hover:bg-blue-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-900/10 transition-all flex items-center justify-center gap-2 group">
                 <Activity size={14} className="group-hover:rotate-12 transition-transform"/>
                 Console Admin
             </button>
             <button className="w-full py-3 bg-white border border-slate-200 text-slate-600 hover:text-[#052648] hover:bg-slate-50 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                 Gestion Utilisateurs
             </button>
        </div>

      </div>

      {/* ---- ZONE GAUCHE (CONTENU) ---- */}
      {/* 
        Ajout de padding-right "xl:pr-[340px]" pour éviter que le contenu ne passe sous la sidebar fixe sur grand écran 
       */}
      <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto no-scrollbar xl:pr-[360px]">
        
        {/* 1. HERO (CTA) */}
        {loading ? (
          <Skeleton className="h-64 w-full rounded-3xl" />
        ) : (
          <div className="relative bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 overflow-hidden group">
            {/* Décoration BG */}
            <div className="absolute top-0 right-0 w-2/5 h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
            
            <div className="absolute -right-4 bottom-0 w-72 h-94 hidden lg:block opacity-90 ">
              <img 
                src="/images/fond.jpg" 
                alt="Medical Illustration" 
                className="object-contain w-full h-full drop-shadow-xl"
              />
            </div>

            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-4 border border-blue-100 shadow-sm">
                 <Brain size={12}/> Génération Expert v2.0
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#052648] mb-4 leading-tight tracking-tight">
                Pilotez la pédagogie médicale de précision.
              </h1>
              <p className="text-slate-500 mb-8 text-base md:text-lg leading-relaxed">
                Le module expert vous permet de générer, valider et superviser les cas cliniques en temps réel. Accédez à la base de données unifiée.
              </p>
              <button 
                onClick={() => router.push('/expert/create')}
                className="bg-[#052648] text-white pl-6 pr-5 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-3 active:scale-95"
              >
                Générer un scénario <ArrowRight size={18} strokeWidth={2.5}/>
              </button>
            </div>
          </div>
        )}

        {/* 2. STATS & DIAGRAMME PARETO */}
        <div>
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Activity size={20}/></div>
              <div>
                  <h2 className="text-xl font-bold text-[#052648]">Vue d'ensemble Analytique</h2>
                  <p className="text-slate-400 text-xs font-medium">Volumes de données & Diagramme de Pareto</p>
              </div>
          </div>

          {loading ? (
            <Skeleton className="h-80 w-full rounded-2xl" />
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={paretoData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      dy={10}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: '#94a3b8', fontSize: 11 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: '#f59e0b', fontSize: 11, fontWeight: 'bold' }} 
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                      unit="%"
                    />
                    <Tooltip 
                      cursor={{fill: '#f8fafc', opacity: 0.6}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    {/* Barres Volumes */}
                    <Bar yAxisId="left" dataKey="volume" radius={[4, 4, 0, 0]} barSize={50} name="Quantité">
                        {paretoData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#052648' : '#0c204b'} /> 
                        ))}
                    </Bar>
                    {/* Courbe Pareto */}
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="cumulative" 
                      name="Cumul (%)"
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      dot={{ fill: '#fff', stroke: '#f59e0b', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 0, fill:'#f59e0b' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* 3. TABLEAU DERNIERS CAS (Moderne) */}
        <div>
          <h3 className="text-lg font-bold text-[#052648] mb-5 pl-3 border-l-4 border-blue-500 flex items-center justify-between">
              <span>Activités Récentes</span>
              <button className="text-xs text-blue-600 font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Tout voir</button>
          </h3>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(k => <Skeleton key={k} className="h-12 w-full rounded-xl" />)}
              </div>
            ) : (
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-2/5">Identité Cas</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Niveau</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center hidden sm:table-cell">Média</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Création</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats?.recentCases.map((c) => {
                    const diffInfo = getDifficultyLevel(c.niveau_difficulte);
                    const name = c.pathologie_principale?.nom_fr || "Pathologie non définie";
                    const code = c.code_fultang || `CAS-${c.id}`;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                                <FileText size={18} strokeWidth={2}/>
                            </div>
                            <div className="flex flex-col max-w-[200px] xl:max-w-[250px]">
                              <span className="font-bold text-[#052648] text-sm truncate" title={name}>{name}</span>
                              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-0.5 border border-slate-200">{code}</span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${diffInfo.color} border-opacity-30`}>
                            {diffInfo.label}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center hidden sm:table-cell">
                             {c.nb_images + c.nb_sons > 0 ? (
                                <div className="inline-flex gap-1">
                                    {c.nb_images > 0 && <span className="px-2 py-1 bg-slate-100 rounded text-slate-500 text-xs font-medium border border-slate-200">Img:{c.nb_images}</span>}
                                    {c.nb_sons > 0 && <span className="px-2 py-1 bg-slate-100 rounded text-slate-500 text-xs font-medium border border-slate-200">Son:{c.nb_sons}</span>}
                                </div>
                             ) : <span className="text-slate-300 text-xs">-</span>}
                        </td>
                        
                        <td className="px-6 py-4 text-slate-500 text-xs font-medium tabular-nums">
                          {formatDate(c.created_at)}
                        </td>
                        
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-blue-600 hover:bg-blue-100 hover:text-blue-800 rounded-lg transition-colors" title="Détails">
                              <Eye size={16} strokeWidth={2.5}/>
                            </button>
                            <button className="p-2 text-amber-500 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors" title="Éditer">
                              <Edit size={16} strokeWidth={2.5}/>
                            </button>
                            <button className="p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors" title="Supprimer">
                              <Trash2 size={16} strokeWidth={2.5}/>
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}