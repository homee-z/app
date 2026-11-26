'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProfile } from '@/lib/api/users.api';
import {
  approveMember,
  listMembers,
  listMyHouseholds,
  regenerateCode,
  renameHousehold,
  deleteHousehold,
  rejectMember,
  removeMember,
  updateMemberRole,
} from '@/lib/api/households.api';
import { 
  type Household,
  type HouseholdMember,
  type HouseholdRole,
} from '@/types/household-types';
import { frenchError } from '@/lib/errors';

const AVATAR_COLORS = ['#c1622a', '#2f6f4e', '#5b3e8c', '#3e6b8c'];
const ROLE_LABEL: Record<HouseholdRole, string> = {
  admin: 'Administrateur',
  member: 'Membre',
  guest: 'Invité',
};

const card = 'rounded-[18px] bg-white p-5 lg:rounded-[20px] lg:p-7';
const title = 'font-display text-[15px] font-extrabold text-[#20241b] lg:text-[16px]';
const btnOutline =
  'rounded-[12px] border border-[#e6e2da] bg-white px-[18px] py-[11px] text-[13px] font-bold text-[#25291f] transition-colors hover:bg-[#faf9f6] disabled:opacity-50 lg:text-[13.5px]';

function Avatar({ m, index }: { m: HouseholdMember; index: number }) {
  if (m.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={m.avatarUrl} alt="" className="size-8 shrink-0 rounded-full object-cover lg:size-9" />;
  }
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold text-white lg:size-9 lg:text-[13.5px]"
      style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
    >
      {(m.firstName?.[0] ?? '?').toUpperCase()}
    </span>
  );
}

function FoyerSettings() {
  const router = useRouter();
  const params = useSearchParams();
  const wantedId = params.get('foyer');

  const [me, setMe] = useState<string | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const load = useCallback(async () => {
    try {
      const [profile, all] = await Promise.all([getProfile(), listMyHouseholds()]);
      const admins = all.filter((h) => h.status === 'active' && h.role === 'admin');
      const target = wantedId ? admins.find((h) => h.id === wantedId) : admins[0];
      if (!target) {
        router.replace('/parametres/profil');
        return;
      }
      const list = await listMembers(target.id);
      setMe(profile.id);
      setHousehold(target);
      setCode(target.code ?? '');
      setName(target.name);
      setMembers(list);
      setError(null);
    } catch (err) {
      setError(frenchError(err));
    } finally {
      setLoading(false);
    }
  }, [wantedId, router]);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  // Échap ferme la modale (écouteur global : le fond de la modale n'a pas le focus clavier).
  useEffect(() => {
    if (!inviteOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInviteOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [inviteOpen]);

  async function run(key: string, action: () => Promise<unknown>, overrides?: Partial<Record<number, string>>) {
    setBusy(key);
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(frenchError(err, overrides));
    } finally {
      setBusy(null);
      setConfirmRemove(null);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Impossible de copier le code. Copiez-le manuellement.');
    }
  }

  async function regenerate() {
    if (!household) return;
    setBusy('code');
    setError(null);
    try {
      const res = await regenerateCode(household.id);
      setCode(res.code);
    } catch (err) {
      setError(frenchError(err));
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <p className="px-5 py-12 text-[14px] text-[#8a8577]">Chargement…</p>;
  if (!household) return <p className="px-5 py-12 text-[14px] text-[#b23a3a]">{error}</p>;

  const active = members.filter((m) => m.status === 'active');
  const pending = members.filter((m) => m.status === 'pending');
  const adminCount = active.filter((m) => m.role === 'admin').length;

  return (
    <div className="min-h-screen bg-[#faf9f6]">
    <main className="mx-auto flex w-full max-w-[640px] flex-col gap-[22px] px-5 pb-12 pt-7 lg:gap-7 lg:px-6 lg:pb-20 lg:pt-12">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[21px] font-extrabold text-[#20241b] lg:text-[26px]">
          Paramètres du foyer
        </h1>
        <div className="flex gap-[18px] lg:gap-5">
          <Link href="/parametres/profil" className="pb-1.5 text-[13px] font-semibold text-[#8a8577] lg:text-[13.5px]">
            Profil
          </Link>
          <span className="border-b-2 border-[#c1622a] pb-1.5 text-[13px] font-bold text-[#c1622a] lg:text-[13.5px]">
            Foyer
          </span>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-[12px] border border-[#f0d9d9] bg-white px-4 py-3 text-[13px] text-[#b23a3a]">
          {error}
        </p>
      )}

      {/* Nom */}
      <section className={`${card} flex flex-col gap-3`}>
        <h2 className={title}>Nom du foyer</h2>
        <form
          className="flex flex-col gap-3 lg:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            run('name', () => renameHousehold(household.id, name.trim()), {
              400: 'Le nom doit contenir entre 2 et 50 caractères.',
            });
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            aria-label="Nom du foyer"
            className="flex-1 rounded-[10px] border-[1.5px] border-[#e6e2da] bg-[#faf9f6] px-3.5 py-3 text-[14px] text-[#20241b] outline-none focus:border-[#c1622a] lg:text-[14.5px]"
          />
          <button
            type="submit"
            disabled={busy === 'name' || name.trim() === household.name || name.trim().length < 2}
            className="rounded-[12px] bg-[#c1622a] px-[22px] py-3 text-[14px] font-bold text-white hover:bg-[#93481a] disabled:opacity-50"
          >
            {busy === 'name' ? '…' : 'Enregistrer'}
          </button>
        </form>
      </section>

      {/* Code d'invitation */}
      <section id="code" className={`${card} flex flex-col gap-3 lg:gap-3.5`}>
        <h2 className={title}>Code d&apos;invitation</h2>
        <p className="hidden text-[13.5px] text-[#8a8577] lg:block">
          Partagez ce code pour inviter un nouveau membre à rejoindre le foyer.
        </p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <span className="flex-1 rounded-[12px] border border-dashed border-[#d8d3c8] bg-[#faf9f6] px-4 py-3.5 text-center font-display text-[16px] font-extrabold tracking-[0.06em] text-[#c1622a] lg:text-left lg:text-[17px]">
            {code || '—'}
          </span>
          <div className="flex gap-2.5">
            <button type="button" onClick={copy} disabled={!code} className={`${btnOutline} flex-1 lg:flex-none`}>
              {copied ? 'Copié ✓' : 'Copier'}
            </button>
            <button type="button" onClick={regenerate} disabled={busy === 'code'} className={`${btnOutline} flex-1 lg:flex-none`}>
              {busy === 'code' ? '…' : 'Régénérer'}
            </button>
          </div>
        </div>
      </section>

      {/* Membres */}
      <section className={`${card} flex flex-col gap-3.5 lg:gap-4`}>
        <div className="flex items-center justify-between">
          <h2 className={title}>Membres · {active.length}</h2>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="hidden rounded-[10px] bg-[#c1622a] px-4 py-[9px] text-[13px] font-bold text-white hover:bg-[#93481a] lg:block"
          >
            + Inviter un membre
          </button>
        </div>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="rounded-[12px] bg-[#c1622a] py-[11px] text-center text-[13.5px] font-bold text-white hover:bg-[#93481a] lg:hidden"
        >
          + Inviter un membre
        </button>

        <ul className="flex flex-col gap-2.5">
          {[...pending, ...active].map((m, i) => {
            const isMe = m.userId === me;
            const isPending = m.status === 'pending';
            const lastAdmin = m.role === 'admin' && adminCount <= 1;
            return (
              <li key={m.userId} className="flex flex-wrap items-center gap-3 rounded-[14px] bg-[#faf9f6] p-3 lg:gap-3.5 lg:px-3.5 lg:py-3">
                <Avatar m={m} index={i} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-bold text-[#20241b] lg:text-[14px]">
                    {m.firstName} {m.lastName}
                    {isMe && ' (vous)'}
                  </p>
                  <p className="text-[11px] text-[#8a8577] lg:text-[12px]">
                    {isPending ? "En attente d'acceptation" : ROLE_LABEL[m.role]}
                  </p>
                </div>

                {isPending ? (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={busy === m.userId}
                      onClick={() => run(m.userId, () => approveMember(household.id, m.userId))}
                      className="text-[12.5px] font-bold text-[#2f6f4e] disabled:opacity-50"
                    >
                      Accepter
                    </button>
                    <button
                      type="button"
                      disabled={busy === m.userId}
                      onClick={() => run(m.userId, () => rejectMember(household.id, m.userId))}
                      className="text-[12.5px] font-bold text-[#b23a3a] disabled:opacity-50"
                    >
                      Refuser
                    </button>
                  </div>
                ) : !isMe ? (
                  <div className="flex items-center gap-3">
                    <select
                      aria-label={`Rôle de ${m.firstName}`}
                      value={m.role}
                      disabled={busy === m.userId}
                      onChange={(e) =>
                        run(m.userId, () => updateMemberRole(household.id, m.userId, e.target.value as HouseholdRole), {
                          409: 'Il doit rester au moins un administrateur.',
                        })
                      }
                      className="rounded-full bg-[#ece8e0] px-3 py-1 text-[12px] font-bold text-[#6b6459]"
                    >
                      <option value="admin">Administrateur</option>
                      <option value="member">Membre</option>
                      <option value="guest">Invité</option>
                    </select>
                    {confirmRemove === m.userId ? (
                      <button
                        type="button"
                        disabled={busy === m.userId}
                        onClick={() => run(m.userId, () => removeMember(household.id, m.userId))}
                        className="text-[12.5px] font-bold text-[#b23a3a]"
                      >
                        Confirmer
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmRemove(m.userId)}
                        className="text-[12.5px] font-bold text-[#b23a3a]"
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                ) : (
                  lastAdmin && <span className="text-[11px] text-[#8a8577]">Seul admin</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Danger */}
      <section className="flex flex-col gap-2.5 rounded-[18px] border border-[#f0d9d9] bg-white p-5 lg:gap-4 lg:rounded-[20px] lg:p-7">
        <h2 className="font-display text-[14.5px] font-extrabold text-[#b23a3a] lg:text-[15.5px]">Supprimer le foyer</h2>
        <p className="text-[12.5px] text-[#8a8577] lg:text-[13px]">
          Supprime définitivement le foyer et toutes ses données pour tous les membres.
        </p>
        {confirmDelete ? (
          <div className="flex gap-2.5">
            <button
              type="button"
              disabled={busy === 'delete'}
              onClick={async () => {
                setBusy('delete');
                setError(null);
                try {
                  await deleteHousehold(household.id);
                  router.replace('/foyer');
                } catch (err) {
                  setError(frenchError(err));
                  setBusy(null);
                  setConfirmDelete(false);
                }
              }}
              className="flex-1 rounded-[12px] bg-[#b23a3a] py-[11px] text-[13.5px] font-bold text-white disabled:opacity-50 lg:flex-none lg:px-[18px]"
            >
              {busy === 'delete' ? '…' : 'Confirmer'}
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className={btnOutline}>
              Annuler
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-[12px] border border-[#b23a3a] bg-white py-[11px] text-[13.5px] font-bold text-[#b23a3a] hover:bg-[#fdf3f3] lg:self-start lg:px-[18px]"
          >
            Supprimer le foyer
          </button>
        )}
      </section>
      {inviteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setInviteOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-title"
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-[420px] flex-col gap-4 rounded-[20px] bg-white p-6 shadow-xl"
          >
            <h2 id="invite-title" className="font-display text-[17px] font-extrabold text-[#20241b]">
              Inviter un membre
            </h2>
            <p className="text-[13.5px] text-[#6b6459]">
              Envoyez ce code à la personne. Elle le saisit sur la page « Rejoindre un foyer », puis vous validez sa
              demande ici.
            </p>
            <span className="rounded-[12px] border border-dashed border-[#d8d3c8] bg-[#faf9f6] px-4 py-3.5 text-center font-display text-[18px] font-extrabold tracking-[0.06em] text-[#c1622a]">
              {code || '—'}
            </span>
            <p className="-mb-2 text-[12px] font-semibold text-[#8a8577]">Copier :</p>
            <div className="flex gap-2.5">
              <button type="button" onClick={copy} disabled={!code} className={`${btnOutline} flex-1`}>
                {copied ? 'Copié ✓' : 'Le code'}
              </button>
              <button
                type="button"
                disabled={!code}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `Rejoins mon foyer « ${household.name} » sur Homee'z : ${window.location.origin}/foyer?code=${code}`,
                    );
                    setCopiedMsg(true);
                    setTimeout(() => setCopiedMsg(false), 1800);
                  } catch {
                    setError('Impossible de copier le message. Copiez le code manuellement.');
                  }
                }}
                className={`${btnOutline} flex-1`}
              >
                {copiedMsg ? 'Copié ✓' : 'Le message'}
              </button>
            </div>
            <button
              type="button"
              autoFocus
              onClick={() => setInviteOpen(false)}
              className="text-[13px] font-bold text-[#8a8577] hover:text-[#20241b]"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </main>
    </div>
  );
}

export default function FoyerSettingsPage() {
  return (
    <Suspense fallback={null}>
      <FoyerSettings />
    </Suspense>
  );
}
