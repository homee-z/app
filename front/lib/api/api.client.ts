import { UnauthorizedError } from "@/lib/errors";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch<T>(path : string, options : RequestInit = {}, isRetry = false) : Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, 
    {
        ...options,
        headers : { 
            "Content-Type" : "application/json",
            ...options.headers
        },
        credentials: "include",
    });

    if (res.status === 401) {
        if (!path.includes("auth/login") && !path.includes("auth/refresh") && !isRetry) {
            const refreshed = await refreshToken();
            if (refreshed) {
                // referesh réussi donc on relance la requête
                return apiFetch<T>(path, options, true);
            }
        }
        // si la retry est ratée ou le refresh envoie une erreur 
        throw new UnauthorizedError();
    }

    if(!res.ok){
        throw new Error(`Erreur API : ${res.status}`);
    }

    if(res.status === 204){
        // s'il n'y a pas de contenu dans la réponse de la requête
        return undefined as T;
    }

    const json = await res.json();

    return json.data;

}

async function refreshToken() : Promise<boolean> {
    const res = await fetch(`${BASE_URL}/auth/refresh`, 
    {
        method : "POST",
        credentials : "include"
    });

    return res.ok;
}
