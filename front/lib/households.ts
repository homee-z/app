import { cookies } from "next/headers";
import { ApiError, UnauthorizedError } from "@/lib/errors";
import type { Household } from "@/types/household-types";

export async function getMyHouseholds(): Promise<Household[]> {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
        throw new UnauthorizedError();
    }
    
    const res = await fetch(`${process.env.API_URL}/households/me`, {
        headers: { Cookie: `access_token=${token}` },
        cache: "no-store",
    });
    
    if (res.status === 401) {
        throw new UnauthorizedError();
    }

    if (!res.ok) {
        throw new ApiError(res.status, `Erreur API : ${res.status}`);
    }

    const json = await res.json();
    return json.data;
}