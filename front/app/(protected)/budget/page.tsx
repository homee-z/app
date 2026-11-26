'use client'
import { RoleGuard } from "@/components/guards/RoleGuard"
import { UserRole } from "@/types/user.types"

export default function Budget() {

    return(
        <div>
            <h1>budget</h1>
            <RoleGuard roles={[UserRole.admin, UserRole.member]}><p>Visible pour admin et membre</p></RoleGuard>
            <RoleGuard roles={[UserRole.guest]} readOnly><button className="bg-red-300" onClick={() => alert("clic")}>Bouton invité</button></RoleGuard>
        </div>
    )
}