'use client'
import { RoleGuard } from "@/components/guards/RoleGuard"

export default function Budget() {

    return(
        <div>
            <h1>budget</h1>
            <RoleGuard roles={['admin', 'member']}><p>Visible pour admin et membre</p></RoleGuard>
            <RoleGuard roles={['guest']} readOnly><button className="bg-red-300" onClick={() => alert("clic")}>Bouton invité</button></RoleGuard>
        </div>
    )
}