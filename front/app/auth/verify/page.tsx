'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function MagicLinkVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error',
  );
  const [errorMessage, setErrorMessage] = useState<string>(
    token ? '' : 'Aucun token de validation fourni.',
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;
    const verifyToken = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${apiUrl}/auth/magic-link/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Enregistre les cookies access_token et refresh_token
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Lien invalide ou expiré');
        }

        if (isMounted) {
          setStatus('success');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setStatus('error');
          if (err instanceof Error) {
            setErrorMessage(err.message);
          } else {
            setErrorMessage('Erreur lors de la validation du lien magique');
          }
        }
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token, router]);

  return (
    <main style={{ padding: '2rem', maxWidth: '500px', margin: '2rem auto', textAlign: 'center' }}>
      <h1>Connexion Magic Link</h1>

      {status === 'loading' && (
        <p>Vérification de votre lien en cours...</p>
      )}

      {status === 'success' && (
        <div style={{ color: 'green', marginTop: '1rem' }}>
          <p>Connexion réussie ! Redirection vers votre tableau de bord...</p>
        </div>
      )}

      {status === 'error' && (
        <div style={{ color: 'red', marginTop: '1rem' }}>
          <p>{errorMessage}</p>
          <p style={{ marginTop: '1rem' }}>
            <Link href="/login">Retour à la page de connexion</Link>
          </p>
        </div>
      )}
    </main>
  );
}

export default function MagicLinkVerifyPage() {
  return (
    <Suspense fallback={<p style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</p>}>
      <MagicLinkVerifyContent />
    </Suspense>
  );
}
