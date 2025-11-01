'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
// Importation des icônes nécessaires, y compris les nouvelles pour les outils
import { Stethoscope, Heart, Baby, Ear, Brain, Eye, Bone, Wind, Activity, X, Send, User, Clock, FileText, Shuffle, Thermometer, Gauge, TestTube, Lightbulb, UserRound } from 'lucide-react';
import Link from 'next/link';

const MedicalSimulation = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedService, setSelectedService] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  // 2- État pour le niveau de difficulté, par défaut 'Profane'
  const [difficulty, setDifficulty] = useState('Profane'); 
  // 8- Compteur de messages de l'étudiant
  const [messageCount, setMessageCount] = useState(0); 
  // 7- État pour afficher le panel d'infos patient dans le chat
  const [isPatientPanelVisible, setPatientPanelVisible] = useState(false);

  const isGameOver = messageCount >= 5;

  const services = [
    { id: 'cardio', name: 'Cardiologie', icon: Heart, bgImage: '/images/services/cardiologie.jpeg' },
    { id: 'pediatrie', name: 'Pédiatrie', icon: Baby, bgImage: '/images/services/pediatrie.jpeg' },
    { id: 'orl', name: 'ORL', icon: Ear, bgImage: '/images/services/orl.jpeg' },
    { id: 'neuro', name: 'Neurologie', icon: Brain, bgImage: '/images/services/neuro.jpeg' },
    { id: 'ophtalmo', name: 'Ophtalmologie', icon: Eye, bgImage: '/images/services/ophtalmo.jpeg' },
    { id: 'ortho', name: 'Orthopédie', icon: Bone, bgImage: '/images/services/ortho.jpeg' },
    { id: 'pneumo', name: 'Pneumologie', icon: Wind, bgImage: '/images/services/pneumo.jpeg' },
    { id: 'urgence', name: 'Urgences', icon: Activity, bgImage: '/images/services/urgences.jpeg' },
  ];
  
  const difficultyLevels = ['Profane', 'Débutant', 'Intermédiaire', 'Confirmé', 'Expert'];
  
  // Données des patients structurées pour les outils de diagnostic
  const patientsData = {
    cardio: {
      nom: 'M. Kamdem Jean', age: 58, sexe: 'Masculin', motif: 'Douleur thoracique et essoufflement', antecedents: 'Hypertension artérielle, tabagisme', symptomes: 'Douleur oppressive rétrosternale irradiant vers le bras gauche, dyspnée, sueurs',
      signesVitaux: 'TA: 160/95 mmHg, FC: 98 bpm, FR: 22/min, SpO2: 94%',
      temperature: '37.1°C', pressionArterielle: '160/95 mmHg', saturationOxygene: '94%', examenClinique: 'Ausculation cardiaque: Bruits du cœur réguliers, pas de souffle. Auscultation pulmonaire: murmure vésiculaire conservé.', analyseBiologique: 'Troponine élevée.',
      diagnostic: 'Syndrome coronarien aigu'
    },
    pediatrie: {
      nom: 'Bébé Ngo\'o Marie', age: 2, sexe: 'Féminin', motif: 'Fièvre et difficultés respiratoires', antecedents: 'Prématurée, vaccination à jour', symptomes: 'Fièvre 39.5°C, toux productive, geignement expiratoire, tirage intercostal',
      signesVitaux: 'T: 39.5°C, FC: 145 bpm, FR: 55/min, SpO2: 89%',
      temperature: '39.5°C', pressionArterielle: '90/60 mmHg', saturationOxygene: '89%', examenClinique: 'Râles crépitants à l\'auscultation du poumon droit.', analyseBiologique: 'Hyperleucocytose à polynucléaires neutrophiles.',
      diagnostic: 'Pneumonie aiguë'
    },
     // ... (Remplir les données pour les autres services avec les nouveaux champs)
  };

  const diagnosticTools = useMemo(() => [
    { name: 'Température', icon: Thermometer, key: 'temperature', patientValue: patientData?.temperature },
    { name: 'Pression Art.', icon: Gauge, key: 'pressionArterielle', patientValue: patientData?.pressionArterielle },
    { name: 'Saturation O2', icon: Wind, key: 'saturationOxygene', patientValue: patientData?.saturationOxygene },
    { name: 'Examen Clinique', icon: Stethoscope, key: 'examenClinique', patientValue: patientData?.examenClinique },
    { name: 'Biologie', icon: TestTube, key: 'analyseBiologique', patientValue: patientData?.analyseBiologique },
  ], [patientData]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    // On prend le patient du service ou un patient par défaut si non défini
    setPatientData(patientsData[service.id] || Object.values(patientsData)[0]);
    setCurrentView('patientInfo');
  };

  const handleRandomCase = () => {
    const randomService = services[Math.floor(Math.random() * services.length)];
    handleServiceSelect(randomService);
  };
  
  const addSystemMessage = (text, icon = Lightbulb) => {
    const systemMessage = {
      sender: 'system',
      text: text,
      icon: icon,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  // 6- Fonction pour ajouter le résultat d'un outil dans le chat
  // MODIFIÉ: handleToolClick pour passer l'icône
  const handleToolClick = (tool) => {
    if (tool.patientValue) {
      addSystemMessage(`${tool.name} : ${tool.patientValue}`, tool.icon); // On passe l'icône ici
    } else {
      addSystemMessage(`Donnée non disponible pour : ${tool.name}`, Lightbulb);
    }
  };

    // NOUVEAU: useRef et useEffect pour le défilement automatique
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const startConsultation = () => {
    setCurrentView('consultation');
    setMessages([
      { sender: 'patient', text: `Bonjour docteur. ${patientData.motif}.`, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
    ]);
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || isGameOver) return;
    
    const newMessage = {
      sender: 'doctor',
      text: inputMessage,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    
    // 8- Incrémentation du compteur de messages
    setMessageCount(prev => prev + 1);
    setMessages([...messages, newMessage]);
    setInputMessage('');
    
    // Simulation de la réponse du patient
    setTimeout(() => {
      const responses = ["Oui docteur, exactement.", "Ça a commencé il y a quelques jours...", "Non, je n'ai pas d'autres symptômes.", "La douleur est vraiment intense."];
      const patientResponse = { sender: 'patient', text: responses[Math.floor(Math.random() * responses.length)], time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, patientResponse]);
    }, 1500);
  };

  const resetSimulation = () => {
    setCurrentView('home');
    setSelectedService(null);
    setPatientData(null);
    setMessages([]);
    setInputMessage('');
    setMessageCount(0); // Réinitialiser le compteur
    setPatientPanelVisible(false); // Cacher le panel
  };

  // 7- Composant réutilisable pour afficher les détails du patient
  const PatientInfoPanel = ({ data, service, onClose }) => (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full relative">
        {onClose && (
           <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-[#052648] transition-colors">
            <X className="w-6 h-6" />
           </button>
        )}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-lg bg-[#052648] flex items-center justify-center shadow-lg flex-shrink-0">
            <service.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#052648]">{service.name}</h2>
            <p className="text-slate-500 text-sm">Rappel du cas clinique</p>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <p><strong className="text-[#052648]">Patient:</strong> {data.nom}, {data.age} ans</p>
          <p><strong className="text-[#052648]">Motif:</strong> {data.motif}</p>
          <p><strong className="text-[#052648]">Antécédents:</strong> {data.antecedents}</p>
          <p><strong className="text-[#052648]">Symptômes:</strong> {data.symptomes}</p>
          <p><strong className="text-[#052648]">Signes Vitaux:</strong> {data.signesVitaux}</p>
        </div>
      </div>
    </div>
  );
  
  // 5- Harmonisation de la couleur principale
  const mainColor = '#052648';

  return (
    // La classe 'font-sans' peut être remplacée par la police de votre choix si vous en avez une configurée.
    <div className={`min-h-screen bg-[${mainColor}] relative overflow-hidden font-sans`}>
       
       {/* 3- L'image de fond reste pour l'accueil et les infos patient */}
      {(currentView === 'home' || currentView === 'patientInfo') && (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/hopital.jpg)' }}>
            <div className="absolute inset-0 bg-black/50"></div> {/* Assombrissement pour la lisibilité */}
        </div>
      )}
            {/* NOUVEAU: Fond d'écran global pour la vue consultation */}
      {currentView === 'consultation' && (
        <>
            <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: 'url(/images/consultation.jpg)' }} />
            <div className="absolute inset-0 bg-[#052648]/70 backdrop-blur-md z-0" />
        </>
      )}
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-[${mainColor}] border-2 border-white/50 flex items-center justify-center shadow-lg`}>
              <Link href='/' ><Stethoscope className="w-6 h-6 text-white" /></Link>
            </div>
            <div>
              <h1 className="text-2xl font-bold">FullTang</h1>
              <p className="text-white/70 text-xs">Simulation Médicale</p>
            </div>
          </div>
          {currentView !== 'home' && (
            <button onClick={resetSimulation} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
        
          {/* 1 & 2 - Vue choix du service (refaite avec Tailwind) */}
          {currentView === 'home' && (
            <div className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 max-w-3xl w-full`}>
              <h2 className={`text-2xl font-bold text-[${mainColor}] text-center`}>Choisissez un service</h2>
              <p className="text-slate-600 text-center mb-6 text-sm">Sélectionnez une spécialité pour commencer un cas clinique.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {services.map(service => (
                  <button key={service.id} onClick={() => handleServiceSelect(service)}
                    className="group relative aspect-square rounded-xl overflow-hidden text-white font-bold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    {/* 2- Image de fond avec blur */}
                    <div className="absolute inset-0 bg-cover bg-center backdrop-blur-md scale-110 group-hover:blur-none transition-all duration-300" 
                         style={{backgroundImage: `url(${service.bgImage})`}}></div>
                    {/* 2- Superposition de couleur pour la lisibilité */}
                    <div className={`absolute inset-0 bg-[${mainColor}] opacity-70 group-hover:opacity-60 transition-opacity duration-300`}></div>
                    {/* 2- Contenu (icône et nom) centré */}
                    <div className="relative h-full flex flex-col items-center justify-center p-2 text-center">
                      <service.icon className="w-8 h-8 mb-2 transform group-hover:scale-110 transition-transform duration-300"/>
                      <span className="text-sm">{service.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* 2- Choix du niveau de difficulté */}
              <div className="mb-6">
                 <p className="text-center text-sm text-slate-700 font-semibold mb-3">Niveau de difficulté</p>
                 <div className="flex justify-center gap-2 flex-wrap">
                   {difficultyLevels.map(level => (
                     <button key={level} onClick={() => setDifficulty(level)}
                       className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 ${
                         difficulty === level ? `bg-[${mainColor}] text-white shadow-md` : `bg-slate-200 text-slate-700 hover:bg-slate-300`
                       }`}
                     >{level}</button>
                   ))}
                 </div>
              </div>
              
              <button onClick={handleRandomCase} className={`w-full bg-[${mainColor}] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity duration-300 flex items-center justify-center gap-2`}>
                <Shuffle className="w-5 h-5" />
                CAS ALÉATOIRE
              </button>
            </div>
          )}

          {/* 3 & 4 - Vue des informations du patient */}
          {currentView === 'patientInfo' && patientData && (
             <div className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 max-w-xl w-full`}>
               <div className="flex items-center gap-4 mb-4">
                 <div className={`w-12 h-12 rounded-lg bg-[${mainColor}] flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <selectedService.icon className="w-6 h-6 text-white"/>
                 </div>
                 <div>
                   <h2 className={`text-2xl font-bold text-[${mainColor}]`}>{selectedService.name}</h2>
                   <p className="text-slate-500">Dossier patient</p>
                 </div>
               </div>
               <div className="space-y-3 text-sm bg-slate-50 p-4 rounded-lg">
                  <p><strong className={`text-[${mainColor}]`}>Identité:</strong> {patientData.nom}, {patientData.age} ans</p>
                  <p><strong className={`text-[${mainColor}]`}>Motif:</strong> {patientData.motif}</p>
                  <p><strong className={`text-[${mainColor}]`}>Antécédents:</strong> {patientData.antecedents}</p>
               </div>
                <button onClick={startConsultation}
                  className={`w-full mt-6 bg-[${mainColor}] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity duration-300`}>
                  Commencer la consultation
                </button>
             </div>
          )}
            {/* 6, 7, 8, 9 - Vue Consultation */}
          {currentView === 'consultation' && patientData && (
            <div className="fixed inset-0 top-24 left-40 p-4 space-x-64 rounded-md flex">
              {/* === SECTION GAUCHE : CHAT === */}
            <div className="col-span-12 lg:col-span-12 flex flex-col bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
                
                {/* En-tête du chat amélioré */}
                <div className="flex-shrink-0 p-4 border-b border-slate-200 bg-slate-50">
                  <button onClick={() => setPatientPanelVisible(true)} className="w-full text-left group">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                         <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#052648] to-blue-700 flex items-center justify-center text-white shadow-md">
                           <UserRound className="w-7 h-7" />
                         </div>
                         <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-50 animate-pulse" title="Patient en ligne"></div>
                      </div>
                      <div>
                        <h3 className="text-[#052648] font-bold text-lg group-hover:text-blue-700 transition-colors">{patientData.nom}</h3>
                        <p className="text-slate-500 text-sm">Patient du service {selectedService.name}</p>
                      </div>
                      <FileText className="w-5 h-5 text-slate-400 ml-auto group-hover:text-blue-700 transition-colors" />
                    </div>
                  </button>
                </div>

                {/* Zone des messages avec avatars */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100/50">
                  {messages.map((msg, index) => {
                        if (msg.sender === 'system') {
                        const Icon = msg.icon; // On assigne le composant à une variable avec une majuscule
                        return (
                            <div key={index} className="flex items-center justify-center gap-3 text-slate-500 text-xs animate-fade-in">
                            {Icon && <Icon className="w-4 h-4 flex-shrink-0" />} {/* On utilise la variable avec majuscule */}
                            <span className="bg-slate-200/80 px-3 py-1 rounded-full">{msg.text}</span>
                            <span>{msg.time}</span>
                            </div>
                        );
                        }
                    
                    const isDoctor = msg.sender === 'doctor';
                    return (
                      <div key={index} className={`flex items-end gap-3 ${isDoctor ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                        {!isDoctor && (
                           <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0">
                             <User className="w-4 h-4 text-slate-600" />
                           </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl p-3 shadow-md ${
                          isDoctor
                            ? 'bg-gradient-to-br from-[#052648] to-blue-700 text-white rounded-br-lg'
                            : 'bg-white text-slate-800 rounded-bl-lg'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <p className={`text-xs mt-2 text-right ${isDoctor ? 'text-blue-200/70' : 'text-slate-400'}`}>
                            {msg.time}
                          </p>
                        </div>
                         {isDoctor && (
                           <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                             <Stethoscope className="w-4 h-4 text-[#052648]" />
                           </div>
                        )}
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} /> {/* Ancre pour le défilement */}
                  
                  {isGameOver && (
                    <div className="text-center p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                      <p className="font-semibold">Échec de la simulation !</p>
                      <p className="text-sm">Vous avez utilisé toutes vos questions.</p>
                      <button onClick={resetSimulation} className="mt-2 text-sm text-blue-600 hover:underline">Recommencer un cas</button>
                    </div>
                  )}
                </div>

                {/* Zone de saisie avec visualisation des messages restants */}
                <div className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
                  <div className="mb-2 px-1">
                      <p className="text-xs text-slate-500 mb-1">Questions restantes: {5 - messageCount} / 5</p>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className={`bg-gradient-to-r from-blue-400 to-[#052648] h-1.5 rounded-full transition-all duration-500`} style={{width: `${(5 - messageCount) / 5 * 100}%`}}></div>
                      </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={isGameOver ? "Limite de messages atteinte" : "Posez une question au patient..."}
                      disabled={isGameOver}
                      className="flex-1 w-full px-4 py-2.5 bg-slate-100 rounded-xl border-2 border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 disabled:bg-slate-200 disabled:cursor-not-allowed"/>
                    <button onClick={sendMessage} disabled={isGameOver || !inputMessage.trim()}
                      className="p-3 bg-gradient-to-br from-[#052648] to-blue-700 text-white rounded-full hover:scale-110 active:scale-95 transition-transform duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>


              {/* === SECTION DROITE : VISUEL === */}
              <div className="w-1/2 relative bg-transparent flex items-center justify-center">
                <div className="text-center space-y-6 p-8 max-w-md">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#052648] to-blue-700 rounded-full flex items-center justify-center shadow-xl">
                    <Stethoscope className="w-10 h-10 text-white animate-pulse" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-50">Salle de consultation</h3>
                  <p className="text-gray-200 text-lg">
                    Échangez avec le patient pour établir votre diagnostic
                  </p>
                  <div className="mt-8 p-6 bg-tranparent">
                    <p className="text-sm text-gray-300 mb-3">Diagnostic attendu:</p>
                    <p className="font-semibold text-xl text-gray-200 blur-sm hover:blur-none transition-all duration-300 cursor-help">
                      {patientData.diagnostic}
                    </p>
                    <p className="text-xs text-gray-300 mt-3">(Survolez pour révéler)</p>
                  </div>
                </div>

                {/* Sidebar des outils - Colonne fixe en bas à droite */}
                <div className="absolute top-16 right-2 flex flex-col gap-3">
                  {diagnosticTools.map(tool => (
                    <div key={tool.name} className="group relative">
                      <button onClick={() => handleToolClick(tool)}
                        className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-[#052648] to-blue-700 hover:from-blue-700 hover:to-[#052648] text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110">
                        <tool.icon className="w-6 h-6" />
                      </button>
                      <div className="absolute top-1/2 -translate-y-1/2 right-full mr-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                        {tool.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {isPatientPanelVisible && (
                <PatientInfoPanel 
                  data={patientData} 
                  service={selectedService} 
                  onClose={() => setPatientPanelVisible(false)}
                />
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default MedicalSimulation;