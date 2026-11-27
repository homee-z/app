"use client";
import { createContext } from "react";
import type { User } from "@/types/user.types";

export const AuthContext = createContext<User | null>(null);

export function AuthProvider({user, children}: {user: User; children: React.ReactNode}) {
    return (
        <AuthContext.Provider value={user}>
            {children}
        </AuthContext.Provider>
    );
}