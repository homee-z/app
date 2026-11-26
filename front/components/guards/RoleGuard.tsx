"use client";
import { useRole } from "@/hooks/useRole";
import { UserRole } from "@/types/user.types";

type RoleGuardProps = {
    roles: UserRole[];
    children: React.ReactNode;
    readOnly?: boolean;
};

export function RoleGuard({ roles, children, readOnly }: RoleGuardProps) {
    const { role } = useRole();
    const hasRole = roles.includes(role);
    console.log(role, hasRole);

    if (!hasRole) return null;

    if (readOnly) {
        return <div inert className="opacity-60">{children}</div>;
    }

    if(hasRole){
        return children;
    }

    return null;

}