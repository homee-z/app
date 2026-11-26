'use client';

import { Suspense, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProfile } from '@/lib/api/users.api';
import { frenchError } from '@/lib/errors';
import {
  createHousehold,
  joinHousehold,
  listMyHouseholds,
  removeMember,
} from '@/lib/api/households.api';
import { ApiError } from '@/lib/errors';

type View = 'loading' | 'choice' | 'create' | 'join' | 'pending';

const input =
  'w-full rounded-xl border-[1.5px] border-[#e6e2da] bg-[#faf9f6] px-4 py-3.5 text-[15px] text-[#20241b] placeholder:text-[#9a958d] focus:border-[#c1622a] focus:outline-none';
const primaryBtn =
  'w-full rounded-xl bg-[#c1622a] px-7 py-[15px] text-[15.5px] font-bold text-white transition-colors hover:bg-[#93481a] disabled:cursor-not-allowed disabled:opacity-60';
const backLink = 'self-start text-[13.5px] font-bold text-[#c1622a] underline';

const JOIN_ERRORS = {
  400: "Ce code n'est pas valide (6 caractères).",
  404: 'Aucun foyer ne correspond à ce code.',
  409: 'Vous avez déjà une demande en cours ou vous êtes déjà membre de ce foyer.',
};

function Shell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white lg:flex">
      {/* Panneau gauche (desktop) */}
      <aside className="relative hidden w-[520px] shrink-0 flex-col justify-between overflow-hidden bg-[#c1622a] p-16 lg:flex">
        {/* Formes décoratives translucides */}
        <div className="pointer-events-none absolute -left-20 -top-[100px] size-[340px] rounded-[263px_246px_102px_238px] bg-white/[0.08]" />
        <div className="pointer-events-none absolute -bottom-[140px] -right-[100px] size-[380px] rounded-[114px_266px_95px_285px] bg-white/[0.06]" />
        <span className="font-display relative text-[26px] font-extrabold text-white">homeez</span>
        <div className="relative space-y-3">
          <p className="font-display text-[30px] font-bold leading-[39px] text-white">
            Organisez votre foyer,
            <br />
            ensemble.
          </p>
          <p className="text-[15.5px] leading-6 text-white/85">
            La vie de famille, simplifiée au quotidien.
          </p>
        </div>
      </aside>
      {/* Cercle décoratif (mobile) */}
      <div className="pointer-events-none absolute -right-[50px] -top-[60px] size-[220px] rounded-full bg-[#faefea] lg:hidden" />
      <main className="relative flex flex-1 items-center justify-center px-7 py-10 lg:p-16">
        <div className={`w-full max-w-[400px] ${wide ? 'lg:max-w-[640px]' : ''}`}>
          <span className="font-display mb-8 block text-xl font-extrabold text-[#25291f] lg:hidden">
            home<span className="text-[#c1622a]">ez</span>
          </span>
          {children}
        </div>
      </main>
    </div>
  );
}

function FoyerContent() {
  const router = useRouter();
  // Lien d'invitation : /foyer?code=K7M2QX ouvre directement « Rejoindre » avec le code rempli.
  const params = useSearchParams();
  const codeFromUrl = params.get('code');
  const [view, setView] = useState<View>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [profile, households] = await Promise.all([getProfile(), listMyHouseholds()]);
        setUserId(profile.id);
        if (households.some((h) => h.status === 'active')) {
          router.replace('/dashboard');
          return;
        }
        const pending = households.find((h) => h.status === 'pending');
        if (pending) {
          setPendingId(pending.id);
          setView('pending');
        } else if (codeFromUrl) {
          setCode(codeFromUrl.trim().toUpperCase());
          setView('join');
        } else {
          setView('choice');
        }
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) router.replace('/login');
        else {
          setError(frenchError(e));
          setView('choice');
        }
      }
    })();
  }, [router, codeFromUrl]);

  const go = (v: View) => {
    setError(null);
    setView(v);
  };

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createHousehold(name);
      router.push('/dashboard');
    } catch (err) {
      setError(frenchError(err));
      setBusy(false);
    }
  }

  async function onJoin(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const h = await joinHousehold(code.trim());
      setPendingId(h.id);
      setView('pending');
    } catch (err) {
      setError(frenchError(err, JOIN_ERRORS));
    } finally {
      setBusy(false);
    }
  }

  async function onCancel() {
    if (!pendingId || !userId) return;
    setBusy(true);
    setError(null);
    try {
      await removeMember(pendingId, userId);
      setPendingId(null);
      setCode('');
      setView('choice');
    } catch (err) {
      setError(frenchError(err));
    } finally {
      setBusy(false);
    }
  }

  if (view === 'loading') return <Shell>{null}</Shell>;

  return (
    <Shell wide={view === 'choice'}>
      {view === 'choice' && (
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="font-display text-[23px] font-extrabold leading-[27.6px] text-[#20241b] lg:text-[30px] lg:leading-normal">
              Bienvenue ! Créez ou rejoignez un foyer
            </h1>
            <p className="text-[14px] text-[#6b6459] lg:text-[15px]">
              Un foyer regroupe les membres de votre famille sur homeez.
            </p>
          </div>
          {error && <p className="text-[13px] text-[#b23a3a]">{error}</p>}
          <div className="flex flex-col gap-3.5 lg:flex-row lg:gap-5">
            <button
              type="button"
              onClick={() => go('create')}
              className="space-y-3.5 rounded-2xl border border-[#e6e2da] p-5 text-left transition-colors hover:border-[#c1622a] lg:p-7"
            >
              <span className="flex size-10 items-center justify-center rounded-[12px] bg-[#f8e9e1] lg:size-12 lg:rounded-[14px_34px_13px_35px]">
                <span className="relative size-4">
                  <span className="absolute left-0 top-[7px] h-0.5 w-4 bg-[#c1622a]" />
                  <span className="absolute left-[7px] top-0 h-4 w-0.5 bg-[#c1622a]" />
                </span>
              </span>
              <span className="font-display block text-[15.5px] font-extrabold text-[#20241b] lg:text-[17px]">
                Créer un foyer
              </span>
              <span className="block text-[13px] leading-5 text-[#6b6459] lg:text-[13.5px]">
                Vous êtes le premier ? Créez le foyer et invitez les autres ensuite.
              </span>
            </button>
            <button
              type="button"
              onClick={() => go('join')}
              className="space-y-3.5 rounded-2xl border border-[#e6e2da] p-5 text-left transition-colors hover:border-[#c1622a] lg:p-7"
            >
              <span className="flex size-10 items-center justify-center rounded-[12px] bg-[#f8e9e1] lg:size-12 lg:rounded-[35px_13px_38px_10px]">
                <span className="size-3.5 rounded-full border-2 border-[#c1622a] lg:size-4" />
              </span>
              <span className="font-display block text-[15.5px] font-extrabold text-[#20241b] lg:text-[17px]">
                Rejoindre un foyer
              </span>
              <span className="block text-[13px] leading-5 text-[#6b6459] lg:text-[13.5px]">
                On vous a donné un code ? Rejoignez un foyer existant.
              </span>
            </button>
          </div>
        </div>
      )}

      {view === 'create' && (
        <form onSubmit={onCreate} className="flex flex-col gap-6">
          <button type="button" onClick={() => go('choice')} className={backLink}>
            ← Retour
          </button>
          <div className="space-y-2">
            <h1 className="font-display text-[23px] font-extrabold text-[#20241b] lg:text-[30px]">
              Créer votre foyer
            </h1>
            <p className="text-[14px] text-[#6b6459] lg:text-[15px]">
              Vous pourrez inviter les autres membres juste après.
            </p>
          </div>
          <input
            className={input}
            aria-label="Nom du foyer"
            placeholder="Nom du foyer (ex : Famille Martin)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            required
            autoFocus
          />
          {error && <p className="text-[13px] text-[#b23a3a]">{error}</p>}
          <button type="submit" disabled={busy || name.trim().length < 2} className={primaryBtn}>
            {busy ? 'Création…' : 'Créer le foyer'}
          </button>
        </form>
      )}

      {view === 'join' && (
        <form onSubmit={onJoin} className="flex flex-col gap-6">
          <button type="button" onClick={() => go('choice')} className={backLink}>
            ← Retour
          </button>
          <div className="space-y-2">
            <h1 className="font-display text-[23px] font-extrabold text-[#20241b] lg:text-[30px]">
              Rejoindre un foyer
            </h1>
            <p className="text-[14px] text-[#6b6459] lg:text-[15px]">
              Saisissez le code fourni par l&apos;administrateur du foyer.
            </p>
          </div>
          <input
            className={`${input} uppercase tracking-[0.45px] placeholder:normal-case`}
            aria-label="Code du foyer"
            placeholder="Code du foyer (ex : K7M2QX)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={20}
            required
            autoFocus
          />
          {error && <p className="text-[13px] text-[#b23a3a]">{error}</p>}
          <button type="submit" disabled={busy || code.trim().length === 0} className={primaryBtn}>
            {busy ? 'Envoi…' : 'Rejoindre le foyer'}
          </button>
        </form>
      )}

      {view === 'pending' && (
        <div className="flex flex-col items-center gap-[22px] text-center">
          <span className="flex size-[100px] items-center justify-center rounded-[72px_71px_28px_29px] bg-[#f8e9e1] lg:size-[110px]">
            <span className="size-3.5 rotate-12 rounded-[7px] border-2 border-[#c1622a]" />
          </span>
          <div className="space-y-2">
            <h1 className="font-display text-[22px] font-extrabold text-[#20241b] lg:text-[26px]">
              Votre demande a été envoyée
            </h1>
            <p className="text-[14px] leading-[22px] text-[#6b6459] lg:text-[15px]">
              L&apos;administrateur du foyer doit approuver votre demande.
              <br />
              Revenez sur cette page plus tard pour vérifier.
            </p>
          </div>
          {error && <p className="text-[13px] text-[#b23a3a]">{error}</p>}
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="text-[13.5px] font-bold text-[#c1622a] underline disabled:opacity-60"
          >
            ← Annuler la demande
          </button>
        </div>
      )}
    </Shell>
  );
}

// useSearchParams doit être sous un <Suspense> (sinon `next build` échoue sur cette page).
export default function FoyerPage() {
  return (
    <Suspense fallback={null}>
      <FoyerContent />
    </Suspense>
  );
}
