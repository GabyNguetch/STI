// app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import Overview from '@/components/dashboard/Overview';
import Journey from '@/components/dashboard/Journey';
import RedoExams from '@/components/dashboard/RedoExams';
import Settings from '@/components/dashboard/Settings';
import type { NavItem } from '@/types/dashboard/dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCases, fetchUserProgress } from '@/services/caseService'; // <-- AJOUT
import type { UseCase } from '@/types/simulation/types';
import Library from '@/components/dashboard/Library';
import DashboardSkeleton from '@/components/ui/SkeletonDashboard';// <-- IMPORTEZ LE SQUELETTE
import toast from 'react-hot-toast';
import { milestones as allMilestonesFromMock } from '@/types/dashboard/mockData';

const DashboardPage = () => {
  const router = useRouter();
  const { user, profile, isLoading: isAuthLoading } = useAuth();
  
  // États locaux pour nos données
  const [activeTab, setActiveTab] = useState<NavItem['id']>('overview');
  const [allCases, setAllCases] = useState<UseCase[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push('/connexion');
      } else {
        // L'utilisateur est connecté, on charge ses données
        const loadDashboardData = async () => {
          try {
            const [casesData, progressData] = await Promise.all([
              fetchCases(),
              fetchUserProgress(user.id)
            ]);
            setAllCases(casesData);
            setUserProgress(progressData);
          } catch (error) {
            toast.error("Impossible de charger les données du tableau de bord.");
          } finally {
            setIsLoadingData(false);
          }
        };
        loadDashboardData();
      }
    }
  }, [isAuthLoading, user, router]);
  
  if (isAuthLoading || isLoadingData || !profile || !user) {
    return <DashboardSkeleton />; // <-- RENDRE LE SQUELETTE PENDANT LE CHARGEMENT
  }
  
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        // On passe les données réelles et filtrées à Overview
        return (
            <Overview 
                userProgress={userProgress}
            />
        );
      case 'redo':
         // On passe les listes complètes pour que le composant fasse le calcul
        return <RedoExams allCases={allCases} userProgress={userProgress} />;
      case 'settings':
        return <Settings user={user} profile={profile} />;
      case 'journey':
        return  <Journey allMilestones={allMilestonesFromMock} userProgress={userProgress} />;
      case 'lib':
        return <Library allCases={allCases} userProgress={userProgress} />;
      default:
        return <Overview userProgress={userProgress}/>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header profile={profile} /> 
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">{renderContent()}</main>
      </div>
    </div>
  );
};

export default DashboardPage;