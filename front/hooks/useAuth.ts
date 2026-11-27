"use client";
import { useContext } from "react";
import { AuthContext } from "@/components/context/AuthProvider";

export function useAuth() {

    const user = useContext(AuthContext);   

    if(!user){
        throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
    }

    return user;
}