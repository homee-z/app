'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { frenchError } from '@/lib/errors';
import { listMyHouseholds, removeMember, type Household } from '@/lib/api/households.api';

const card = 'rounded-[18px] bg-white p-5 sm:rounded-[20px] sm:p-7';
const cardTitle = 'font-display text-[15px] font-extrabold text-[#20241b]';
const ROLE_LABEL = { admin: 'Admin', member: 'Membre', guest: 'Invité' } as const;
const smallBtn =
  'rounded-[9px] border bg-white px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-60';

export function HouseholdsCard({ userId }: { userId: string }) {
  const [items, setItems] = useState<Household[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setItems(await listMyHouseholds());
      } catch (e) {
        setError(frenchError(e));
        setItems([]);
      }
    })();
  }, [version]);

  async function leave(h: Household) {
    setBusyId(h.id);
    setError(null);
    try {
      await removeMember(h.id, userId);
      setConfirmId(null);
      setVersion((v) => v + 1);
    } catch (e) {
      setError(
        frenchError(e, {
          409: 'Vous êtes le dernier administrateur : désignez un autre admin avant de partir.',
        }),
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className={`${card} space-y-3.5`}>
      <h2 className={cardTitle}>Vos foyers</h2>

      {error && <p className="text-[13px] text-[#b23a3a]">{error}</p>}

      {items === null && <p className="text-[13px] text-[#8a8577]">Chargement…</p>}

      {items?.length === 0 && !error && (
        <p className="text-[13px] text-[#8a8577]">
          Vous n&apos;avez pas encore de foyer.{' '}
          <Link href="/foyer" className="font-bold text-[#c1622a] underline">
            Créer ou rejoindre un foyer
          </Link>
        </p>
      )}

      {items?.map((h) => {
        const pending = h.status === 'pending';
        return (
          <div key={h.id} className="rounded-xl bg-[#faf9f6] px-3.5 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-bold text-[#20241b]">{h.name}</p>
                <p className="text-[11.5px] text-[#8a8577]">
                  {pending
                    ? 'En attente de validation'
                    : `${ROLE_LABEL[h.role]} · ${h.memberCount} membre${h.memberCount > 1 ? 's' : ''}`}
                </p>
              </div>

              {pending ? (
                <button
                  type="button"
                  disabled={busyId === h.id}
                  onClick={() => leave(h)}
                  className={`${smallBtn} border-[#e6e2da] text-[#25291f]`}
                >
                  Annuler la demande
                </button>
              ) : h.role === 'admin' ? (
                <Link
                  href={`/parametres/foyer?foyer=${h.id}`}
                  className={`${smallBtn} border-[#e6e2da] text-[#25291f]`}
                >
                  Gérer
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmId(h.id)}
                  className={`${smallBtn} border-[#f0d9d9] text-[#b23a3a]`}
                >
                  Quitter
                </button>
              )}
            </div>

            {confirmId === h.id && (
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#ece8e0] pt-3">
                <p className="text-[12.5px] text-[#6b6459]">Quitter « {h.name} » ?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    className={`${smallBtn} border-[#e6e2da] text-[#25291f]`}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    disabled={busyId === h.id}
                    onClick={() => leave(h)}
                    className={`${smallBtn} border-[#b23a3a] text-[#b23a3a]`}
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
