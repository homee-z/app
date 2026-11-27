export class UnauthorizedError extends Error {
    constructor(message = "Non authentifié") {
        super(message);
        this.name = "UnauthorizedError";
    }
}
export class ApiError extends Error { 
    constructor(
        public status: number, 
        message : string, 
        public errors?: string[]
    ){
        super(message);
        this.name = "ApiError";
    }
}

const DEFAULT_MESSAGES: Record<number, string> = {
    400: "La demande est invalide.",
    401: "Votre session a expiré, reconnectez-vous.",
    403: "Vous n'avez pas les droits pour cette action.",
    404: "Élément introuvable.",
    409: "Cette action est en conflit avec l’état actuel.",
};

export function frenchError(
    error: unknown,
    overrides: Partial<Record<number, string>> = {},
): string {
    if (error instanceof UnauthorizedError) {
        return overrides[401] ?? DEFAULT_MESSAGES[401];
    }
    if (error instanceof ApiError) {
        return overrides[error.status] ?? DEFAULT_MESSAGES[error.status] ?? "Une erreur est survenue.";
    }
    // fetch rejeté : back injoignable ou CORS
    if (error instanceof TypeError) return "Impossible de joindre le serveur.";
    return "Une erreur est survenue.";
}