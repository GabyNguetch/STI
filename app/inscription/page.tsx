// app/inscription/page.tsx
'use client';

import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js'; // <-- Importer le type User
import AuthForm from "@/components/auth/Authentification";
import Onboarding from '@/components/auth/Onboarding';

export default function InscriptionPage() {
  // MODIFIÉ : Au lieu d'un booléen, nous stockons l'objet utilisateur ou null.
  const [newlyRegisteredUser, setNewlyRegisteredUser] = useState<User | null>(null);

  // Si un utilisateur vient de s'inscrire, nous avons son objet.
  if (newlyRegisteredUser) {
    // On affiche l'onboarding en lui passant directement l'utilisateur.
    // La prop "user" est ajoutée pour passer les données.
    return <Onboarding user={newlyRegisteredUser} />;
  }
  
  // Par défaut, on affiche le formulaire d'inscription.
  // La prop `onSuccess` est maintenant une fonction qui attend un objet User
  // et met à jour notre état local.
  return <AuthForm mode="register" onSuccess={(user) => setNewlyRegisteredUser(user)} />;
}