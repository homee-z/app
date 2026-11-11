import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/error";
import type { User } from "@/types/user-types";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {

    let user: User | null = null;

    try {
        user = await getCurrentUser();
    } catch (error) {
        if(error instanceof UnauthorizedError) {
            redirect("/login")
        }
        throw error

    }

    if (!user) {
        redirect("/login")
    }

    if(user.householdId === null) {
        redirect("/foyer")
    }

    return <>{children}</>;
}