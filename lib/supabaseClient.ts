// lib/supabaseClient.ts

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    // Crée un client Supabase pour le navigateur
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}