import { apiFetch } from "@/lib/api/api.client";
import { LoginResult, RegisterResult } from "@/types/user.types";


export async function login(email: string, password: string) : Promise<LoginResult> {
    return apiFetch<LoginResult>(
        "/auth/login",
        {
            method : "POST",
            body : JSON.stringify({email, password})
        }
    )
}

export async function logout() : Promise<{ message: string }> {
    return apiFetch<{ message: string }>(
        "/auth/logout",
        {
            method : "POST",
        }
    )
}

export async function register(email: string, password: string, firstName: string, lastName: string) : Promise<RegisterResult> { 
    return apiFetch<RegisterResult>(
        "/auth/register",
        {
            method : "POST",
            body : JSON.stringify({email, password, firstName, lastName})
        }
    )
}

