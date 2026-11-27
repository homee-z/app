"use client";
import { useContext } from "react";
import { HouseholdContext } from "@/components/context/HouseholdProvider";

export function useRole() {

    const household = useContext(HouseholdContext);

    if(!household){
        throw new Error("useRole doit être utilisé à l'intérieur d'un HouseHoldProvider");
    }

    const role = household.role;
    const isAdmin = role === 'admin'; 
    const isMember = role === 'member'; 
    const isGuest = role === 'guest'; 

    return {role, isAdmin, isMember, isGuest};
}