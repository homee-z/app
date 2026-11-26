'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  deleteAccount,
  getProfile,
  updateProfile,
  type UserProfile,
} from '@/lib/api/users.api';
import { HouseholdsCard } from './households-card';
import { ApiError } from '@/lib/errors';

const card = 'rounded-[18px] bg-white p-5 sm:rounded-[20px] sm:p-7';
const cardTitle = 'font-display font-extrabold text-[15px] text-[#20241b] sm:text-base';
const label = 'mb-1.5 block text-[13px] font-semibold text-[#20241b]';
const field =
  'w-full rounded-[10px] border border-[#e6e2da] bg-[#faf9f6] px-3.5 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#c1622a] sm:text-[14.5px]';

export default function ProfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fill = (p: UserProfile) => {
    setProfile(p);
    setFirstName(p.firstName);
    setLastName(p.lastName);
    setEmail(p.email);
  };

  const handleError = (err: unknown) => {
    if (err instanceof ApiError && err.status === 401) {
      router.push('/login');
      return;
    }
    setError(err instanceof Error ? err.message : 'Une erreur est survenue');
  };

  useEffect(() => {
    getProfile().then(fill).catch(handleError).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      fill(await updateProfile({ firstName, lastName, email }));
      setSuccess('Profil mis à jour.');
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteAccount();
      router.push('/login');
    } catch (err) {
      handleError(err);
    }
  };

  if (loading) return <p className="p-8 text-[#8a8577]">Chargement…</p>;

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <main className="mx-auto flex w-full max-w-[640px] flex-col gap-[22px] px-5 pb-12 pt-7 sm:gap-7 sm:px-6 sm:pb-20 sm:pt-12">
        <header>
          <h1 className="font-display font-extrabold text-[21px] text-[#20241b] sm:text-[26px]">
            Paramètres du profil
          </h1>
          <nav className="mt-1 flex gap-[18px] sm:gap-5">
            <span className="border-b-2 border-[#c1622a] pb-1.5 text-[13px] font-bold text-[#c1622a] sm:text-[13.5px]">
              Profil
            </span>
            <Link
              href="/parametres/foyer"
              className="pb-1.5 text-[13px] font-semibold text-[#8a8577] sm:text-[13.5px]"
            >
              Foyer
            </Link>
          </nav>
        </header>

        {error && (
          <div role="alert" className="rounded-xl border border-[#f0d9d9] bg-white p-3 text-sm text-[#b23a3a]">
            {error}
          </div>
        )}
        {success && (
          <div role="status" className="rounded-xl bg-white p-3 text-sm text-[#20241b]">
            {success}
          </div>
        )}

        {/* Photo : bouton désactivé tant que POST /users/me/avatar n'existe pas */}
        <section className={`${card} flex items-center gap-3.5 sm:gap-5`}>
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#c1622a] text-lg font-bold text-white sm:size-[76px] sm:text-2xl">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              profile?.firstName?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-extrabold text-[14.5px] text-[#20241b] sm:truncate sm:text-base">
              {profile?.name}
            </p>
            <p className="hidden text-[13px] text-[#8a8577] sm:block">JPG ou PNG, 2 Mo max.</p>
            {/* Mobile : lien orange sous le nom */}
            <button
              type="button"
              disabled
              title="Bientôt disponible"
              className="mt-0.5 text-[12.5px] font-bold text-[#c1622a] sm:hidden"
            >
              Changer la photo
            </button>
          </div>
          {/* Desktop : bouton à droite */}
          <button
            type="button"
            disabled
            title="Bientôt disponible"
            className="hidden rounded-xl border border-[#e6e2da] px-[18px] py-[11px] text-[13.5px] font-bold text-[#25291f] opacity-50 sm:block"
          >
            Changer la photo
          </button>
        </section>

        <form onSubmit={handleSubmit} className={`${card} flex flex-col gap-3.5 sm:gap-[18px]`}>
          <h2 className={cardTitle}>Informations</h2>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className={label}>Prénom</label>
              <input id="firstName" className={field} required maxLength={100}
                value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="lastName" className={label}>Nom</label>
              <input id="lastName" className={field} required maxLength={100}
                value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="email" className={label}>Adresse email</label>
            <input id="email" type="email" className={field} required
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[#c1622a] px-[22px] py-3 text-sm font-bold text-white disabled:opacity-60 sm:w-fit"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>

        {profile && <HouseholdsCard userId={profile.id} />}

        {/* TODO: brancher avec l'auth (Karen) */}
        <section className={`${card} space-y-3.5`}>
          <h2 className={cardTitle}>Sécurité</h2>
          {['Mot de passe actuel', 'Nouveau mot de passe', 'Confirmer le mot de passe'].map((p) => (
            <input
              key={p}
              type="password"
              disabled
              placeholder={p}
              aria-label={p}
              className="w-full rounded-[10px] border-[1.5px] border-[#e6e2da] bg-[#faf9f6] px-3.5 py-3 text-sm placeholder:text-[#9a958d] disabled:cursor-not-allowed"
            />
          ))}
          <button
            type="button"
            disabled
            title="Bientôt disponible"
            className="w-full rounded-xl bg-[#c1622a] py-3 text-sm font-bold text-white disabled:cursor-not-allowed"
          >
            Mettre à jour
          </button>
          <hr className="border-[#ece8e0]" />
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] font-bold text-[#20241b]">Authentification 2FA</span>
            <button
              type="button"
              disabled
              title="Bientôt disponible"
              className="rounded-[10px] border border-[#e6e2da] bg-white px-3.5 py-[9px] text-[12.5px] font-bold text-[#25291f] disabled:cursor-not-allowed"
            >
              Configurer
            </button>
          </div>
        </section>

        {/* TODO: brancher PATCH /users/me/notifications */}
        <section className={`${card} space-y-3.5`}>
          <h2 className={cardTitle}>Notifications</h2>
          {[
            { label: 'Résumé hebdomadaire', on: true },
            { label: 'Notifications push', on: true },
            { label: 'Rappels de corvées', on: false },
          ].map(({ label, on }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[13.5px] text-[#20241b]">{label}</span>
              <span
                title="Bientôt disponible"
                aria-disabled
                className={`flex h-[22px] w-[38px] items-center rounded-full p-[3px] ${on ? 'justify-end bg-[#c1622a]' : 'justify-start bg-[#e6e2da]'}`}
              >
                <span className="size-4 rounded-full bg-white" />
              </span>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-3 rounded-[18px] border border-[#f0d9d9] bg-white p-5 sm:gap-4 sm:rounded-[20px] sm:p-7">
          <div>
            <h2 className="font-display font-extrabold text-[14.5px] text-[#b23a3a] sm:text-[15.5px]">
              Supprimer mon compte
            </h2>
            <p className="mt-1 text-[12.5px] text-[#8a8577] sm:text-[13px]">
              Cette action est définitive et supprime toutes vos données.
            </p>
          </div>
          {!confirmDelete ? (
            <button type="button" onClick={() => setConfirmDelete(true)}
              className="w-full rounded-xl border border-[#b23a3a] bg-white px-[18px] py-[11px] text-[13.5px] font-bold text-[#b23a3a] sm:w-fit">
              Supprimer le compte
            </button>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={handleDelete}
                className="rounded-xl bg-[#b23a3a] px-[18px] py-[11px] text-[13.5px] font-bold text-white">
                Oui, supprimer définitivement
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)}
                className="rounded-xl border border-[#e6e2da] px-[18px] py-[11px] text-[13.5px] font-bold text-[#25291f]">
                Annuler
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
