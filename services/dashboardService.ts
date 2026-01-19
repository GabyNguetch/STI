// services/dashboardService.ts
import { apiClient } from '@/lib/apiClient';

// Types pour le dashboard
export interface DashboardStats {
  clinicalCasesCount: number;
  symptomsCount: number;
  pathologiesCount: number;
  treatmentsCount: number;
  learnersCount: number;
  categoriesDistribution: { name: string; value: number; color: string }[];
  recentCases: any[];
}

const LEARNERS_API_URL = "https://appren-docker.onrender.com/learners/"; // URL Externe

export const getExpertDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // 1. Récupération parallèle des données du Backend Expert
    const [cases, symptoms, pathologies, treatments] = await Promise.all([
      apiClient<any[]>('/clinical-cases/'),
      apiClient<any[]>('/symptoms/'),
      apiClient<any[]>('/diseases/'),
      apiClient<any[]>('/medications/') // ou /treatments/ selon l'API
    ]);

    // 2. Récupération des Apprenants (API Externe)
    let learnersCount = 0;
    try {
        const learnersRes = await fetch(LEARNERS_API_URL);
        const learners = await learnersRes.json();
        learnersCount = Array.isArray(learners) ? learners.length : 0;
    } catch (e) {
        console.warn("Learner API inaccessible:", e);
    }

    // 3. Calcul de la distribution par catégorie (Logique Frontend si le backend ne le fait pas)
    const categoryMap: Record<string, number> = {};
    cases.forEach((c: any) => {
        // Fallback si la catégorie est dans la pathologie liée ou directe
        const cat = c.pathologie_principale?.categorie || c.service || "Général"; 
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const colors = ['#052648', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    const categoriesDistribution = Object.keys(categoryMap).map((key, index) => ({
        name: key,
        value: categoryMap[key],
        color: colors[index % colors.length]
    }));

    return {
      clinicalCasesCount: cases.length,
      symptomsCount: symptoms.length,
      pathologiesCount: pathologies.length,
      treatmentsCount: treatments.length,
      learnersCount: learnersCount,
      categoriesDistribution,
      recentCases: cases.slice(-5).reverse() // Les 5 derniers
    };
  } catch (error) {
    console.error("Dashboard Data Error", error);
    // Retourne des données vides pour ne pas casser l'UI
    return {
        clinicalCasesCount: 0, symptomsCount: 0, pathologiesCount: 0, treatmentsCount: 0, learnersCount: 0, categoriesDistribution: [], recentCases: []
    };
  }
};