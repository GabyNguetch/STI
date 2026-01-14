// app/api/backend/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// URL Backend (Variable d'environnement recommandée pour la prod)
const API_URL = process.env.BACKEND_API_URL || "https://expert-cmck.onrender.com/api/v1";

/**
 * PROXY INVERSE ROBUSTE (Frontend <-> NextJS Server <-> FastAPI Render)
 * Gère le trailing slash et le nettoyage des headers pour éviter les erreurs CORS/Redirect.
 */
async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  // 1. Résolution des paramètres (Next.js 15+)
  const { path } = await params;
  
  // 2. Construction de l'URL cible
  // FastAPI est sensible aux trailing slashes. Si le dernier segment n'a pas de slash, on fait attention.
  const pathString = path.join('/');
  
  // Gestion query string
  const searchParams = req.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';
  
  // On construit l'URL finale. 
  // Note: On s'assure que si pathString est vide, on tape la racine correctement.
  const targetUrl = `${API_URL}/${pathString}${queryString}`;

  console.log(`🔀 [PROXY] ${req.method} -> ${targetUrl}`);

  // 3. Préparation des headers
  // On ne transfère PAS aveuglément tous les headers du navigateur (surtout pas "Host"), 
  // sinon Render rejette la requête.
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');
  // Ici vous pourrez ajouter votre Token d'Auth Admin plus tard:
  // headers.set('Authorization', `Bearer ${process.env.API_SECRET_KEY}`);

  // 4. Gestion du Body
  const fetchOptions: RequestInit = {
    method: req.method,
    headers: headers,
    // important : "follow" permet à Node.js de suivre la redirection (http->https) 
    // SANS dire au navigateur de le faire.
    redirect: 'follow', 
  };

  if (!['GET', 'HEAD'].includes(req.method)) {
    try {
      const textBody = await req.text();
      if (textBody) {
        fetchOptions.body = textBody;
      }
    } catch (e) {
      console.error("Erreur lecture body proxy", e);
    }
  }

  try {
    // 5. Appel Serveur-à-Serveur
    const response = await fetch(targetUrl, fetchOptions);

    // 6. Gestion des erreurs HTTP du Backend
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [PROXY ERROR ${response.status}]`, errorText);
        return NextResponse.json(
            { error: `Backend Error: ${response.statusText}`, details: errorText }, 
            { status: response.status }
        );
    }

    // 7. Retour propre au Frontend
    // On force la conversion en JSON pour garantir que le navigateur reçoit des données, pas une stream opaque
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("🔥 [PROXY CRASH]", error);
    return NextResponse.json(
      { error: "Erreur de communication avec le serveur expert" }, 
      { status: 502 }
    );
  }
}

// Export pour toutes les méthodes
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;