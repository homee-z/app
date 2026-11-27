import { request } from "@/lib/api/api.client";
import { LoginResult, RegisterResult } from "@/types/user.types";


export async function login(email: string, password: string) : Promise<LoginResult> {
    return request<LoginResult>(
        "/auth/login",
        {
            method : "POST",
            body : JSON.stringify({email, password})
        }
    )
}

export async function logout() : Promise<{ message: string }> {
    return request<{ message: string }>(
        "/auth/logout",
        {
            method : "POST",
        }
    )
}

export async function register(email: string, password: string, firstName: string, lastName: string) : Promise<RegisterResult> { 
    return request<RegisterResult>(
        "/auth/register",
        {
            method : "POST",
            body : JSON.stringify({email, password, firstName, lastName})
        }
    )
}

