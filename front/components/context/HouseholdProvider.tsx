"use client";
import { createContext } from "react";
import { Household } from "@/types/household-types";

export const HouseholdContext = createContext<Household | null>(null);

export function HouseholdProvider({household, children}: { household: Household; children: React.ReactNode}) {
    return (
        <HouseholdContext.Provider value={household}>
            {children}
        </HouseholdContext.Provider>
    );
}