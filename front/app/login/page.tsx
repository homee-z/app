'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [magicLinkMessage, setMagicLinkMessage] = useState<string | null>(null);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [showMagicLinkForm, setShowMagicLinkForm] = useState(false);
  const [magicEmail, setMagicEmail] = useState('');

  const handleMagicLinkSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMagicLinkMessage(null);
    setMagicLinkLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const targetEmail = magicEmail || email;
      if (!targetEmail) {
        throw new Error('Veuillez renseigner votre adresse email.');
      }

      const res = await fetch(`${apiUrl}/auth/magic-link/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de l envoi du Magic Link');
      }

      setMagicLinkMessage(data.message || 'Lien magique envoyé ! Vérifiez vos emails.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setMagicLinkLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Identifiants incorrects');
      }

      if (data.accessToken) {
        sessionStorage.setItem('accessToken', data.accessToken);
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors de la connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Connexion</h1>

      {error && (
        <div role="alert" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">Email</label>
          <br />
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">Mot de passe</label>
          <br />
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button type="button" onClick={() => alert('Flux OAuth2 Google à brancher')}>
          Continuer avec Google
        </button>
        <button
          type="button"
          onClick={() => setShowMagicLinkForm(!showMagicLinkForm)}
        >
          {showMagicLinkForm ? 'Fermer le Magic Link' : 'Se connecter par Magic Link (sans mot de passe)'}
        </button>
      </div>

      {showMagicLinkForm && (
        <div style={{ marginTop: '1rem', border: '1px dashed #ccc', padding: '1rem' }}>
          <h3>Connexion par lien magique</h3>
          {magicLinkMessage && (
            <div style={{ color: 'green', marginBottom: '0.5rem' }}>
              {magicLinkMessage}
            </div>
          )}
          <form onSubmit={handleMagicLinkSubmit}>
            <div style={{ marginBottom: '0.5rem' }}>
              <label htmlFor="magicEmail">Votre email :</label>
              <br />
              <input
                id="magicEmail"
                type="email"
                required
                placeholder="nom@exemple.com"
                value={magicEmail || email}
                onChange={(e) => setMagicEmail(e.target.value)}
              />
            </div>
            <button type="submit" disabled={magicLinkLoading}>
              {magicLinkLoading ? 'Envoi...' : 'M\'envoyer un lien de connexion'}
            </button>
          </form>
        </div>
      )}

      <p style={{ marginTop: '1.5rem' }}>
        Pas encore de compte ? <Link href="/register">S&apos;inscrire</Link>
      </p>
    </main>
  );
}