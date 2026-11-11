import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request : NextRequest) {
    
    const token = request.cookies.get("access_token");

    if(!token){
        const urlLogin = new URL("/login", request.url);
        return NextResponse.redirect(urlLogin);
    }

    return NextResponse.next();

}

export const config = {
    matcher : [
        "/budget",
        "/chat",
        "/corvees",
        "/courses/:path*",
        "/dashboard",
        "/parametres/:path*",
        "/rappels", 
        "/recettes/:path*",
        "/foyer"
    ] 
}