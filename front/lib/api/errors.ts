import { ApiError } from './client';

// Les messages du back sont en anglais : on affiche un message français selon le code HTTP.
// `overrides` permet à chaque écran de préciser le message pour un code donné.
const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'La demande est invalide.',
  401: 'Votre session a expiré, reconnectez-vous.',
  403: "Vous n'avez pas les droits pour cette action.",
  404: 'Élément introuvable.',
  409: 'Cette action est en conflit avec l’état actuel.',
};

export function frenchError(
  error: unknown,
  overrides: Partial<Record<number, string>> = {},
): string {
  if (error instanceof ApiError) {
    return overrides[error.status] ?? DEFAULT_MESSAGES[error.status] ?? 'Une erreur est survenue.';
  }
  // fetch rejeté : back injoignable ou CORS
  if (error instanceof TypeError) return 'Impossible de joindre le serveur.';
  return 'Une erreur est survenue.';
}
