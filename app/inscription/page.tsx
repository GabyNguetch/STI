// app/inscription/page.tsx
'use client';

import React, { useState } from 'react';
import AuthForm from "@/components/auth/Authentification";
import Onboarding from "@/components/auth/Onboarding";

export default function InscriptionPage() {
  const [registrationStarted, setRegistrationStarted] = useState(false);

  // Si l'utilisateur a rempli la première étape (AuthForm), on affiche l'Onboarding
  if (registrationStarted) {
    return <Onboarding />;
  }
  
  // Sinon, formulaire initial (Nom/Email -> LocalStorage)
  return <AuthForm mode="register" onSuccess={() => setRegistrationStarted(true)} />;
}