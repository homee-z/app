"use client";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/user.types";

export function useRole() {

    const user = useAuth();

    const role = user.role;
    const isAdmin = user.role === UserRole.admin; 
    const isMember = user.role === UserRole.member; 
    const isGuest = user.role === UserRole.guest; 

    return {role, isAdmin, isMember, isGuest};
}