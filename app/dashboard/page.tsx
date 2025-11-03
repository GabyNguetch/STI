'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import Overview from '@/components/dashboard/Overview';
import Journey from '@/components/dashboard/Journey';
import RedoExams from '@/components/dashboard/RedoExams';
import Settings from '@/components/dashboard/Settings';
import { MOCK_DASHBOARD_DATA } from '@/types/dashboard/mockData';
import { NavItem } from '@/types/dashboard/dashboard';

const DashboardPage = () => {
  // État pour suivre l'onglet actif, par défaut sur 'overview'
  const [activeTab, setActiveTab] = useState<NavItem['id']>('overview');

  // Les données seraient normalement récupérées ici via une API
  const data = MOCK_DASHBOARD_DATA;

  // Fonction pour afficher le bon composant en fonction de l'onglet actif
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview stats={data.stats} cases={data.cases} />;
      case 'journey':
        return <Journey />;
      case 'redo':
        return <RedoExams cases={data.cases} />;
      case 'settings':
        return <Settings user={data.user} />;
      default:
        return <Overview stats={data.stats} cases={data.cases} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={data.user} />
        
        {/* La zone de contenu principal qui défile si nécessaire */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;