// lib/auth.ts
import { cookies } from "next/headers";
import { UnauthorizedError } from "@/lib/error";
import type { User } from "@/types/user-types";

export async function getCurrentUser(): Promise<User> {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
        throw new UnauthorizedError();
    }

    const res = await fetch(`${process.env.API_URL}/auth/me`, {
        headers: { Cookie: `access_token=${token}` },
        cache: "no-store",
    });

    if (res.status === 401) {
        throw new UnauthorizedError();
    }

    if (!res.ok) {
        throw new Error(`Erreur API : ${res.status}`);
    }

    const json = await res.json();
    return json.data;
}